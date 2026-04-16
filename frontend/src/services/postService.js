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

    getAllPosts: async (page = 0, size = 10) => {
        try {
            const response = await apiClient.get(`/posts?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error.response?.data || new Error('Network error fetching posts');
        }
    },

    /**
     * Get a single post by ID
     * @param {string|number} id Post ID
     * @returns {Promise<Object>} Post object
     */
    getPostById: async (id) => {
        try {
            const response = await apiClient.get(`/posts/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching post by ID:', id, error);
            throw error.response?.data || new Error('Network error fetching post');
        }
    },

    /**
     * Update an existing post
     * @param {string|number} id Post ID
     * @param {Object} postData Object containing content and/or image
     */
    updatePost: async (id, postData) => {
        const formData = new FormData();
        if (postData.content !== undefined) formData.append('content', postData.content);
        if (postData.image) formData.append('image', postData.image);

        try {
            const response = await apiClient.patch(`/posts/${id}`, formData);
            return response.data;
        } catch (error) {
            console.error('Error updating post:', error);
            throw error.response?.data || new Error('Network error updating post');
        }
    },

    /**
     * Delete a post
     * @param {string|number} id Post ID
     */
    deletePost: async (id) => {
        try {
            await apiClient.delete(`/posts/${id}`);
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error.response?.data || new Error('Network error deleting post');
        }
    },

    /**
     * Search posts by keyword
     * @param {string} keyword Search keyword
     * @returns {Promise<Array>} Array of post objects matching the search
     */
    searchPosts: async (keyword) => {
        const response = await apiClient.get(`/posts/search?keyword=${encodeURIComponent(keyword)}`);
        return response.data;
    },

    /**
     * Get all posts by a specific user
     * @param {string} username Username
     * @returns {Promise<Array>} Array of post objects
     */
    getUserPosts: async (username) => {
        try {
            const response = await apiClient.get(`/posts/user/${encodeURIComponent(username)}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user posts:', error);
            throw error.response?.data || new Error('Network error fetching user posts');
        }
    },

    /**
     * Get all comments for a post
     * @param {string|number} postId Post ID
     */
    getCommentsByPost: async (postId) => {
        try {
            const response = await apiClient.get(`/posts/${postId}/comments`);
            return response.data;
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error.response?.data || new Error('Network error fetching comments');
        }
    },

    /**
     * Create a new comment on a post
     * @param {string|number} postId Post ID
     * @param {string} content Comment content
     */
    createComment: async (postId, content) => {
        try {
            const response = await apiClient.post(`/posts/${postId}/comments`, { content });
            return response.data;
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error.response?.data || new Error('Network error creating comment');
        }
    },

    /**
     * Delete a comment
     * @param {string|number} commentId Comment ID
     */
  deleteComment: async (commentId) => {
      try {
          await apiClient.delete(`/comments/${commentId}`);
      } catch (error) {
          console.error('Error deleting comment:', error);
          throw error.response?.data || new Error('Network error deleting comment');
      }
  },

  /**
   * React to a post
   * @param {number|string} postId Post ID
   * @param {string} reactionType Reaction type enum value
   */
  reactToPost: async (postId, reactionType) => {
      try {
          const response = await apiClient.post(`/posts/${postId}/reactions`, { reactionType });
          return response.data;
      } catch (error) {
          console.error('Error reacting to post:', error);
          throw error.response?.data || new Error('Network error reacting to post');
      }
  },

    /**
     * Get reactions for a post
     * @param {number|string} postId Post ID
     */
    getPostReactions: async (postId) => {
        try {
            const response = await apiClient.get(`/posts/${postId}/reactions`);
            return response.data;
        } catch (error) {
            console.error('Error fetching post reactions:', error);
            throw error.response?.data || new Error('Network error fetching post reactions');
        }
    }
};

export default postService;
