import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсептор для добавления Basic Auth (если нужно)
api.interceptors.request.use((config) => {
  const credentials = localStorage.getItem('admin_credentials');
  if (credentials) {
    config.headers.Authorization = `Basic ${credentials}`;
  }
  return config;
});

// Интерсептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// Cities API
export const citiesAPI = {
  getAll: () => api.get('/cities'),
  getById: (id) => api.get(`/cities/${id}`),
  create: (data) => api.post('/cities', data),
  update: (id, data) => api.put(`/cities/${id}`, data),
  delete: (id) => api.delete(`/cities/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Instruments API
export const instrumentsAPI = {
  getAll: (params) => api.get('/instruments', { params }),
  getById: (id) => api.get(`/instruments/${id}`),
  create: (data) => api.post('/instruments', data),
  update: (id, data) => api.put(`/instruments/${id}`, data),
  archive: (id, archived) => api.patch(`/instruments/${id}/archive`, { archived }),
  delete: (id) => api.delete(`/instruments/${id}`),
};

// Export API
export const exportAPI = {
  downloadExcel: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return `${API_BASE_URL}/api/export/instruments.xlsx?${queryString}`;
  },
};

export default api;
