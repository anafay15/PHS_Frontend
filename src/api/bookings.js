import api from './axios';

export const bookingsApi = {
  getBookings: async (params) => {
    const response = await api.get('/api/bookings', { params });
    return response.data;
  },

  getBooking: async (id) => {
    const response = await api.get(`/api/bookings/${id}`);
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  },

  updateBooking: async (id, bookingData) => {
    const response = await api.put(`/api/bookings/${id}`, bookingData);
    return response.data;
  },

  deleteBooking: async (id) => {
    const response = await api.delete(`/api/bookings/${id}`);
    return response.data;
  },
};

export default bookingsApi;
