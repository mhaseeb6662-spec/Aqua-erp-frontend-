import api from './api';

const subjectService = {
  getSubjects: (params) => api.get('/subjects', { params }),
  getSubject: (id) => api.get(`/subjects/${id}`),
  createSubject: (data) => api.post('/subjects', data),
  updateSubject: (id, data) => api.patch(`/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),
};

export default subjectService;
