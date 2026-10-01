import api from './axios';

export const PAYMENT_TYPES = ['DEPOSIT', 'FINAL', 'OTHER'];
export const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
export const PAYMENT_METHODS = ['CASH', 'CARD', 'BANK_TRANSFER', 'CHECK', 'OTHER'];

export const paymentsApi = {
  getPayments: async (params) => {
    const response = await api.get('/api/payments', { params });
    return response.data;
  },

  getPayment: async (id) => {
    const response = await api.get(`/api/payments/${id}`);
    return response.data;
  },

  createPayment: async (paymentData) => {
    const response = await api.post('/api/payments', paymentData);
    return response.data;
  },

  updatePayment: async (id, paymentData) => {
    const response = await api.put(`/api/payments/${id}`, paymentData);
    return response.data;
  },

  deletePayment: async (id) => {
    const response = await api.delete(`/api/payments/${id}`);
    return response.data;
  },
};

export default paymentsApi;
