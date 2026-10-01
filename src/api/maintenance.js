import api from './axios';

export const MAINTENANCE_STATUSES = ['COMPLETED', 'IN_PROGRESS', 'PENDING'];

export const maintenanceApi = {
  getMaintenanceRecords: async (inventoryId) => {
    const response = await api.get(`/api/maintenance/inventory/${inventoryId}`);
    return response.data;
  },

  createMaintenanceRecord: async (inventoryId, maintenanceData) => {
    const response = await api.post(`/api/maintenance/inventory/${inventoryId}`, maintenanceData);
    return response.data;
  },

  updateMaintenanceRecord: async (maintenanceId, maintenanceData) => {
    const response = await api.put(`/api/maintenance/${maintenanceId}`, maintenanceData);
    return response.data;
  },

  deleteMaintenanceRecord: async (maintenanceId) => {
    const response = await api.delete(`/api/maintenance/${maintenanceId}`);
    return response.data;
  },
};

export default maintenanceApi;
