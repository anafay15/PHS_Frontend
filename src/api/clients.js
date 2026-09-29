import api from './axios';

export const clientsApi = {
  getClients: async (params) => {
    const response = await api.get('/api/clients', { params });
    return response.data;
  },

  getClient: async (id) => {
    const response = await api.get(`/api/clients/${id}`);
    return response.data;
  },

  createClient: async (clientData) => {
    const response = await api.post('/api/clients', clientData);
    return response.data;
  },

  updateClient: async (id, clientData) => {
    const response = await api.put(`/api/clients/${id}`, clientData);
    return response.data;
  },

  deleteClient: async (id) => {
    const response = await api.delete(`/api/clients/${id}`);
    return response.data;
  },
};

export default clientsApi;
