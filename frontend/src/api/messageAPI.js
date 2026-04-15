import apiClient from './apiClient';

/**
 * Message API Service
 * Handles all REST API calls for message operations
 * Backend endpoints: /api/messages
 */

/**
 * Send a new message in a conversation
 * @param {number} conversationId - Conversation ID
 * @param {string} content - Message text content (1-5000 characters)
 * @returns {Promise} Created message object with id, timestamps, etc.
 */
export const sendMessage = async (conversationId, content) => {
  try {
    const response = await apiClient.post('/messages', {
      conversationId,
      content
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

/**
 * Fetch messages for a specific conversation (paginated)
 * Messages are returned in descending order (newest first)
 * @param {number} conversationId - Conversation ID
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size (default 20)
 * @returns {Promise} Object with messages array and pagination meta
 */
export const fetchMessages = async (conversationId, page = 0, size = 20) => {
  try {
    const response = await apiClient.get(
      `/messages/conversation/${conversationId}`,
      { params: { page, size } }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch messages for conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Fetch a single message by ID
 * @param {number} messageId - Message ID
 * @returns {Promise} Message object
 */
export const fetchMessage = async (messageId) => {
  try {
    const response = await apiClient.get(`/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch message ${messageId}:`, error);
    throw error;
  }
};

/**
 * Edit a message (update content)
 * Can only edit own messages
 * @param {number} messageId - Message ID
 * @param {string} content - New message content (1-5000 characters)
 * @returns {Promise} Updated message object
 */
export const editMessage = async (messageId, content) => {
  try {
    const response = await apiClient.put(`/messages/${messageId}`, {
      content
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to edit message ${messageId}:`, error);
    throw error;
  }
};

/**
 * Delete a message
 * Can only delete own messages
 * @param {messageId} messageId - Message ID
 * @returns {Promise} Success response
 */
export const deleteMessage = async (messageId) => {
  try {
    const response = await apiClient.delete(`/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete message ${messageId}:`, error);
    throw error;
  }
};

/**
 * Mark a single message as read
 * @param {number} messageId - Message ID
 * @returns {Promise} Updated message object
 */
export const markMessageAsRead = async (messageId) => {
  try {
    const response = await apiClient.put(`/messages/${messageId}/read`);
    return response.data;
  } catch (error) {
    console.error(`Failed to mark message ${messageId} as read:`, error);
    throw error;
  }
};

/**
 * Mark multiple messages as read (bulk operation)
 * @param {number[]} messageIds - Array of message IDs
 * @returns {Promise} Success response with count of updated messages
 */
export const markMessagesAsRead = async (messageIds) => {
  try {
    const response = await apiClient.put('/messages/read', {
      messageIds
    });
    return response.data;
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    throw error;
  }
};

/**
 * Search messages within a conversation
 * @param {number} conversationId - Conversation ID
 * @param {string} query - Search query (searches message content)
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size (default 20)
 * @returns {Promise} Array of matching messages
 */
export const searchMessages = async (conversationId, query, page = 0, size = 20) => {
  try {
    const response = await apiClient.get('/messages/search', {
      params: { conversationId, query, page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search messages:', error);
    throw error;
  }
};

export default {
  sendMessage,
  fetchMessages,
  fetchMessage,
  editMessage,
  deleteMessage,
  markMessageAsRead,
  markMessagesAsRead,
  searchMessages
};
