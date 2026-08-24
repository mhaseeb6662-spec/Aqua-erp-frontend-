import api from './api';

const leadService = {
  getLeads: (params) => api.get('/leads', { params }),
  getLead: (id) => api.get(`/leads/${id}`),
  createLead: (payload) => api.post('/leads', payload),
  updateLead: (id, payload) => api.patch(`/leads/${id}`, payload),
  deleteLead: (id) => api.delete(`/leads/${id}`),

  // Lead assignment & distribution
  assignLead: (id, assignedTo) => api.patch(`/leads/${id}/assign`, { assignedTo }),
  bulkAssign: (leadIds, assignedTo) => api.patch('/leads/bulk-assign', { leadIds, assignedTo }),

  // Pipeline / sales stage tracking
  updateStage: (id, stage) => api.patch(`/leads/${id}/stage`, { stage }),
  getPipeline: (params) => api.get('/leads/pipeline', { params }),

  // Lead conversion
  convertLead: (id, payload) => api.post(`/leads/${id}/convert`, payload),
};

export default leadService;
