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
  getPayments: (params) => api.get('/finance/payments', { params }),

  // Refunds
  getRefunds: (params) => api.get('/finance/refunds', { params }),
  processRefund: (data) => api.post('/finance/refunds', data),

  // Receipts
  getReceipts: (params) => api.get('/finance/receipts', { params }),
};

export default financeService;
