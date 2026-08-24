import api from './api';

const integrationService = {
  getStatuses: () => api.get('/integrations/statuses'),
  updateConfig: (provider, data) => api.put(`/integrations/${provider}`, data),
  testConnection: (provider) => api.post(`/integrations/${provider}/test`),
  getLogs: (params) => api.get('/integrations/logs', { params }),
};

export default integrationService;
