import apiClient from './apiClient';

/**
 * Group Conversation API Service
 * Handles all REST API calls for group conversation management
 * Backend endpoints: /api/group-conversations
 */

/**
 * Get or create a group conversation
 * @param {number} groupId - Group ID
 * @returns {Promise} Group conversation object
 */
export const getOrCreateGroupConversation = async (groupId) => {
  try {
    const response = await apiClient.get(`/group-conversations/${groupId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get/create group conversation for group ${groupId}:`, error);
    throw error;
  }
};

/**
 * Fetch all group conversations for the current user (paginated)
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size (default 10)
 * @returns {Promise} Response with group conversations array and pagination meta
 */
export const fetchGroupConversations = async (page = 0, size = 10) => {
  try {
    const response = await apiClient.get('/group-conversations', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch group conversations:', error);
    throw error;
  }
};

/**
 * Fetch messages for a group conversation (paginated)
 * Messages are returned in descending order (newest first)
 * @param {number} groupConversationId - Group conversation ID
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size (default 20)
 * @returns {Promise} Object with messages array and pagination meta
 */
export const fetchGroupMessages = async (groupConversationId, page = 0, size = 20) => {
  try {
    const response = await apiClient.get(
      `/group-conversations/${groupConversationId}/messages`,
      { params: { page, size } }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch group messages for conversation ${groupConversationId}:`, error);
    throw error;
  }
};

export default {
  getOrCreateGroupConversation,
  fetchGroupConversations,
  fetchGroupMessages
};
