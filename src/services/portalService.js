import api from './api';

const portalService = {
  // Programs
  getPrograms: (params) => api.get('/programs', { params }),
  getProgram: (id) => api.get(`/programs/${id}`),
  createProgram: (data) => api.post('/programs', data),
  updateProgram: (id, data) => api.put(`/programs/${id}`, data),
  deleteProgram: (id, forceArchive = false) => api.delete(`/programs/${id}${forceArchive ? '?archive=true' : ''}`),
  checkProgramDependencies: (id) => api.get(`/programs/${id}/dependencies`),

  // Branches
  getBranches: () => api.get('/branches'),
  getBranch: (id) => api.get(`/branches/${id}`),
  createBranch: (data) => api.post('/branches', data),
  updateBranch: (id, data) => api.put(`/branches/${id}`, data),
  deleteBranch: (id) => api.delete(`/branches/${id}`),

  // Student Profile
  getStudentProfile: (userId) => api.get(userId ? `/students/profile/${userId}` : '/students/profile'),
  updateStudentProfile: (data, userId) => api.put(userId ? `/students/profile/${userId}` : '/students/profile', data),
  getAllStudents: () => api.get('/students/all'),

  // Parent Portal
  getParentProfile: () => api.get('/parents/profile'),
  getAllParents: () => api.get('/parents/all'),
  updateParentProfile: (data) => api.put('/parents/profile', data),
  linkChild: (studentIdentifier) => api.post('/parents/link-child', { studentIdentifier }),
  createChild: (data) => api.post('/parents/create-child', data),

  // Bookings
  getBookings: (studentId) => api.get('/bookings', { params: studentId ? { studentId } : {} }),
  createBooking: (data) => api.post('/bookings', data),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),

  // Schedules
  getSchedules: (studentId) => api.get('/schedules', { params: studentId ? { studentId } : {} }),
  updateScheduleStatus: (id, data) => api.put(`/schedules/${id}/status`, data),

  // Documents
  getDocuments: (studentId) => api.get('/documents', { params: studentId ? { studentId } : {} }),
  uploadDocument: (data) => api.post('/documents', data),
  reviewDocument: (id, data) => api.put(`/documents/${id}/review`, data),

  // Notifications
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  broadcastAnnouncement: (data) => api.post('/notifications/broadcast', data),
};

export default portalService;
