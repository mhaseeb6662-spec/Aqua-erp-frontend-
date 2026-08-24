import api from './api';

const salesPerformanceService = {
  getOverview: (params) => api.get('/sales-performance/overview', { params }),
  getByRep: (params) => api.get('/sales-performance/by-rep', { params }),
  getBySource: (params) => api.get('/sales-performance/by-source', { params }),
  getByStage: (params) => api.get('/sales-performance/by-stage', { params }),
};

export default salesPerformanceService;
