import apiClient from '../api/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/api/auth/login', { username: email, password });
    return response.data;
  },

  register: async (username, email, password) => {
    const response = await apiClient.post('/api/auth/register', { username, email, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getGoogleAuthUrl: () => {
    return `${API_BASE_URL}/oauth2/authorization/google`;
  },
};

export default authService;
