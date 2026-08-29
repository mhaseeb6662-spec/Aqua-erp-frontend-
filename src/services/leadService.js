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

  // CSV Import & Export & Validation
  exportLeadsCsv: (params) => api.get('/leads/export', { params, responseType: 'blob' }),
  uploadLeadCsv: (formData) => api.post('/leads/import/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  validateLeadCsv: (payload) => api.post('/leads/import/validate', payload),
  executeLeadImport: (payload) => api.post('/leads/import/execute', payload),
  getImportBatches: (params) => api.get('/leads/import/batches', { params }),
  getImportBatch: (id) => api.get(`/leads/import/batches/${id}`),
  downloadCsvTemplate: () => api.get('/leads/import/template', { responseType: 'blob' }),
};

export default leadService;
