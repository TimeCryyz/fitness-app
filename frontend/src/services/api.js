import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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