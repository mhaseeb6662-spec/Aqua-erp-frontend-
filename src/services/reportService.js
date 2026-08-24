import api from './api';

const reportService = {
  getDailyReport: (params) => api.get('/reports/daily', { params }),
  getWeeklyReport: (params) => api.get('/reports/weekly', { params }),
  getMonthlyReport: (params) => api.get('/reports/monthly', { params }),
  downloadCsvUrl: (type, params = {}) => {
    const query = new URLSearchParams({ type, ...params }).toString();
    const baseUrl = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1')).replace(/\/$/, '');
    return `${baseUrl}/reports/export/csv?${query}`;
  },
};

export default reportService;
