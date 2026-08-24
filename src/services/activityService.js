import api from './api';

// Unified activity timeline / interaction history for leads & customers.
const activityService = {
  getActivities: (entityType, entityId) => api.get('/activities', { params: { entityType, entityId } }),
  logActivity: (payload) => api.post('/activities', payload),
};

export default activityService;
