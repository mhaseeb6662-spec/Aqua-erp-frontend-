import api from './api';

const managementService = {
  getOverview: (params) => api.get('/management/overview', { params }),
  getRevenue: (params) => api.get('/management/revenue', { params }),
  getSales: (params) => api.get('/management/sales', { params }),
  getOperations: (params) => api.get('/management/operations', { params }),
  getStaffCoaches: (params) => api.get('/management/staff-coaches', { params }),
  getBranches: (params) => api.get('/management/branches', { params }),
  getPrograms: (params) => api.get('/management/programs', { params }),
  getKpis: () => api.get('/management/kpis'),
  getReports: (params) => api.get('/management/reports', { params }),
  getAlerts: () => api.get('/management/alerts'),
  updateAlert: (id, data) => api.put(`/management/alerts/${id}`, data),
  getAuditExplorer: (params) => api.get('/management/audit', { params }),
  getDrilldown: (params) => api.get('/management/drilldown', { params }),
};

export default managementService;
