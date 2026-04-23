import apiClient from '../api/apiClient';

export const eventService = {
  getAllEvents: async () => {
    const response = await apiClient.get('/events');
    return response.data;
  },

  getUpcomingEvents: async () => {
    console.log('Sending request to /events/upcoming...');
    try {
      const response = await apiClient.get('/events/upcoming');
      console.log('API Response received for upcoming events:', response.status);
      return response.data;
    } catch (error) {
      console.error('API Error fetching upcoming events:', error.response || error);
      throw error;
    }
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
