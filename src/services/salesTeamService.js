import api from './api';

const salesTeamService = {
  getSalesTeam: (params) => api.get('/sales-team', { params }),
  getTeamMemberStats: (userId, params) => api.get(`/sales-team/${userId}/stats`, { params }),
};

export default salesTeamService;
