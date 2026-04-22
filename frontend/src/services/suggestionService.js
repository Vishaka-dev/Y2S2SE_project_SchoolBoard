import apiClient from '../api/apiClient';

/**
 * Fetch a list of recommended connections for the current user.
 * @param {number} limit - The maximum number of recommendations to retrieve (default is 5).
 * @returns {Promise<Array>} - A promise that resolves to an array of user suggestion objects.
 */
export const getSuggestedConnections = async (limit = 5) => {
  try {
    const response = await apiClient.get(`/users/suggestions?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching suggested connections:', error);
    throw error;
  }
};
