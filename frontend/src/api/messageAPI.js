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
 * @param {Array} attachments - Optional file attachments array
 * @returns {Promise} Created message object with id, timestamps, etc.
 */
export const sendMessage = async (conversationId, content, attachments = []) => {
  try {
    // Validate inputs
    if (typeof conversationId !== 'number' || conversationId <= 0) {
      const err = new Error(`Invalid conversationId: ${conversationId}`);
      console.error('❌ messageAPI.sendMessage - Invalid conversationId:', err.message);
      throw err;
    }

    const trimmedContent = String(content).trim();
    
    if (trimmedContent.length === 0 && attachments.length === 0) {
      const err = new Error('Content and attachments cannot both be empty');
      console.error('❌ messageAPI.sendMessage - Empty content and no attachments');
      throw err;
    }

    if (trimmedContent.length > 5000) {
      const err = new Error(`Content exceeds 5000 characters (${trimmedContent.length})`);
      console.error('❌ messageAPI.sendMessage - Content too long:', err.message);
      throw err;
    }

    let response;

    if (attachments.length > 0) {
      // Send with files using FormData
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('content', trimmedContent || '');
      
      attachments.forEach((attachment) => {
        formData.append('files', attachment.file);
      });

      console.log('📤 messageAPI.sendMessage - Sending with files:', {
        conversationId,
        contentLength: trimmedContent.length,
        fileCount: attachments.length
      });

      // Don't set Content-Type header - let axios/browser set it with proper boundary
      response = await apiClient.post('/messages', formData);
    } else {
      // Send text-only message as JSON
      const payload = {
        conversationId,
        content: trimmedContent
      };

      console.log('📤 messageAPI.sendMessage - Sending:', {
        conversationId,
        contentLength: trimmedContent.length,
        contentPreview: trimmedContent.substring(0, 50)
      });

      response = await apiClient.post('/messages', payload);
    }
    
    console.log('✅ messageAPI.sendMessage - Success:', {
      messageId: response.data?.id,
      contentLength: response.data?.content?.length
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ messageAPI.sendMessage - Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data?.detailMessage || error.response?.data?.message
    });
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
