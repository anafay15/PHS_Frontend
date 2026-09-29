import api from './axios';

export const assignmentsApi = {
  getAssignments: async (params) => {
    const response = await api.get('/api/assignments', { params });
    return response.data;
  },

  assignEquipment: async (inventoryId, assignmentData) => {
    const response = await api.post(`/api/assignments/inventory/${inventoryId}/assign`, assignmentData);
    return response.data;
  },

  getInventoryAssignments: async (inventoryId) => {
    const response = await api.get(`/api/assignments/inventory/${inventoryId}`);
    return response.data;
  },

  returnEquipment: async (assignmentId) => {
    const response = await api.patch(`/api/assignments/${assignmentId}/return`);
    return response.data;
  },
};

export default assignmentsApi;
