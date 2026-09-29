import api from './axios';

export const INVENTORY_CATEGORIES = [
  'CAMERA',
  'LENS',
  'LIGHTING',
  'AUDIO',
  'TRIPOD',
  'DRONE',
  'BATTERY',
  'MEMORY_CARD',
  'ACCESSORY',
  'OTHER',
];

export const INVENTORY_CONDITIONS = ['NEW', 'GOOD', 'FAIR', 'DAMAGED'];

export const INVENTORY_STATUSES = [
  'AVAILABLE',
  'IN_USE',
  'MAINTENANCE',
  'LOST',
  'RETIRED',
];

export const inventoryApi = {
  getInventory: async (params) => {
    const response = await api.get('/api/inventory', { params });
    return response.data;
  },

  getInventoryItem: async (id) => {
    const response = await api.get(`/api/inventory/${id}`);
    return response.data;
  },

  createInventoryItem: async (itemData) => {
    const response = await api.post('/api/inventory', itemData);
    return response.data;
  },

  updateInventoryItem: async (id, itemData) => {
    const response = await api.put(`/api/inventory/${id}`, itemData);
    return response.data;
  },

  deleteInventoryItem: async (id) => {
    const response = await api.delete(`/api/inventory/${id}`);
    return response.data;
  },
};

export default inventoryApi;
