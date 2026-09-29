import api from './axios';

export const PROJECT_STATUSES = [
  'LEAD',
  'QUOTED',
  'BOOKED',
  'SHOOTING',
  'EDITING',
  'CLIENT_REVIEW',
  'CHANGES_REQUESTED',
  'APPROVED',
  'DELIVERED',
  'COMPLETED',
];

export const projectsApi = {
  getProjects: async (params) => {
    const response = await api.get('/api/projects', { params });
    return response.data;
  },

  getProject: async (id) => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post('/api/projects', projectData);
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const response = await api.put(`/api/projects/${id}`, projectData);
    return response.data;
  },

  updateProjectStatus: async (id, status) => {
    const response = await api.patch(`/api/projects/${id}/status`, { status });
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/api/projects/${id}`);
    return response.data;
  },
};

export default projectsApi;
