import apiClient from '../api/apiClient';

export const followUser = (userId) => apiClient.post(`/users/${userId}/follow`);
export const unfollowUser = (userId) => apiClient.delete(`/users/${userId}/follow`);
export const getFollowers = (userId, page = 0, size = 20) =>
  apiClient.get(`/users/${userId}/followers?page=${page}&size=${size}`);
export const getFollowing = (userId, page = 0, size = 20) =>
  apiClient.get(`/users/${userId}/following?page=${page}&size=${size}`);
export const getRelationship = (userId) => apiClient.get(`/users/${userId}/relationship`);
export const getFollowStats = (userId) => apiClient.get(`/users/${userId}/follow-stats`);
