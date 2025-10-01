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

// Readings API
export const readingsApi = {
  getAll: (meterId, limit = 100, offset = 0) => 
    api.get('/readings', { params: { meter_id: meterId, limit, offset } }),
  getById: (id) => api.get(`/readings/${id}`),
  create: (data) => api.post('/readings', data),
  update: (id, data) => api.put(`/readings/${id}`, data),
  delete: (id) => api.delete(`/readings/${id}`),
  getStatistics: (meterId, startDate, endDate) => 
    api.get(`/readings/stats/${meterId}`, { params: { start_date: startDate, end_date: endDate } }),
  getTrend: (meterId, groupBy = 'day', limit = 30) => 
    api.get(`/readings/trend/${meterId}`, { params: { group_by: groupBy, limit } }),
};

export default api;
