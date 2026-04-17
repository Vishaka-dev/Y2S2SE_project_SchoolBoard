import apiClient from './apiClient';

/**
 * Conversation API Service
 * Handles all REST API calls for conversation management
 * Backend endpoints: /api/conversations
 */

/**
 * Fetch all conversations for the current user (paginated)
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size (default 10)
 * @returns {Promise} Response with conversations array and pagination meta
 */
export const fetchConversations = async (page = 0, size = 10) => {
  try {
    const response = await apiClient.get('/conversations', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    throw error;
  }
};

/**
 * Fetch a specific conversation with its messages
 * @param {number} conversationId - Conversation ID
 * @param {number} page - Page number for messages (0-indexed)
 * @param {number} size - Page size for messages (default 20)
 * @returns {Promise} Conversation object with messages array
 */
export const fetchConversationDetail = async (conversationId, page = 0, size = 20) => {
  try {
    const response = await apiClient.get(`/conversations/${conversationId}`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Create or get existing conversation between two users
 * If conversation exists, returns existing one
 * If not, creates new one
 * @param {number} otherUserId - ID of the other user
 * @returns {Promise} Created/existing conversation object
 */
export const createOrGetConversation = async (otherUserId) => {
  try {
    const response = await apiClient.post('/conversations', {
      otherUserId
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to create/get conversation with user ${otherUserId}:`, error);
    throw error;
  }
};

/**
 * Delete a conversation (soft delete)
 * @param {number} conversationId - Conversation ID
 * @returns {Promise} Success response
 */
export const deleteConversation = async (conversationId) => {
  try {
    const response = await apiClient.delete(`/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Mark all messages in a conversation as read
 * @param {number} conversationId - Conversation ID
 * @returns {Promise} Success response with updated message count
 */
export const markConversationAsRead = async (conversationId) => {
  try {
    const response = await apiClient.put(`/conversations/${conversationId}/read`);
    return response.data;
  } catch (error) {
    console.error(`Failed to mark conversation ${conversationId} as read:`, error);
    throw error;
  }
};

/**
 * Search conversations by user (search for recipient)
 * @param {string} query - Search query (username or partial username)
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size (default 10)
 * @returns {Promise} Array of conversations matching the search
 */
export const searchConversations = async (query, page = 0, size = 10) => {
  try {
    const response = await apiClient.get('/conversations/search', {
      params: { query, page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search conversations:', error);
    throw error;
  }
};

/**
 * Get total unread message count across all conversations
 * Used for badge count in UI
 * @returns {Promise} Object with totalUnreadCount field
 */
export const getUnreadCount = async () => {
  try {
    const response = await apiClient.get('/conversations/unread-count');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch unread count:', error);
    throw error;
  }
};

export default {
  fetchConversations,
  fetchConversationDetail,
  createOrGetConversation,
  deleteConversation,
  markConversationAsRead,
  searchConversations,
  getUnreadCount
};
