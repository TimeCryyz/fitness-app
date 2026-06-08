import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    console.log('Interceptor - token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } catch (err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  refresh: (refreshToken) => api.post('/auth/token/refresh/', { refresh: refreshToken }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
};

export const workouts = {
  getAll: (params) => api.get('/workouts/', { params }),
  getById: (id) => api.get(`/workouts/${id}/`),
  create: (data) => api.post('/workouts/', data),
  update: (id, data) => api.put(`/workouts/${id}/`, data),
  delete: (id) => api.delete(`/workouts/${id}/`),
  incrementViews: (id) => api.post(`/workouts/${id}/increment_views/`),
  getMyWorkouts: () => api.get('/workouts/my_workouts/'),
};

export const categories = {
  getAll: () => api.get('/categories/'),
};

export const comments = {
  getByWorkout: (workoutId) => api.get('/comments/', { params: { workout_id: workoutId } }),
  create: (data) => api.post('/comments/', data),
  delete: (id) => api.delete(`/comments/${id}/`),
};

export default api;