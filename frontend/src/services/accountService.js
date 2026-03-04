import apiClient from '../api/apiClient';

/**
 * Account Management Service
 * Handles all account-related API calls
 */

const accountService = {
  /**
   * Get current user's account details
   * @returns {Promise<Object>} Account details with profile
   */
  getAccountDetails: async () => {
    try {
      const response = await apiClient.get('/account/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile update data (role-specific fields)
   * @returns {Promise<Object>} Updated account details
   */
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.patch('/account/me', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - { currentPassword, newPassword, confirmPassword }
   * @returns {Promise<void>}
   */
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.patch('/account/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Change user email
   * @param {Object} emailData - { newEmail, password }
   * @returns {Promise<Object>} Updated account details
   */
  changeEmail: async (emailData) => {
    try {
      const response = await apiClient.patch('/account/change-email', emailData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete user account (soft delete)
   * @param {Object} deleteData - { password, confirmationText }
   * @returns {Promise<void>}
   */
  deleteAccount: async (deleteData) => {
    try {
      const response = await apiClient.delete('/account/me', { data: deleteData });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default accountService;
