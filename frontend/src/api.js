import axios from 'axios';

// Use relative path when in production, absolute URL in dev
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Meters API
export const metersApi = {
  getAll: () => api.get('/meters'),
  getById: (id) => api.get(`/meters/${id}`),
  create: (name) => api.post('/meters', { name }),
  update: (id, name) => api.put(`/meters/${id}`, { name }),
  delete: (id) => api.delete(`/meters/${id}`),
};

// Sessions API (replaces readings)
export const sessionsApi = {
  getAll: (limit = 100, offset = 0) => 
    api.get('/sessions', { params: { limit, offset } }),
  getById: (id) => api.get(`/sessions/${id}`),
  create: (data) => api.post('/sessions', data),
  update: (id, data) => api.put(`/sessions/${id}`, data),
  delete: (id) => api.delete(`/sessions/${id}`),
  getStatistics: (startDate, endDate) => 
    api.get('/sessions/stats/all', { params: { start_date: startDate, end_date: endDate } }),
  getMeterStatistics: (meterId, startDate, endDate) => 
    api.get(`/sessions/stats/meter/${meterId}`, { params: { start_date: startDate, end_date: endDate } }),
  getTrend: (groupBy = 'day', limit = 30) => 
    api.get('/sessions/trend/all', { params: { group_by: groupBy, limit } }),
};

export default api;
