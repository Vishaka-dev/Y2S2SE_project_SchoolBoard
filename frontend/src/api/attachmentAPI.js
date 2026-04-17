import apiClient from './apiClient';
import axios from 'axios';

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
    console.log('📤 uploadAttachments - Starting:', {
      messageId,
      fileCount: files.length,
      files: files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      }))
    });

    const formData = new FormData();
    
    // Add all files to FormData
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    // Create a separate axios instance for file uploads
    // WITHOUT the Content-Type: application/json header
    // so the browser can set it to multipart/form-data
    const token = localStorage.getItem('token');
    const uploadClient = axios.create({
      baseURL: apiClient.defaults.baseURL,
      headers: {
        // Don't set Content-Type - let browser set multipart/form-data
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    console.log('📤 uploadAttachments - Sending FormData to /messages/' + messageId + '/attachments');
    
    const response = await uploadClient.post(`/messages/${messageId}/attachments`, formData);
    
    console.log('✅ uploadAttachments - Success:', {
      attachmentCount: response.data?.length,
      attachments: response.data?.map(a => ({ id: a.id, fileName: a.fileName }))
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ uploadAttachments - Error:', {
      messageId,
      status: error.response?.status,
      statusText: error.response?.statusText,
      error: error.response?.data?.message || error.response?.data?.detailMessage || error.message
    });
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
