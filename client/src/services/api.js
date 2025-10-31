import axios from 'axios';

// In production (Railway), use relative URL. In development, use localhost.
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Relative URL for production (same domain)
  : process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getLoginActivity: (params) => api.get('/auth/login-activity', { params }),
};

// Items API
export const itemsAPI = {
  getAll: (params) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`),
  adjustQuantity: (id, data) => api.post(`/items/${id}/adjust-quantity`, data),
  getCategories: () => api.get('/items/categories/list'),
};

// Transactions API
export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  checkout: (data) => api.post('/transactions/checkout', data),
  return: (id, data) => api.post(`/transactions/${id}/return`, data),
  approve: (id) => api.post(`/transactions/${id}/approve`),
  reject: (id, data) => api.post(`/transactions/${id}/reject`, data),
  extend: (id, data) => api.post(`/transactions/${id}/extend`, data),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  resetPassword: (id, data) => api.put(`/users/${id}/reset-password`, data),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getItemUtilization: () => api.get('/analytics/item-utilization'),
  getUserActivity: () => api.get('/analytics/user-activity'),
  getOverduePatterns: () => api.get('/analytics/overdue-patterns'),
};

// QR Code API
export const qrAPI = {
  generate: (itemId) => api.get(`/qr/generate/${itemId}`),
  scan: (data) => api.post('/qr/scan', data),
  getItemByQRCode: (qrCode) => api.get(`/qr/item/${qrCode}`),
};

// Guest Requests API (public submit, auth for review)
export const guestRequestsAPI = {
  submit: (data) => api.post('/guest-requests', data, { headers: { Authorization: undefined } }),
  list: () => api.get('/guest-requests'),
  approve: (id) => api.post(`/guest-requests/${id}/approve`),
  reject: (id, data) => api.post(`/guest-requests/${id}/reject`, data),
};

export default api;

