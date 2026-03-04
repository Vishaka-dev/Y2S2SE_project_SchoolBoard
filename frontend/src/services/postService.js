import axios from 'axios';

// Get base URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_URL,
});

// Add interceptor to include auth token in requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const postService = {
    /**
     * Create a new post
     * @param {Object} postData Object containing content and/or image
     * @returns {Promise} Resolves to the created post data
     */
    createPost: async (postData) => {
        const formData = new FormData();

        // Append fields to FormData
        if (postData.content) {
            formData.append('content', postData.content);
        }

        if (postData.image) {
            formData.append('image', postData.image);
        }

        try {
            // Note: We don't set 'Content-Type': 'multipart/form-data' explicitly here
            // when using FormData, Axios automatically sets it and generates the boundary
            const response = await apiClient.post('/posts', formData);
            return response.data;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error.response?.data || new Error('Network error attempting to create post');
        }
    },

    /**
     * Get all posts for feed
     * @returns {Promise<Array>} Array of post objects
     */
    getAllPosts: async () => {
        try {
            const response = await apiClient.get('/posts');
            return response.data;
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error.response?.data || new Error('Network error fetching posts');
        }
    }
};

export default postService;
