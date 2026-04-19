import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Group Chat Service
 * Handles API calls for group chat functionality
 * Maps between frontend group concept and backend GroupConversation concept
 */
const groupChatService = {
  /**
   * Get all groups for current user
   */
  getUserGroups: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/groups/my-groups`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
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
      const response = await axios.get(
        `${API_BASE_URL}/group-conversations/${groupId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
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
      const response = await axios.get(
        `${API_BASE_URL}/group-conversations/${conversationId}/messages`,
        {
          params: { page, size },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
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
   * @param {File} file - Optional file attachment
   */
  sendMessage: async (groupConversationId, content, file = null) => {
    try {
      const formData = new FormData();
      formData.append('groupConversationId', groupConversationId);
      formData.append('content', content);
      if (file) {
        formData.append('file', file);
      }

      const response = await axios.post(
        `${API_BASE_URL}/group-messages`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
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
      const response = await axios.delete(
        `${API_BASE_URL}/group-messages/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
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
      const response = await axios.put(
        `${API_BASE_URL}/group-messages/${messageId}`,
        { content },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
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
      const response = await axios.delete(
        `${API_BASE_URL}/groups/${groupId}/leave`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
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
      const response = await axios.put(
        `${API_BASE_URL}/group-messages/${messageId}/read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
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

      const response = await axios.post(
        `${API_BASE_URL}/group-messages/${messageId}/attachments`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
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
