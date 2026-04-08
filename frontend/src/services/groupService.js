import apiClient from '../api/apiClient';

const groupService = {
  createGroup: async (groupData) => {
    try {
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
};

export default groupService;
