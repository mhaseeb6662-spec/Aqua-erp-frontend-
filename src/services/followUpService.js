import api from './api';

// Follow-ups can be attached to either a lead or a customer via entityType/entityId.
const followUpService = {
  getFollowUps: (entityType, entityId) => api.get('/follow-ups', { params: { entityType, entityId } }),
  getMyFollowUps: (params) => api.get('/follow-ups/mine', { params }),
  createFollowUp: (payload) => api.post('/follow-ups', payload),
  updateFollowUp: (id, payload) => api.patch(`/follow-ups/${id}`, payload),
  completeFollowUp: (id, outcomeNote) => api.patch(`/follow-ups/${id}/complete`, { outcomeNote }),
  deleteFollowUp: (id) => api.delete(`/follow-ups/${id}`),
};

export default followUpService;
