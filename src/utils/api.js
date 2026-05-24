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

  updateGoals: async (goals) => {
    const res = await fetch(`${API_BASE_URL}/auth/goals`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(goals),
    });
    return await handleResponse(res);
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  // Dashboard endpoint
  getTodaySummary: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return await handleResponse(res);
  },

  // Workout endpoints
  getWorkoutHistory: async () => {
    const res = await fetch(`${API_BASE_URL}/workouts/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return await handleResponse(res);
  },

  logWorkout: async (workoutData) => {
    const res = await fetch(`${API_BASE_URL}/workouts/log`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(workoutData),
    });
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

  logFood: async (foodData) => {
    const res = await fetch(`${API_BASE_URL}/nutrition/food`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(foodData),
    });
    return await handleResponse(res);
  },

  logWater: async (amountMl) => {
    const res = await fetch(`${API_BASE_URL}/nutrition/water`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amountMl }),
    });
    return await handleResponse(res);
  },

  // Wellness endpoints
  getWellnessHistory: async () => {
    const res = await fetch(`${API_BASE_URL}/wellness/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return await handleResponse(res);
  },

  logWellness: async (wellnessData) => {
    const res = await fetch(`${API_BASE_URL}/wellness/log`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(wellnessData),
    });
    return await handleResponse(res);
  },
};
