import apiClient from './apiClient';

/**
 * Attachment API Service
 * Handles file upload and attachment operations via REST API
 */

/**
 * Upload files to a message
 * Sends files as multipart/form-data to backend
 * @param {number} messageId - Message ID to attach files to
 * @param {File[]} files - Array of File objects
 * @returns {Promise} Array of created attachment objects
 */
export const uploadAttachments = async (messageId, files) => {
  try {
    const formData = new FormData();
    
    // Add all files to FormData
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    const response = await apiClient.post(`/messages/${messageId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to upload attachments:', error);
    throw error;
  }
};

/**
 * Download/retrieve attachments for a message
 * @param {number} messageId - Message ID
 * @returns {Promise} Array of attachment objects
 */
export const fetchAttachments = async (messageId) => {
  try {
    const response = await apiClient.get(`/messages/${messageId}/attachments`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch attachments:', error);
    throw error;
  }
};

/**
 * Delete an attachment
 * @param {number} attachmentId - Attachment ID
 * @returns {Promise} Success response
 */
export const deleteAttachment = async (attachmentId) => {
  try {
    const response = await apiClient.delete(`/messages/attachments/${attachmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete attachment ${attachmentId}:`, error);
    throw error;
  }
};

/**
 * Download file by ID
 * @param {number} attachmentId - Attachment ID
 * @returns {Promise} File blob for download
 */
export const downloadAttachment = async (attachmentId) => {
  try {
    const response = await apiClient.get(`/messages/attachments/download/${attachmentId}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to download attachment ${attachmentId}:`, error);
    throw error;
  }
};

export default {
  uploadAttachments,
  fetchAttachments,
  deleteAttachment,
  downloadAttachment
};
