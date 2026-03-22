import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Global Axios instance with interceptors for authentication
 * - Automatically attaches JWT token to all requests
 * - Handles 401 Unauthorized responses globally
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor: Attach JWT token to every request
 */
apiClient.interceptors.request.use(
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

/**
 * Response Interceptor: Handle 401 Unauthorized globally
 * When backend returns 401:
 * 1. Clear authentication token from localStorage
 * 2. Force redirect to login page (full page reload)
 * 3. AuthContext will be reinitialized on reload with user = null
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - user session expired or invalid token
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized. Redirecting to login...');
      
      // Clear authentication token
      localStorage.removeItem('token');
      
      // Force redirect to login page (causes full page reload)
      // This will reset AuthContext and clear user state
      window.location.href = '/login';
      
      // Return a rejected promise with a clear message
      return Promise.reject({
        ...error,
        message: 'Session expired. Please log in again.'
      });
    }
    
    // For other errors, pass them through
    return Promise.reject(error);
  }
);

export default apiClient;
