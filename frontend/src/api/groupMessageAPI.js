import apiClient from './apiClient';

/**
 * Group Message API Service
 * Handles all REST API calls for group message operations
 * Backend endpoints: /api/group-messages
 */

/**
 * Send a new message in a group conversation
 * @param {number} groupConversationId - Group conversation ID
 * @param {string} content - Message text content (1-5000 characters)
 * @returns {Promise} Created message object with id, timestamps, etc.
 */
export const sendMessage = async (groupConversationId, content) => {
  try {
    // Validate inputs
    if (typeof groupConversationId !== 'number' || groupConversationId <= 0) {
      const err = new Error(`Invalid groupConversationId: ${groupConversationId}`);
      console.error('❌ groupMessageAPI.sendMessage - Invalid groupConversationId:', err.message);
      throw err;
    }

    const trimmedContent = String(content).trim();
    
    if (trimmedContent.length === 0) {
      const err = new Error('Content cannot be empty');
      console.error('❌ groupMessageAPI.sendMessage - Empty content');
      throw err;
    }

    if (trimmedContent.length > 5000) {
      const err = new Error(`Content exceeds 5000 characters (${trimmedContent.length})`);
      console.error('❌ groupMessageAPI.sendMessage - Content too long:', err.message);
      throw err;
    }

    const payload = {
      groupConversationId,
      content: trimmedContent
    };

    console.log('📤 groupMessageAPI.sendMessage - Sending:', {
      groupConversationId,
      contentLength: trimmedContent.length,
      contentPreview: trimmedContent.substring(0, 50)
    });

    const response = await apiClient.post('/group-messages', payload);
    
    console.log('✅ groupMessageAPI.sendMessage - Success:', {
      messageId: response.data?.id,
      contentLength: response.data?.content?.length
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ groupMessageAPI.sendMessage - Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data?.detailMessage || error.response?.data?.message
    });
    throw error;
  }
};

/**
 * Delete a group message
 * @param {number} messageId - Message ID
 * @returns {Promise} Success response
 */
export const deleteMessage = async (messageId) => {
  try {
    const response = await apiClient.delete(`/group-messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete group message ${messageId}:`, error);
    throw error;
  }
};

/**
 * Upload attachment to a group message
 * @param {number} messageId - Message ID
 * @param {File} file - File to upload (max 5MB)
 * @returns {Promise} Updated message object with attachment
 */
export const uploadAttachment = async (messageId, file) => {
  try {
    if (!file) {
      throw new Error('File is required');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      `/group-messages/${messageId}/attachments`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data;
  } catch (error) {
    console.error(`Failed to upload attachment for message ${messageId}:`, error);
    throw error;
  }
};

/**
 * Mark message as read
 * @param {number} messageId - Message ID
 * @returns {Promise} Success response
 */
export const markAsRead = async (messageId) => {
  try {
    const response = await apiClient.put(`/group-messages/${messageId}/read`);
    return response.data;
  } catch (error) {
    console.error(`Failed to mark message ${messageId} as read:`, error);
    throw error;
  }
};

export default {
  sendMessage,
  deleteMessage,
  uploadAttachment,
  markAsRead
};
