import api from './api';

const coachService = {
  getDashboard: () => api.get('/coach/dashboard'),
  getSessions: (params) => api.get('/coach/sessions', { params }),
  getSessionById: (id) => api.get(`/coach/sessions/${id}`),
  updateAttendance: (id, data) => api.put(`/coach/sessions/${id}/attendance`, data),
  getAssignedStudents: () => api.get('/coach/students'),
  createProgressNote: (data) => api.post('/coach/progress', data),
  submitSessionReport: (data) => api.post('/coach/reports', data),
  uploadMedia: (data) => api.post('/coach/media', data),
  issueAchievement: (data) => api.post('/coach/achievements', data),
  getMyCertifications: () => api.get('/coach/my-certifications'),
  getAllCoachesAdmin: () => api.get('/coach/admin/all-coaches'),
};

export default coachService;
