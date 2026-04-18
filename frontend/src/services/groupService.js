import apiClient from '../api/apiClient';

const groupService = {
  /**
   * @param {FormData} groupData multipart: name, groupType, … optional profilePicture, coverPicture
   */
  createGroup: async (groupData) => {
    try {
      // apiClient defaults to Content-Type: application/json; override for FormData
      // (same pattern as accountService.uploadProfilePhoto).
      const response = await apiClient.post('/groups', groupData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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
   * Update an existing group (multipart FormData).
   * Typical fields: name, description, groupType, subject, academicLevel,
   * profilePicture, coverPicture, removeProfilePicture, removeCoverPicture.
   * @param {string|number} groupId Group ID
   * @param {FormData} formData
   * @returns {Promise<Object>} Updated group (profilePictureUrl, coverPictureUrl, …)
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
