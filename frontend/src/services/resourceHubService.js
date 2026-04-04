import apiClient from '../api/apiClient';

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    query.append(key, value);
  });

  return query.toString();
};

const resourceHubService = {
  createResource: async ({ title, description, category, type, file, externalUrl, tags }) => {
    const formData = new FormData();

    formData.append('title', title);
    formData.append('description', description || '');
    formData.append('category', category);
    formData.append('type', type);

    if (file) {
      formData.append('file', file);
    }

    if (externalUrl) {
      formData.append('externalUrl', externalUrl);
    }

    if (Array.isArray(tags)) {
      tags.forEach((tag) => {
        if (tag && tag.trim()) {
          formData.append('tags', tag.trim());
        }
      });
    }

    try {
      const response = await apiClient.post('/resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Network error while creating resource');
    }
  },

  getResources: async ({ page = 0, size = 10, category, type, search, role } = {}) => {
    const queryString = buildQueryString({ page, size, category, type, search, role });

    try {
      const response = await apiClient.get(`/resources${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Network error while loading resources');
    }
  },

  deleteResource: async (resourceId) => {
    try {
      await apiClient.delete(`/resources/${resourceId}`);
    } catch (error) {
      throw error.response?.data || new Error('Network error while deleting resource');
    }
  },
};

export default resourceHubService;
