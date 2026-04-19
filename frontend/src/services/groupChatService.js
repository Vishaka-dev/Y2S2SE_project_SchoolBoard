import apiClient from '../api/apiClient';

/**
 * Group Chat Service
 * Handles API calls for group chat functionality
 * Maps between frontend group concept and backend GroupConversation concept
 * Uses apiClient for automatic auth token handling via interceptors
 */
const groupChatService = {
  /**
   * Get all groups for current user
   */
  getUserGroups: async () => {
    try {
      const response = await apiClient.get('/groups/my-groups');
      return response;
    } catch (error) {
      console.error('Error fetching user groups:', error);
      throw error;
    }
  },

  /**
   * Get or create group conversation
   * Backend uses GroupConversation concept - each group has a conversation thread
   * @param {number} groupId - Group ID
   */
  getOrCreateGroupConversation: async (groupId) => {
    try {
      const response = await apiClient.get(`/group-conversations/${groupId}`);
      return response;
    } catch (error) {
      console.error('Error getting group conversation:', error);
      throw error;
    }
  },

  /**
   * Get messages for a group conversation
   * @param {number} conversationId - Group Conversation ID
   * @param {number} page - Page number (0-based)
   * @param {number} size - Messages per page
   */
  getGroupMessages: async (conversationId, page = 0, size = 50) => {
    try {
      const response = await apiClient.get(
        `/group-conversations/${conversationId}/messages`,
        { params: { page, size } }
      );
      return response;
    } catch (error) {
      console.error('Error fetching group messages:', error);
      throw error;
    }
  },

  /**
   * Send a message to a group
   * @param {number} groupConversationId - Group Conversation ID
   * @param {string} content - Message content
   * @param {Array} attachments - Optional file attachments array
   */
  sendMessage: async (groupConversationId, content, attachments = []) => {
    try {
      let response;

      if (attachments.length > 0) {
        // Send with files using FormData
        const formData = new FormData();
        formData.append('groupConversationId', groupConversationId);
        formData.append('content', content || '');
        
        attachments.forEach((attachment) => {
          formData.append('files', attachment.file);
        });

        // Don't set Content-Type header - let axios/browser set it with proper boundary
        response = await apiClient.post('/group-messages', formData);
      } else {
        // Send text-only message as JSON
        response = await apiClient.post('/group-messages', {
          groupConversationId,
          content
        });
      }

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Delete a message
   * @param {number} messageId - Message ID
   */
  deleteMessage: async (messageId) => {
    try {
      const response = await apiClient.delete(`/group-messages/${messageId}`);
      return response;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  /**
   * Edit a message
   * @param {number} messageId - Message ID
   * @param {string} content - Updated message content
   */
  editMessage: async (messageId, content) => {
    try {
      const response = await apiClient.put(`/group-messages/${messageId}`, {
        content
      });
      return response;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  },

  /**
   * Leave a group
   * @param {number} groupId - Group ID
   */
  leaveGroup: async (groupId) => {
    try {
      const response = await apiClient.delete(`/groups/${groupId}/leave`);
      return response;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  },

  /**
   * Mark messages as read
   * @param {number} messageId - Message ID
   */
  markMessageAsRead: async (messageId) => {
    try {
      const response = await apiClient.put(`/group-messages/${messageId}/read`, {});
      return response;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  /**
   * Upload attachment to a message
   * @param {number} messageId - Message ID
   * @param {File} file - File to upload
   */
  uploadAttachment: async (messageId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(
        `/group-messages/${messageId}/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }
};

export default groupChatService;
