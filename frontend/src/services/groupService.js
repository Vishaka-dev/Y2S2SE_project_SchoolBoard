import apiClient from '../api/apiClient';

const groupService = {
  createGroup: async (payload) => {
    try {
      const response = await apiClient.post('/groups', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error.response?.data || new Error('Network error creating group');
    }
  },

  getGroups: async () => {
    try {
      const response = await apiClient.get('/groups');
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error.response?.data || new Error('Network error fetching groups');
    }
  },

  getGroupsByCategory: async (category) => {
    try {
      const response = await apiClient.get(`/groups?category=${encodeURIComponent(category)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching groups by category:', error);
      throw error.response?.data || new Error('Network error fetching groups by category');
    }
  },

  getMyGroups: async () => {
    try {
      const response = await apiClient.get('/groups/my-groups');
      return response.data;
    } catch (error) {
      console.error('Error fetching my groups:', error);
      throw error.response?.data || new Error('Network error fetching my groups');
    }
  },

  getGroupById: async (groupId) => {
    try {
      const response = await apiClient.get(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group details:', error);
      throw error.response?.data || new Error('Network error fetching group details');
    }
  },

  joinGroup: async (groupId) => {
    try {
      const response = await apiClient.post(`/groups/${groupId}/join`);
      return response.data;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error.response?.data || new Error('Network error joining group');
    }
  },

  leaveGroup: async (groupId) => {
    try {
      const response = await apiClient.delete(`/groups/${groupId}/leave`);
      return response.data;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error.response?.data || new Error('Network error leaving group');
    }
  },

  getGroupMembers: async (groupId) => {
    try {
      const response = await apiClient.get(`/groups/${groupId}/members`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group members:', error);
      throw error.response?.data || new Error('Network error fetching group members');
    }
  },
  searchGroups: async (keyword) => {
    try {
      const response = await apiClient.get(`/groups/search?keyword=${encodeURIComponent(keyword)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching groups:', error);
      throw error.response?.data || new Error('Network error searching groups');
    }
  },
};

export default groupService;
