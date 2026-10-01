import api from './axios';

export const QUOTE_STATUSES = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

export const quotesApi = {
  getQuotes: async (params) => {
    const response = await api.get('/api/quotes', { params });
    return response.data;
  },

  getQuote: async (id) => {
    const response = await api.get(`/api/quotes/${id}`);
    return response.data;
  },

  createQuote: async (quoteData) => {
    const response = await api.post('/api/quotes', quoteData);
    return response.data;
  },

  updateQuote: async (id, quoteData) => {
    const response = await api.put(`/api/quotes/${id}`, quoteData);
    return response.data;
  },

  acceptQuote: async (id) => {
    const response = await api.patch(`/api/quotes/${id}/accept`);
    return response.data;
  },

  deleteQuote: async (id) => {
    const response = await api.delete(`/api/quotes/${id}`);
    return response.data;
  },
};

export default quotesApi;
