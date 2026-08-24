import api from './api';

const customerService = {
  getCustomers: (params) => api.get('/customers', { params }),
  getCustomer: (id) => api.get(`/customers/${id}`),
  createCustomer: (payload) => api.post('/customers', payload),
  updateCustomer: (id, payload) => api.patch(`/customers/${id}`, payload),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
};

export default customerService;
