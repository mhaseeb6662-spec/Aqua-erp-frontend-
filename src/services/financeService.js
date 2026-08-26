import api from './api';

const financeService = {
  // Financial Dashboard & Metrics
  getDashboardMetrics: () => api.get('/finance/dashboard/metrics'),

  // Invoices
  getInvoices: (params) => api.get('/finance/invoices', { params }),
  getInvoice: (id) => api.get(`/finance/invoices/${id}`),
  createInvoice: (data) => api.post('/finance/invoices', data),
  sendInvoiceReminder: (id) => api.post(`/finance/invoices/${id}/reminder`),

  // Online Checkout & Payments
  processCheckout: (data) => api.post('/finance/checkout', data),
  recordPayment: (data) => api.post('/finance/record-payment', data),
  overrideInvoiceStatus: (id, data) => api.patch(`/finance/invoices/${id}/status-override`, data),
  getPayments: (params) => api.get('/finance/payments', { params }),
  getPaymentEvidence: (id) => api.get(`/finance/payments/${id}/evidence`),

  // Refunds
  getRefunds: (params) => api.get('/finance/refunds', { params }),
  processRefund: (data) => api.post('/finance/refunds', data),

  // Receipts
  getReceipts: (params) => api.get('/finance/receipts', { params }),
};

export default financeService;
