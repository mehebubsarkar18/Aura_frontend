const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

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

const handleResponse = async (response, originalRequest) => {
  if (response.status === 401) {
    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          resolve(fetchWithRefresh(originalRequest.url, {
            ...originalRequest.options,
            headers: {
              ...originalRequest.options.headers,
              'Authorization': `Bearer ${token}`
            }
          }));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem('token', data.token);
        isRefreshing = false;
        onTokenRefreshed(data.token);
        
        // Retry original request
        return fetchWithRefresh(originalRequest.url, {
          ...originalRequest.options,
          headers: {
            ...originalRequest.options.headers,
            'Authorization': `Bearer ${data.token}`
          }
        });
      } else {
        // Refresh failed, logout
        isRefreshing = false;
        api.logout();
        throw new Error('Session expired. Please log in again.');
      }
    } catch (err) {
      isRefreshing = false;
      api.logout();
      throw err;
    }
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    if (!response.ok) {
      throw new Error(`Server Error (${response.status}): ${response.statusText}`);
    }
    throw new Error('Invalid response format from server');
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }
  return data;
};

const fetchWithRefresh = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
  });
  
  // We only want to handle refresh if it's NOT the refresh call itself
  if (res.status === 401 && !url.includes('/auth/refresh') && !url.includes('/auth/login')) {
    return handleResponse(res, { url, options });
  }

  return handleResponse(res);
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
  getCached: getCache,
  // Auth endpoints
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
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
      credentials: 'include',
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('token', data.token);
      clearCache();
    }
    return data;
  },

  getMe: async (useCache = true) => {
    const cacheKey = 'user_me';
    if (useCache) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
    }
    const data = await fetchWithRefresh(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    setCache(cacheKey, data);
    return data;
  },

  completeOnboarding: async (profileData) => {
    return await fetchWithRefresh(`${API_BASE_URL}/auth/onboarding`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    clearCache('user_me');
  },

  updateGoals: async (goals) => {
    const data = await fetchWithRefresh(`${API_BASE_URL}/auth/goals`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(goals),
    });
    clearCache('dashboard'); // Specific cache invalidation
    clearCache('user_me');
    return data;
  },

  changePassword: async (passwordData) => {
    return await fetchWithRefresh(`${API_BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(passwordData),
    });
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error', err);
    }
    localStorage.removeItem('token');
    clearCache();
    window.location.reload(); // Force reload to clear state
  },

  getPublicStats: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/stats?t=${Date.now()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return await handleResponse(res);
  },

  submitPublicRating: async (rating) => {
    return await fetchWithRefresh(`${API_BASE_URL}/auth/rating`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
  },

  // Dashboard endpoint
  getTodaySummary: async (date, useCache = true) => {
    // We use a local date string for the cache key to stay consistent with the user's "today"
    const localDate = new Date();
    const todayStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
    const isToday = !date || date === todayStr;
    const cacheKey = `dashboard_summary_${isToday ? 'today' : date}`;
    
    if (useCache) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
    }

    let url;
    if (isToday) {
      // Calculate local day boundaries as UTC strings
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      url = `${API_BASE_URL}/dashboard/summary?start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`;
    } else {
      url = `${API_BASE_URL}/dashboard/summary?date=${date}`;
    }
    
    const data = await fetchWithRefresh(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    setCache(cacheKey, data);
    return data;
  },

  getDashboardHistory: async (useCache = true) => {
    const cacheKey = 'dashboard_history';
    if (useCache) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
    }

    const data = await fetchWithRefresh(`${API_BASE_URL}/dashboard/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
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

    const data = await fetchWithRefresh(`${API_BASE_URL}/workouts/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
    setCache(cacheKey, data);
    return data;
  },

  logWorkout: async (workoutData) => {
    const data = await fetchWithRefresh(`${API_BASE_URL}/workouts/log`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(workoutData),
    });
    clearCache('dashboard');
    clearCache('workout');
    clearCache('reports');
    return data;
  },

  // Nutrition endpoints
  getTodayNutrition: async () => {
    return await fetchWithRefresh(`${API_BASE_URL}/nutrition/today`, {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  getNutritionHistory: async (date) => {
    const url = date 
      ? `${API_BASE_URL}/nutrition/history?date=${date}`
      : `${API_BASE_URL}/nutrition/history`;
    
    return await fetchWithRefresh(url, {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  logFood: async (foodData) => {
    const data = await fetchWithRefresh(`${API_BASE_URL}/nutrition/food`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(foodData),
    });
    clearCache('dashboard');
    clearCache('reports');
    return data;
  },

  logWater: async (amountMl) => {
    const data = await fetchWithRefresh(`${API_BASE_URL}/nutrition/water`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amountMl }),
    });
    clearCache('dashboard');
    clearCache('reports');
    return data;
  },

  deleteFood: async (foodId) => {
    const data = await fetchWithRefresh(`${API_BASE_URL}/nutrition/food/${foodId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    clearCache('dashboard');
    clearCache('reports');
    return data;
  },

  // Wellness endpoints
  getWellnessHistory: async (useCache = true) => {
    const cacheKey = 'wellness_history';
    if (useCache) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
    }

    const data = await fetchWithRefresh(`${API_BASE_URL}/wellness/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
    setCache(cacheKey, data);
    return data;
  },

  logWellness: async (wellnessData) => {
    const data = await fetchWithRefresh(`${API_BASE_URL}/wellness/log`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(wellnessData),
    });
    clearCache('dashboard');
    clearCache('wellness');
    clearCache('reports');
    return data;
  },
  
  deleteWellnessLog: async (id) => {
    const data = await fetchWithRefresh(`${API_BASE_URL}/wellness/log/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    clearCache('dashboard');
    clearCache('wellness');
    clearCache('reports');
    return data;
  },

  // Weight endpoints
  getWeightHistory: async (useCache = true) => {
    const cacheKey = 'weight_history';
    if (useCache) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
    }

    const data = await fetchWithRefresh(`${API_BASE_URL}/weight/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
    setCache(cacheKey, data);
    return data;
  },

  logWeight: async (weightData) => {
    const data = await fetchWithRefresh(`${API_BASE_URL}/weight/log`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(weightData),
    });
    clearCache('dashboard');
    clearCache('weight');
    clearCache('reports');
    return data;
  },

  // Report endpoints
  getReportData: async (type, useCache = true) => {
    const cacheKey = `reports_summary_${type}`;
    if (useCache) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
    }

    const data = await fetchWithRefresh(`${API_BASE_URL}/reports/summary?type=${type}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    setCache(cacheKey, data);
    return data;
  },

  shareReport: async (type, email, reportData) => {
    return await fetchWithRefresh(`${API_BASE_URL}/reports/share`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ type, email, reportData }),
    });
  },

  // AI endpoints
  askAI: async (message, userContext) => {
    return await fetchWithRefresh(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, userContext }),
    });
  },
};
