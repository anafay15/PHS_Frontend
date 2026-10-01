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

export const PROJECT_STATUS_TRANSITIONS = {
  LEAD: ['QUOTED'],
  QUOTED: ['BOOKED', 'LEAD'],
  BOOKED: ['SHOOTING', 'QUOTED'],
  SHOOTING: ['EDITING'],
  EDITING: ['CLIENT_REVIEW'],
  CLIENT_REVIEW: ['CHANGES_REQUESTED', 'APPROVED'],
  CHANGES_REQUESTED: ['CLIENT_REVIEW'],
  APPROVED: ['DELIVERED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
};

export function getAllowedProjectStatuses(currentStatus) {
  const current = currentStatus || 'LEAD';
  const next = PROJECT_STATUS_TRANSITIONS[current] || [];
  return [current, ...next.filter((status) => status !== current)];
}

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
