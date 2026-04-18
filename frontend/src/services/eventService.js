import apiClient from '../api/apiClient';

export const eventService = {
  getAllEvents: async () => {
    const response = await apiClient.get('/events');
    return response.data;
  },

  getUpcomingEvents: async () => {
    const response = await apiClient.get('/events/upcoming');
    return response.data;
  },

  createEvent: async (formData) => {
    const response = await apiClient.post('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deleteEvent: async (eventId) => {
    const response = await apiClient.delete(`/events/${eventId}`);
    return response.data;
  }
};
