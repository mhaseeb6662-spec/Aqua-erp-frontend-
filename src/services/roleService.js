import api from './api';

const roleService = {
  getRoles: () => api.get('/roles'),
  getPermissions: () => api.get('/roles/permissions'),
  createRole: (payload) => api.post('/roles', payload),
  updateRole: (id, payload) => api.patch(`/roles/${id}`, payload),
  deleteRole: (id) => api.delete(`/roles/${id}`),
};

export default roleService;
