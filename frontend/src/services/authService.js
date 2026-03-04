import apiClient from '../api/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { username: email, password });
    return response.data;
  },

  register: async (registrationData) => {
    // Clean up the data - remove fields that are not needed for this role
    const cleanData = { ...registrationData };
    
    // Remove confirmPassword as backend doesn't need it
    delete cleanData.confirmPassword;
    
    // Remove null or undefined values
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === null || cleanData[key] === undefined || cleanData[key] === '') {
        delete cleanData[key];
      }
    });
    
    const response = await apiClient.post('/auth/register', cleanData);
    return response.data;
  },

  completeProfile: async (profileData) => {
    const response = await apiClient.patch('/users/complete-profile', profileData);
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
