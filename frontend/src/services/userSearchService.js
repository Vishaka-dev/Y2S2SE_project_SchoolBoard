import apiClient from '../api/apiClient';

export const searchUsers = (query, page = 0, size = 10) =>
  apiClient.get(`/users/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
