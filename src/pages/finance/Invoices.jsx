import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import financeService from '../../services/financeService';
import userService from '../../services/userService';
import portalService from '../../services/portalService';
import OnlineCheckoutModal from './OnlineCheckoutModal';
import RecordPaymentModal from './RecordPaymentModal';
import StatusOverrideModal from './StatusOverrideModal';
import PaymentEvidenceModal from './PaymentEvidenceModal';
import toast from 'react-hot-toast';
import { formatAED } from '../../utils/currency';
import {
  FileText, Plus, Search, Filter, Printer, Send, CreditCard, DollarSign, CheckCircle2, AlertCircle, Clock, X, ShieldAlert, Image
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AcademyLogo from '../../components/common/AcademyLogo';

export default function Invoices() {
  const { user, hasPermission } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [recordPaymentInvoice, setRecordPaymentInvoice] = useState(null);
  const [showStatusOverrideModal, setShowStatusOverrideModal] = useState(false);
  const [statusOverrideInvoice, setStatusOverrideInvoice] = useState(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedEvidencePayment, setSelectedEvidencePayment] = useState(null);

  // Users & Programs list for invoice creation
  const [customers, setCustomers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [branches, setBranches] = useState([]);

  // Create Form State
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
  const [lineItems, setLineItems] = useState([
    { description: 'Academy Course Registration Fee', quantity: 1, unitPrice: 299 },
  ]);
  const [taxRate, setTaxRate] = useState(5);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('Thank you for choosing Aqua Fishing Academy.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await financeService.getInvoices();
      setInvoices(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCreateData = async () => {
    try {
      const [uRes, pRes, bRes] = await Promise.all([
        userService.getUsers({ limit: 100 }),
        portalService.getPrograms(),
        portalService.getBranches(),
      ]);
      setCustomers(uRes.data.data || []);
      setPrograms(pRes.data.data || []);
      setBranches(bRes.data.data || []);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleOpenCreateModal = () => {
    loadCreateData();
    setShowCreateModal(true);
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  const handleRemoveLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || lineItems.length === 0) {
      return toast.error('Please select customer and at least one line item');
    }
    setIsSubmitting(true);
    try {
      await financeService.createInvoice({
        customerId: selectedCustomer,
        programId: selectedProgram || null,
        branchId: selectedBranch || null,
        lineItems,
        taxRate,
        discount,
        dueDate,
        notes,
      });
      toast.success('Invoice created successfully!');
      setShowCreateModal(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReminder = async (invoiceId) => {
    try {
      await financeService.sendInvoiceReminder(invoiceId);
      toast.success('Payment reminder notification sent to customer!');
    } catch (err) {
      toast.error('Failed to send payment reminder');
    }
  };

  const handlePayOnline = (inv) => {
    setSelectedInvoice(inv);
    setShowCheckoutModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'paid'
        ? inv.status === 'Paid'
        : activeFilter === 'overdue'
        ? inv.status === 'Overdue'
        : inv.status === 'Sent' || inv.status === 'Partially Paid';

    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">Invoice Management</h1>
            <p className="text-sm text-slate-500">
              Generate student tuition invoices, track payment status, and collect online payments.
            </p>
          </div>
          {hasPermission('finance:invoices:create') && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-tide px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-tide-dark"
            >
              <Plus className="h-4 w-4" /> Create New Invoice
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {[
              { key: 'all', label: 'All Invoices' },
              { key: 'pending', label: 'Unpaid / Pending' },
              { key: 'paid', label: 'Paid' },
              { key: 'overdue', label: 'Overdue' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeFilter === tab.key
                    ? 'bg-tide text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice # or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-tide focus:outline-none"
            />
          </div>
        </div>

        {/* Invoices Table */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-semibold text-slate-700">No Invoices Found</h3>
            <p className="mt-1 text-sm text-slate-500">No invoice records match the selected filter query.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Issued Date</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Balance Due</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono font-bold text-marine">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{inv.customer?.fullName || 'Customer'}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(inv.issuedDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-marine">{formatAED(inv.totalAmount)}</td>
                      <td className="px-6 py-4 font-bold text-amber-600">{formatAED(inv.balanceDue)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : inv.status === 'Overdue'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {inv.status === 'Paid' && <CheckCircle2 className="h-3 w-3" />}
                          {inv.status === 'Overdue' && <AlertCircle className="h-3 w-3" />}
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setShowDetailModal(true);
                            }}
                            className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                            title="View Tax Invoice"
                          >
                            <FileText className="h-4 w-4" />
                          </button>

                          {inv.balanceDue > 0 && (
                            <>
                              <button
                                onClick={() => {
                                  setRecordPaymentInvoice(inv);
                                  setShowRecordPaymentModal(true);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                                title="Record POS / Card / Cash Payment"
                              >
                                <CreditCard className="h-3.5 w-3.5" /> Record Payment
                              </button>

                              <button
                                onClick={() => handlePayOnline(inv)}
                                className="inline-flex items-center gap-1 rounded-lg bg-tide px-2.5 py-1.5 text-xs font-bold text-white hover:bg-tide-dark shadow-xs"
                                title="Online Gateway Payment"
                              >
                                Pay Online
                              </button>

                              {hasPermission('finance:invoices:update') && (
                                <button
                                  onClick={() => handleSendReminder(inv._id)}
                                  className="rounded-lg bg-amber-50 p-2 text-amber-600 hover:bg-amber-100"
                                  title="Send Payment Reminder"
                                >
                                  <Send className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}

                          {hasPermission('finance:invoices:update') && (
                            <button
                              onClick={() => {
                                setStatusOverrideInvoice(inv);
                                setShowStatusOverrideModal(true);
                              }}
                              className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-amber-600"
                              title="Override Status"
                            >
                              <ShieldAlert className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invoice Detail / Print Modal */}
        {showDetailModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 no-print">
                <h2 className="font-display text-lg font-bold text-marine">Invoice Preview</h2>
                <div className="flex items-center gap-2 no-print">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-tide px-3.5 py-2 text-xs font-bold text-white hover:bg-tide-dark no-print"
                  >
                    <Printer className="h-4 w-4" /> Print Invoice
                  </button>
                  <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600 no-print">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Printable Invoice Sheet matching user image template */}
              <div className="printable-document mt-6 p-8 bg-white text-slate-800 font-sans leading-relaxed border border-slate-200 rounded-xl">
                {/* Header */}
                <div className="flex justify-between items-start pb-8">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tax Invoice</h1>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <AcademyLogo variant="invoice" />
                  </div>
                </div>

                {/* Meta details: Invoice Number, Date of issue, Date due */}
                <div className="grid grid-cols-2 gap-8 text-xs py-4">
                  <div className="space-y-1">
                    <div className="flex gap-4">
                      <span className="w-28 font-medium text-slate-600">Invoice number</span>
                      <span className="font-medium text-slate-900">{selectedInvoice.invoiceNumber.replace('INV-', 'AFA-INV/')}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="w-28 font-medium text-slate-600">Date of issue</span>
                      <span className="font-medium text-slate-900">
                        {new Date(selectedInvoice.issuedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <span className="w-28 font-medium text-slate-600">Date due</span>
                      <span className="font-medium text-slate-900">
                        {new Date(selectedInvoice.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div></div>
                </div>

                {/* Addresses & Student Information */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs pt-6 pb-6 border-b border-slate-100">
                  {/* Bill From */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">BILL FROM</p>
                    <p className="font-bold text-slate-900">Aqua Fishing Academy</p>
                    <p className="text-slate-600">United Arab Emirates</p>
                    <p className="text-slate-600">+971 56 990 5688</p>
                    <p className="text-slate-600">info@aquafishingacademy.com</p>
                  </div>

                  {/* Bill To */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">BILL TO / PAYER</p>
                    <p className="font-bold text-slate-900">{selectedInvoice.customer?.fullName || 'Customer'}</p>
                    <p className="text-slate-600">{selectedInvoice.branch?.city || 'United Arab Emirates'}</p>
                    <p className="text-slate-600">{selectedInvoice.customer?.email || '—'}</p>
                  </div>

                  {/* Student Information */}
                  <div className="space-y-1 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <p className="font-bold text-tide uppercase tracking-wider text-[11px]">STUDENT INFORMATION</p>
                    <p className="font-bold text-slate-900">{selectedInvoice.student?.fullName || selectedInvoice.customer?.fullName}</p>
                    {selectedInvoice.student?.studentCode && (
                      <p className="text-slate-600 font-mono text-[11px]">ID: {selectedInvoice.student.studentCode}</p>
                    )}
                    <p className="text-slate-600 truncate">{selectedInvoice.program?.title || 'Maritime Program'}</p>
                    <p className="text-slate-500 font-medium">{selectedInvoice.branch?.name || 'Dubai Marina Branch'}</p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border-b border-slate-300 py-2">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-2.5">DESCRIPTION</th>
                        <th className="py-2.5 text-center w-16">QTY</th>
                        <th className="py-2.5 text-right w-24">UNIT PRICE</th>
                        <th className="py-2.5 text-right w-20">DISCOUNT</th>
                        <th className="py-2.5 text-right w-16">TAX</th>
                        <th className="py-2.5 text-right w-24">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedInvoice.lineItems?.map((item, idx) => (
                        <tr key={idx} className="text-slate-800 font-medium">
                          <td className="py-3 pr-4">{item.description}</td>
                          <td className="py-3 text-center">{item.quantity}</td>
                          <td className="py-3 text-right">{formatAED(item.unitPrice)}</td>
                          <td className="py-3 text-right">{formatAED(selectedInvoice.discount || 0)}</td>
                          <td className="py-3 text-right">{selectedInvoice.taxRate || 5}%</td>
                          <td className="py-3 text-right font-bold">{formatAED(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-end pt-6">
                  <div className="w-72 space-y-2 text-xs font-medium">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-bold text-slate-900">{formatAED(selectedInvoice.subtotal)}</span>
                    </div>
                    {selectedInvoice.discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount:</span>
                        <span>-{formatAED(selectedInvoice.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Tax ({selectedInvoice.taxRate}%):</span>
                      <span className="font-bold text-slate-900">{formatAED(selectedInvoice.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-2">
                      <span>Total Amount:</span>
                      <span>{formatAED(selectedInvoice.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-amber-600">
                      <span>Balance Due:</span>
                      <span>{formatAED(selectedInvoice.balanceDue)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Page count */}
                <div className="pt-12 text-right text-[11px] text-slate-400 font-medium">
                  Page 1 of 1
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Invoice Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-display text-lg font-bold text-marine">Generate Invoice</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Select Customer *</label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  >
                    <option value="">Select Customer / Student</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.fullName} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Program / Course (Optional)</label>
                    <select
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    >
                      <option value="">Select Program</option>
                      {programs.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title} (AED {p.price})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Due Date</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">Invoice Line Items</label>
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Item Description"
                        required
                        value={item.description}
                        onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 p-2 text-xs focus:border-tide focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                        className="w-16 rounded-xl border border-slate-200 p-2 text-xs focus:border-tide focus:outline-none text-center"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        min="0"
                        required
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-24 rounded-xl border border-slate-200 p-2 text-xs focus:border-tide focus:outline-none"
                      />
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="mt-1 text-xs font-semibold text-tide hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Line Item
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Discount Amount ($)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-tide px-5 py-2 text-sm font-semibold text-white hover:bg-tide-dark disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Issue Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Online Checkout Modal */}
        {showCheckoutModal && selectedInvoice && (
          <OnlineCheckoutModal
            invoice={selectedInvoice}
            onClose={() => setShowCheckoutModal(false)}
            onSuccess={() => fetchInvoices()}
          />
        )}

        {/* Record Payment Modal (Physical Card / POS Machine, Cash, Bank Transfer) */}
        {showRecordPaymentModal && recordPaymentInvoice && (
          <RecordPaymentModal
            invoice={recordPaymentInvoice}
            onClose={() => {
              setShowRecordPaymentModal(false);
              setRecordPaymentInvoice(null);
            }}
            onSuccess={() => fetchInvoices()}
          />
        )}

        {/* Status Override Modal */}
        {showStatusOverrideModal && statusOverrideInvoice && (
          <StatusOverrideModal
            invoice={statusOverrideInvoice}
            onClose={() => {
              setShowStatusOverrideModal(false);
              setStatusOverrideInvoice(null);
            }}
            onSuccess={() => fetchInvoices()}
          />
        )}

        {/* Payment Evidence Modal */}
        {showEvidenceModal && selectedEvidencePayment && (
          <PaymentEvidenceModal
            payment={selectedEvidencePayment}
            onClose={() => {
              setShowEvidenceModal(false);
              setSelectedEvidencePayment(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
