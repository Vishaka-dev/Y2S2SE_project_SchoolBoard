import apiClient from '../api/apiClient';

const groupService = {
  createGroup: async (groupData) => {
    try {
      // Keep same upload style as post image creation:
      // pass FormData directly and let Axios set multipart boundaries automatically.
      const response = await apiClient.post('/groups', groupData);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to create group');
    }
  },

  getGroupById: async (groupId) => {
    try {
      const response = await apiClient.get(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch group');
    }
  },

  getAllGroups: async () => {
    try {
      const response = await apiClient.get('/groups');
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch groups');
    }
  },

  getMyGroups: async () => {
    try {
      const response = await apiClient.get('/groups/my-groups');
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch your groups');
    }
  },

  joinGroup: async (groupId) => {
    try {
      const response = await apiClient.post(`/groups/${groupId}/join`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to join group');
    }
  },

  leaveGroup: async (groupId) => {
    try {
      await apiClient.delete(`/groups/${groupId}/leave`);
    } catch (error) {
      throw error.response?.data || new Error('Failed to leave group');
    }
  },

  getGroupMembers: async (groupId) => {
    try {
      const response = await apiClient.get(`/groups/${groupId}/members`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch group members');
    }
  },

  searchGroups: async (keyword) => {
    try {
      const response = await apiClient.get(`/groups/search?keyword=${encodeURIComponent(keyword)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to search groups');
    }
  },

  /**
   * Update an existing group
   * Sends FormData (multipart/form-data) — matching postService.updatePost pattern.
   * Axios auto-sets Content-Type to multipart/form-data when data is FormData.
   * @param {string|number} groupId Group ID
   * @param {FormData} formData FormData containing name, description, groupType, subject, academicLevel, image
   * @returns {Promise<Object>} Updated group data
   */
  updateGroup: async (groupId, formData) => {
    try {
      const response = await apiClient.put(`/groups/${groupId}`, formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to update group');
    }
  },
};

export default groupService;
