const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

// Simple caching logic
const CACHE_PREFIX = 'aura_cache_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCache = (key) => {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
};

const setCache = (key, data) => {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Cache write failed', e);
  }
};

const clearCache = (pattern) => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(CACHE_PREFIX) && (!pattern || key.includes(pattern))) {
      localStorage.removeItem(key);
    }
  });
};

export const api = {
  // Auth endpoints
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('token', data.token);
      clearCache(); // Reset all cache on new login
    }
    return data;
  },

  register: async (fullName, email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('token', data.token);
      clearCache();
    }
    return data;
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return await handleResponse(res);
  },

  completeOnboarding: async (profileData) => {
    const res = await fetch(`${API_BASE_URL}/auth/onboarding`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return await handleResponse(res);
  },

  updateGoals: async (goals) => {
    const res = await fetch(`${API_BASE_URL}/auth/goals`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(goals),
    });
    clearCache('dashboard'); // Specific cache invalidation
    return await handleResponse(res);
  },

  changePassword: async (passwordData) => {
    const res = await fetch(`${API_BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(passwordData),
    });
    return await handleResponse(res);
  },

  logout: () => {
    localStorage.removeItem('token');
    clearCache();
  },

  getPublicStats: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/stats?t=${Date.now()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return await handleResponse(res);
  },

  submitPublicRating: async (rating) => {
    const res = await fetch(`${API_BASE_URL}/auth/rating`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
    return await handleResponse(res);
  },

  // Dashboard endpoint
  getTodaySummary: async (date, useCache = true) => {
    const cacheKey = `dashboard_summary_${date || 'today'}`;
    if (useCache) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
    }

    const url = date 
      ? `${API_BASE_URL}/dashboard/summary?date=${date}`
      : `${API_BASE_URL}/dashboard/summary`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await handleResponse(res);
    setCache(cacheKey, data);
    return data;
  },

  getDashboardHistory: async (useCache = true) => {
    const cacheKey = 'dashboard_history';
    if (useCache) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
    }

    const res = await fetch(`${API_BASE_URL}/dashboard/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await handleResponse(res);
    setCache(cacheKey, data);
    return data;
  },


  // Workout endpoints
  getWorkoutHistory: async (useCache = true) => {
    const cacheKey = 'workout_history';
    if (useCache) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
    }

    const res = await fetch(`${API_BASE_URL}/workouts/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await handleResponse(res);
    setCache(cacheKey, data);
    return data;
  },

  logWorkout: async (workoutData) => {
    const res = await fetch(`${API_BASE_URL}/workouts/log`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(workoutData),
    });
    clearCache('dashboard');
    clearCache('workout');
    return await handleResponse(res);
  },

  // Nutrition endpoints
  getTodayNutrition: async () => {
    const res = await fetch(`${API_BASE_URL}/nutrition/today`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return await handleResponse(res);
  },

  getNutritionHistory: async (date) => {
    const url = date 
      ? `${API_BASE_URL}/nutrition/history?date=${date}`
      : `${API_BASE_URL}/nutrition/history`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    return await handleResponse(res);
  },

  logFood: async (foodData) => {
    const res = await fetch(`${API_BASE_URL}/nutrition/food`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(foodData),
    });
    clearCache('dashboard');
    return await handleResponse(res);
  },

  logWater: async (amountMl) => {
    const res = await fetch(`${API_BASE_URL}/nutrition/water`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amountMl }),
    });
    clearCache('dashboard');
    return await handleResponse(res);
  },

  deleteFood: async (foodId) => {
    const res = await fetch(`${API_BASE_URL}/nutrition/food/${foodId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    clearCache('dashboard');
    return await handleResponse(res);
  },

  // Wellness endpoints
  getWellnessHistory: async (useCache = true) => {
    const cacheKey = 'wellness_history';
    if (useCache) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
    }

    const res = await fetch(`${API_BASE_URL}/wellness/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await handleResponse(res);
    setCache(cacheKey, data);
    return data;
  },

  logWellness: async (wellnessData) => {
    const res = await fetch(`${API_BASE_URL}/wellness/log`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(wellnessData),
    });
    clearCache('dashboard');
    clearCache('wellness');
    return await handleResponse(res);
  },
  
  deleteWellnessLog: async (id) => {
    const res = await fetch(`${API_BASE_URL}/wellness/log/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    clearCache('dashboard');
    clearCache('wellness');
    return await handleResponse(res);
  },

  // Weight endpoints
  getWeightHistory: async (useCache = true) => {
    const cacheKey = 'weight_history';
    if (useCache) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
    }

    const res = await fetch(`${API_BASE_URL}/weight/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await handleResponse(res);
    setCache(cacheKey, data);
    return data;
  },

  logWeight: async (weightData) => {
    const res = await fetch(`${API_BASE_URL}/weight/log`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(weightData),
    });
    clearCache('dashboard');
    clearCache('weight');
    return await handleResponse(res);
  },
};
