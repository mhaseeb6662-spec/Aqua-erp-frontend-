import api from './api';

// Manual calendar: leads placed on the calendar as demo/trial slots, and
// real class sessions for enrolled students (with a teacher + time). Each
// event also carries a roster (registrations) of people bucketed into
// Enrollments / Trials / Waitlist, shown on the event detail panel.
const calendarService = {
  getEvents: (params) => api.get('/calendar', { params }),
  getEvent: (id) => api.get(`/calendar/${id}`),
  getTeacherOptions: () => api.get('/calendar/teachers'),
  getLocationOptions: () => api.get('/calendar/locations'),
  getBoats: () => api.get('/operations/vessels'),
  createEvent: (payload) => api.post('/calendar', payload),
  updateEvent: (id, payload) => api.patch(`/calendar/${id}`, payload),
  updateStatus: (id, status) => api.patch(`/calendar/${id}/status`, { status }),
  deleteEvent: (id) => api.delete(`/calendar/${id}`),

  // Enrollments / Trials / Waitlist roster & quick actions
  addRegistration: (eventId, payload) => api.post(`/calendar/${eventId}/registrations`, payload),
  removeRegistration: (eventId, regId) => api.delete(`/calendar/${eventId}/registrations/${regId}`),
  updateAttendance: (eventId, regId, attendance) =>
    api.patch(`/calendar/${eventId}/registrations/${regId}/attendance`, { attendance }),
  updatePaymentStatus: (eventId, regId, paymentStatus) =>
    api.patch(`/calendar/${eventId}/registrations/${regId}/payment-status`, { paymentStatus }),
  quickCreateStudent: (payload) => api.post('/calendar/quick-student', payload),
};

export default calendarService;
