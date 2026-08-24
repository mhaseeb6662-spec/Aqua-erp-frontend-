import api from './api';

const notificationService = {
  getUserNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getDeliveryLogs: (params) => api.get('/notifications/logs', { params }),
  getTemplates: () => api.get('/notifications/templates'),
  updateTemplate: (id, data) => api.put(`/notifications/templates/${id}`, data),
  retryNotification: (id) => api.post(`/notifications/${id}/retry`),
  runReminderCycle: () => api.post('/notifications/reminders/run'),
  broadcastAnnouncement: (data) => api.post('/notifications/broadcast', data),
};

export default notificationService;
