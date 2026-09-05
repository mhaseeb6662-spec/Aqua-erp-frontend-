import api from './api';

const paymentService = {
  getPaymentLinks: (customerId) => api.get('/payment-links', { params: { customerId } }),
  generatePaymentLink: (payload) => api.post('/payment-links', payload),
  cancelPaymentLink: (id) => api.patch(`/payment-links/${id}/cancel`),
  getAvailableProviders: () => api.get('/payments/providers'),
  createCheckoutSession: (payload) => api.post('/payments/checkout', payload)
};

export default paymentService;
