import api from './axios';

export const DELIVERY_STATUSES = ['PENDING', 'READY', 'DELIVERED'];

export const deliveriesApi = {
  getDeliveries: async (params) => {
    const response = await api.get('/api/deliveries', { params });
    return response.data;
  },

  getDelivery: async (id) => {
    const response = await api.get(`/api/deliveries/${id}`);
    return response.data;
  },

  createDelivery: async (deliveryData) => {
    const response = await api.post('/api/deliveries', deliveryData);
    return response.data;
  },

  updateDelivery: async (id, deliveryData) => {
    const response = await api.put(`/api/deliveries/${id}`, deliveryData);
    return response.data;
  },

  deleteDelivery: async (id) => {
    const response = await api.delete(`/api/deliveries/${id}`);
    return response.data;
  },
};

export default deliveriesApi;
