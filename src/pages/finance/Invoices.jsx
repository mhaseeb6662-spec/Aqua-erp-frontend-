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
  FileText, Plus, Search, Filter, Printer, Download, Send, CreditCard,
  CheckCircle2, AlertCircle, Clock, X, ShieldAlert, Trash2, Tag, Info, User, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AcademyLogo from '../../components/common/AcademyLogo';
import html2pdf from 'html2pdf.js';

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

  // Student Picker Modal State
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Dropdown lists
  const [allUsers, setAllUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [branches, setBranches] = useState([]);

  // Create Invoice Form State (matching client reference)
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [invoiceSuffix, setInvoiceSuffix] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invoicedById, setInvoicedById] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [roundingAdjustment, setRoundingAdjustment] = useState(0);
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
      const usersList = uRes.data.data || [];
      setAllUsers(usersList);

      // Separate students and staff
      const studentList = usersList.filter(
        (u) =>
          u.isStudent ||
          u.studentCode ||
          u.role?.slug === 'student' ||
          (u.role?.name && u.role.name.toLowerCase().includes('student'))
      );
      setStudents(studentList.length > 0 ? studentList : usersList);

      const staffList = usersList.filter(
        (u) =>
          u.role?.slug !== 'student' &&
          u.role?.slug !== 'parent' &&
          !(u.role?.name && u.role.name.toLowerCase().includes('student')) &&
          !(u.role?.name && u.role.name.toLowerCase().includes('parent'))
      );
      setStaffMembers(staffList.length > 0 ? staffList : usersList);

      setPrograms(pRes.data.data || []);
      setBranches(bRes.data.data || []);
    } catch (err) {
      console.error('Error loading invoice form data:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleOpenCreateModal = () => {
    loadCreateData();
    // Unique 4-digit invoice suffix matching reference format (e.g. AFA-6838)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    setInvoiceSuffix(randomSuffix);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const due = new Date(today.getTime() + 15 * 86400000);
    const dueStr = due.toISOString().split('T')[0];
    setIssueDate(todayStr);
    setDueDate(dueStr);

    setInvoicedById(user?._id || user?.id || '');
    setSelectedStudent(null);
    setStudentSearchTerm('');
    setShowStudentPicker(false);

    // Initial Line Item
    setLineItems([
      {
        id: Date.now(),
        item: 'Professional Angling Masterclass',
        quantity: 1,
        unitPrice: 1200,
        showDiscount: false,
        discountType: 'fixed',
        discountValue: 0,
        showValidity: false,
        validity: '',
        showDescription: false,
        description: 'Comprehensive maritime & coastal angling instruction.',
        showTax: false,
        taxRate: 5,
        program: '',
      },
    ]);

    setShowCouponInput(false);
    setCouponCode('');
    setCouponDiscount(0);
    setRoundingAdjustment(0);
    setNotes('Thank you for choosing Aqua Fishing Academy.');

    setShowCreateModal(true);
  };

  const handleAddNewLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now() + Math.random(),
        item: '',
        quantity: 1,
        unitPrice: 0,
        showDiscount: false,
        discountType: 'fixed',
        discountValue: 0,
        showValidity: false,
        validity: '',
        showDescription: false,
        description: '',
        showTax: false,
        taxRate: 5,
        program: '',
      },
    ]);
  };

  const handleLineItemFieldChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  const handleToggleItemOption = (index, field) => {
    const updated = [...lineItems];
    updated[index][field] = !updated[index][field];
    setLineItems(updated);
  };

  const handleSelectProgramForItem = (index, programId) => {
    const prog = programs.find((p) => p._id === programId);
    if (!prog) return;
    const updated = [...lineItems];
    updated[index].program = prog._id;
    updated[index].item = prog.title;
    if (prog.price) updated[index].unitPrice = prog.price;
    if (prog.description) updated[index].description = prog.description;
    setLineItems(updated);
  };

  const handleRemoveLineItem = (index) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Calculations for Create Modal matching reference
  const calculatedItems = lineItems.map((item) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const price = Math.max(0, Number(item.unitPrice) || 0);
    const base = qty * price;
    let discAmount = 0;
    if (item.showDiscount) {
      if (item.discountType === 'percentage') {
        discAmount = (base * Math.min(100, Math.max(0, Number(item.discountValue) || 0))) / 100;
      } else {
        discAmount = Math.min(base, Math.max(0, Number(item.discountValue) || 0));
      }
    }
    const taxable = Math.max(0, base - discAmount);
    const rate = item.showTax ? Number(item.taxRate) || 0 : 5; // default 5% VAT in UAE
    const tax = (taxable * rate) / 100;
    const total = taxable + tax;
    return {
      ...item,
      baseAmount: base,
      discountAmount: discAmount,
      taxableAmount: taxable,
      taxAmount: tax,
      lineTotal: total,
    };
  });

  const formSubtotal = calculatedItems.reduce((sum, item) => sum + item.baseAmount, 0);
  const formTotalItemDiscounts = calculatedItems.reduce((sum, item) => sum + item.discountAmount, 0);
  const formCouponDiscount = showCouponInput ? Math.max(0, Number(couponDiscount) || 0) : 0;
  const formTotalDiscounts = formTotalItemDiscounts + formCouponDiscount;
  const formTotalExcludingTax = Math.max(0, formSubtotal - formTotalDiscounts);
  const formTotalTax = calculatedItems.reduce((sum, item) => sum + item.taxAmount, 0);
  const formRounding = Number(roundingAdjustment) || 0;
  const formGrandTotal = Math.max(0, formTotalExcludingTax + formTotalTax + formRounding);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      return toast.error('Please select a student for this invoice');
    }
    if (lineItems.length === 0) {
      return toast.error('Please add at least one item to the invoice');
    }
    for (let i = 0; i < lineItems.length; i++) {
      if (!lineItems[i].item || !lineItems[i].item.trim()) {
        return toast.error(`Item #${i + 1} requires a valid item name`);
      }
      if (Number(lineItems[i].quantity) < 1) {
        return toast.error(`Item #${i + 1} quantity must be at least 1`);
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        studentId: selectedStudent._id,
        customerId: selectedStudent._id,
        invoicedById: invoicedById || user?._id || user?.id,
        customInvoiceNumber: invoiceSuffix ? `AFA-${invoiceSuffix.trim()}` : undefined,
        issuedDate: issueDate,
        dueDate: dueDate,
        lineItems: calculatedItems.map((it) => ({
          item: it.item.trim(),
          description: it.showDescription ? it.description.trim() : '',
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          discount: it.showDiscount
            ? {
                type: it.discountType,
                value: Number(it.discountValue) || 0,
                amount: it.discountAmount,
              }
            : undefined,
          validity: it.showValidity && it.validity ? it.validity : undefined,
          taxRate: it.showTax ? Number(it.taxRate) || 0 : 5,
          program: it.program || undefined,
        })),
        coupon:
          showCouponInput && couponCode.trim()
            ? {
                code: couponCode.trim(),
                discountAmount: formCouponDiscount,
              }
            : undefined,
        roundingAdjustment: formRounding,
        taxRate: 5,
        notes,
      };

      const res = await financeService.createInvoice(payload);
      toast.success('Invoice created successfully!');
      setShowCreateModal(false);
      await fetchInvoices();
      if (res.data?.data) {
        setSelectedInvoice(res.data.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Invoice creation error:', err);
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

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!selectedInvoice) return;
    const element = document.getElementById('printable-invoice');
    if (!element) return;

    setIsDownloading(true);
    try {
      const opt = {
        margin: [0.4, 0.4, 0.4, 0.4],
        filename: `invoice-${selectedInvoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Generation Error:', err);
      toast.error('Unable to generate invoice PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
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

    const q = searchTerm.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(q) ||
      (inv.customer?.fullName || '').toLowerCase().includes(q) ||
      (inv.student?.fullName || '').toLowerCase().includes(q) ||
      (inv.student?.studentCode || '').toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const filteredStudents = students.filter((s) => {
    const q = studentSearchTerm.toLowerCase();
    return (
      (s.fullName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.studentCode || '').toLowerCase().includes(q) ||
      (s.phone || '').toLowerCase().includes(q)
    );
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
                    <th className="px-6 py-4">Student / Customer</th>
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
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {inv.student?.fullName || inv.customer?.fullName || 'Customer'}
                        </div>
                        {inv.student?.studentCode && (
                          <div className="text-xs font-mono text-slate-400">ID: {inv.student.studentCode}</div>
                        )}
                        {inv.customer && inv.student && inv.customer.fullName !== inv.student.fullName && (
                          <div className="text-[11px] text-slate-500">Payer: {inv.customer.fullName}</div>
                        )}
                      </td>
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

        {/* ========================================================================= */}
        {/* INVOICE DETAIL / GENERATED INVOICE MODAL                                  */}
        {/* ========================================================================= */}
        {showDetailModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 no-print flex-wrap gap-3">
                <h2 className="font-display text-lg font-bold text-marine">Invoice Preview</h2>
                <div className="flex items-center gap-2 no-print flex-wrap">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 no-print disabled:opacity-50 transition"
                  >
                    {isDownloading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent"></div>
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {isDownloading ? 'Downloading...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-tide px-3.5 py-2 text-xs font-bold text-white hover:bg-tide-dark no-print transition"
                  >
                    <Printer className="h-4 w-4" /> Print Invoice
                  </button>
                  <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600 no-print ml-2">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Printable Invoice Sheet matching reference specifications */}
              <div id="printable-invoice" className="printable-document mt-6 p-8 bg-white text-slate-800 font-sans leading-relaxed border border-slate-200 rounded-xl">
                {/* Header */}
                <div className="flex justify-between items-start pb-6 border-b border-slate-100">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tax Invoice</h1>
                    <p className="text-xs text-slate-500 mt-1">Official Document &bull; Aqua Fishing Academy</p>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <AcademyLogo variant="invoice" />
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs py-4 border-b border-slate-100">
                  <div className="space-y-1.5">
                    <div className="flex gap-4">
                      <span className="w-32 font-semibold text-slate-500">Invoice number:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedInvoice.invoiceNumber}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="w-32 font-semibold text-slate-500">Date of issue:</span>
                      <span className="font-medium text-slate-900">
                        {new Date(selectedInvoice.issuedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <span className="w-32 font-semibold text-slate-500">Date due:</span>
                      <span className="font-medium text-slate-900">
                        {new Date(selectedInvoice.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:text-right">
                    {selectedInvoice.invoicedBy && (
                      <div>
                        <span className="font-semibold text-slate-500">Invoiced by: </span>
                        <span className="font-medium text-slate-900">
                          {selectedInvoice.invoicedBy?.fullName || 'Aqua Staff'}
                          {selectedInvoice.invoicedBy?.role?.name ? ` (${selectedInvoice.invoicedBy.role.name})` : ''}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-slate-500">Payment Status: </span>
                      <span
                        className={`inline-block font-bold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded ${
                          selectedInvoice.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedInvoice.status === 'Overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {selectedInvoice.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Addresses & Student Information */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs py-6 border-b border-slate-100">
                  {/* Bill From */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">BILL FROM</p>
                    <p className="font-bold text-slate-900">Aqua Fishing Academy</p>
                    <p className="text-slate-600">Dubai Marina / UAE</p>
                    <p className="text-slate-600">+971 56 990 5688</p>
                    <p className="text-slate-600">info@aquafishingacademy.com</p>
                    <p className="text-slate-500 text-[10px]">TRN: 100482910400003</p>
                  </div>

                  {/* Bill To */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">BILL TO / PAYER</p>
                    <p className="font-bold text-slate-900">{selectedInvoice.customer?.fullName || 'Customer'}</p>
                    <p className="text-slate-600">{selectedInvoice.branch?.city || 'United Arab Emirates'}</p>
                    <p className="text-slate-600">{selectedInvoice.customer?.email || '—'}</p>
                    <p className="text-slate-600">{selectedInvoice.customer?.phone || '—'}</p>
                  </div>

                  {/* Student Information */}
                  <div className="space-y-1 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                    <p className="font-bold text-tide uppercase tracking-wider text-[11px]">STUDENT INFORMATION</p>
                    <p className="font-bold text-slate-900">{selectedInvoice.student?.fullName || selectedInvoice.customer?.fullName}</p>
                    {selectedInvoice.student?.studentCode && (
                      <p className="text-slate-600 font-mono text-[11px]">ID: {selectedInvoice.student.studentCode}</p>
                    )}
                    <p className="text-slate-600 truncate">{selectedInvoice.program?.title || 'Maritime Angling Course'}</p>
                    <p className="text-slate-500 font-medium">{selectedInvoice.branch?.name || 'Main Branch'}</p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border-b border-slate-200 py-3">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                        <th className="py-2.5">ITEM &amp; DESCRIPTION</th>
                        <th className="py-2.5 text-center w-16">QTY</th>
                        <th className="py-2.5 text-right w-24">PRICE (AED)</th>
                        <th className="py-2.5 text-right w-20">DISCOUNT</th>
                        <th className="py-2.5 text-right w-16">TAX</th>
                        <th className="py-2.5 text-right w-24">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedInvoice.lineItems?.map((item, idx) => (
                        <tr key={idx} className="text-slate-800 font-medium">
                          <td className="py-3 pr-4">
                            <div className="font-bold text-slate-900">{item.item || item.description}</div>
                            {item.description && item.item && item.description !== item.item && (
                              <div className="text-[11px] text-slate-500">{item.description}</div>
                            )}
                            {item.validity && (
                              <div className="text-[10px] text-tide font-medium">
                                Valid until: {new Date(item.validity).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="py-3 text-center">{item.quantity}</td>
                          <td className="py-3 text-right">{formatAED(item.unitPrice)}</td>
                          <td className="py-3 text-right text-emerald-600">
                            {item.discount?.amount > 0 ? `-${formatAED(item.discount.amount)}` : '—'}
                          </td>
                          <td className="py-3 text-right">{item.taxRate !== undefined ? `${item.taxRate}%` : '5%'}</td>
                          <td className="py-3 text-right font-bold text-slate-900">{formatAED(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-end pt-6">
                  <div className="w-80 space-y-2 text-xs font-medium">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-bold text-slate-900">{formatAED(selectedInvoice.subtotal)}</span>
                    </div>
                    {(selectedInvoice.discount > 0 || selectedInvoice.coupon?.discountAmount > 0) && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discounts &amp; Coupons:</span>
                        <span>-{formatAED((selectedInvoice.discount || 0) + (selectedInvoice.coupon?.discountAmount || 0))}</span>
                      </div>
                    )}
                    {selectedInvoice.totalExcludingTax !== undefined && (
                      <div className="flex justify-between text-slate-600">
                        <span>Total excluding tax:</span>
                        <span className="font-bold text-slate-900">{formatAED(selectedInvoice.totalExcludingTax)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Taxes (VAT {selectedInvoice.taxRate || 5}%):</span>
                      <span className="font-bold text-slate-900">{formatAED(selectedInvoice.taxAmount)}</span>
                    </div>
                    {selectedInvoice.roundingAdjustment !== 0 && selectedInvoice.roundingAdjustment !== undefined && (
                      <div className="flex justify-between text-slate-600">
                        <span>Rounded off:</span>
                        <span>{formatAED(selectedInvoice.roundingAdjustment)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-2">
                      <span>Total Amount:</span>
                      <span className="text-marine">{formatAED(selectedInvoice.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-amber-600">
                      <span>Balance Due:</span>
                      <span>{formatAED(selectedInvoice.balanceDue)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes & Footer */}
                {selectedInvoice.notes && (
                  <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-500">
                    <p className="font-semibold text-slate-700">Notes &amp; Terms:</p>
                    <p className="mt-0.5">{selectedInvoice.notes}</p>
                  </div>
                )}

                <div className="pt-8 text-right text-[11px] text-slate-400 font-medium">
                  Page 1 of 1 &bull; Aqua Fishing Academy ERP
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CREATE INVOICE MODAL (EXACTLY MATCHING CLIENT REFERENCE FORMAT)             */}
        {/* ========================================================================= */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-display text-xl font-bold text-slate-900">Create invoice</h2>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="mt-6 space-y-6">
                {/* SECTION 1: STUDENT & INVOICE DETAILS (2-COLUMN GRID) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* LEFT: STUDENT SELECTION CARD */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Student</label>
                    {selectedStudent ? (
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-tide text-white font-bold text-sm shadow-xs">
                            {selectedStudent.fullName
                              ? selectedStudent.fullName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)
                              : 'ST'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{selectedStudent.fullName}</p>
                            <p className="text-xs text-slate-500">
                              {selectedStudent.email || (selectedStudent.studentCode ? `ID: ${selectedStudent.studentCode}` : 'No email provided')}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(null)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-rose-600 transition"
                          title="Remove selected student"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowStudentPicker(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-dashed border-tide/40 bg-tide/5 px-4 py-3.5 text-sm font-semibold text-tide hover:bg-tide/10 transition w-full justify-center"
                      >
                        <Plus className="h-4 w-4" /> Add student
                      </button>
                    )}
                    {selectedStudent && (
                      <button
                        type="button"
                        onClick={() => setShowStudentPicker(true)}
                        className="text-xs font-medium text-tide hover:underline inline-block pt-1"
                      >
                        Change student
                      </button>
                    )}
                  </div>

                  {/* RIGHT: INVOICE NUMBER, DATES, INVOICED BY */}
                  <div className="space-y-4">
                    {/* Invoice number with AFA- prefix badge */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice number</label>
                      <div className="flex rounded-xl border border-slate-200 overflow-hidden shadow-xs focus-within:border-tide focus-within:ring-1 focus-within:ring-tide">
                        <span className="inline-flex items-center bg-slate-100 px-3 text-xs font-bold text-slate-600 border-r border-slate-200">
                          AFA-
                        </span>
                        <input
                          type="text"
                          required
                          value={invoiceSuffix}
                          onChange={(e) => setInvoiceSuffix(e.target.value.replace(/[^0-9a-zA-Z-]/g, ''))}
                          placeholder="6838"
                          className="w-full px-3 py-2 text-sm font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Issue date & Due date */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Issue date</label>
                        <input
                          type="date"
                          required
                          value={issueDate}
                          onChange={(e) => setIssueDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-tide focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Due date</label>
                        <input
                          type="date"
                          required
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-tide focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Invoiced by */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Invoiced by</label>
                      <select
                        value={invoicedById}
                        onChange={(e) => setInvoicedById(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-tide focus:outline-none text-slate-800"
                      >
                        <option value="">Select team member</option>
                        {staffMembers.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.fullName} {m.role?.name ? `(${m.role.name})` : ''}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Use this to assign revenue to the selected team member.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: ITEMS TABLE (MATCHING REFERENCE COLUMNS & SUB-ACTIONS) */}
                <div className="space-y-3 pt-2">
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-4 py-3">Item</th>
                          <th className="px-3 py-3 w-28">
                            <span className="inline-flex items-center gap-1">
                              Quantity
                              <Info className="h-3 w-3 text-slate-400" title="Quantity or Sessions" />
                            </span>
                          </th>
                          <th className="px-3 py-3 w-32">Price (AED)</th>
                          <th className="px-3 py-3 w-32 text-right">Amount (AED)</th>
                          <th className="px-3 py-3 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {calculatedItems.map((item, index) => (
                          <tr key={item.id} className="align-top hover:bg-slate-50/40">
                            <td className="px-4 py-3 space-y-2">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  required
                                  placeholder="Enter item name or select program..."
                                  value={item.item}
                                  onChange={(e) => handleLineItemFieldChange(index, 'item', e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium focus:border-tide focus:outline-none"
                                />
                                {programs.length > 0 && (
                                  <select
                                    value={item.program || ''}
                                    onChange={(e) => handleSelectProgramForItem(index, e.target.value)}
                                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600 focus:border-tide focus:outline-none max-w-[130px]"
                                    title="Auto-fill from Program catalog"
                                  >
                                    <option value="">Programs...</option>
                                    {programs.map((p) => (
                                      <option key={p._id} value={p._id}>
                                        {p.title}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>

                              {/* Interactive actions under item */}
                              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                                <button
                                  type="button"
                                  onClick={() => handleToggleItemOption(index, 'showDiscount')}
                                  className={`font-semibold inline-flex items-center gap-0.5 transition ${
                                    item.showDiscount ? 'text-emerald-600 hover:underline' : 'text-tide hover:underline'
                                  }`}
                                >
                                  {item.showDiscount ? '✓ Discount added' : '+ Add discount'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleItemOption(index, 'showValidity')}
                                  className={`font-semibold inline-flex items-center gap-0.5 transition ${
                                    item.showValidity ? 'text-marine hover:underline' : 'text-tide hover:underline'
                                  }`}
                                >
                                  {item.showValidity ? '✓ Validity set' : 'Validity'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleItemOption(index, 'showDescription')}
                                  className={`font-semibold inline-flex items-center gap-0.5 transition ${
                                    item.showDescription ? 'text-marine hover:underline' : 'text-tide hover:underline'
                                  }`}
                                >
                                  {item.showDescription ? '✓ Description added' : 'Description'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleItemOption(index, 'showTax')}
                                  className={`font-semibold inline-flex items-center gap-0.5 transition ${
                                    item.showTax ? 'text-amber-600 hover:underline' : 'text-tide hover:underline'
                                  }`}
                                >
                                  {item.showTax ? `Taxes (${item.taxRate}%)` : 'Taxes'}
                                </button>
                              </div>

                              {/* Inline expandable subforms */}
                              {item.showDiscount && (
                                <div className="flex items-center gap-2 rounded-lg bg-emerald-50/70 p-2 border border-emerald-100">
                                  <span className="text-[11px] font-semibold text-emerald-800">Discount:</span>
                                  <select
                                    value={item.discountType}
                                    onChange={(e) => handleLineItemFieldChange(index, 'discountType', e.target.value)}
                                    className="rounded border border-emerald-200 bg-white px-1.5 py-0.5 text-xs text-emerald-800"
                                  >
                                    <option value="fixed">AED (Fixed)</option>
                                    <option value="percentage">% (Percent)</option>
                                  </select>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={item.discountValue}
                                    onChange={(e) => handleLineItemFieldChange(index, 'discountValue', e.target.value)}
                                    className="w-20 rounded border border-emerald-200 bg-white px-2 py-0.5 text-xs text-emerald-900"
                                    placeholder="Value"
                                  />
                                  <span className="text-[11px] font-bold text-emerald-700">
                                    -{formatAED(item.discountAmount)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleItemOption(index, 'showDiscount')}
                                    className="text-emerald-500 hover:text-rose-500 ml-auto"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}

                              {item.showValidity && (
                                <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 border border-slate-200">
                                  <span className="text-[11px] font-semibold text-slate-700">Valid until:</span>
                                  <input
                                    type="date"
                                    value={item.validity}
                                    onChange={(e) => handleLineItemFieldChange(index, 'validity', e.target.value)}
                                    className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleToggleItemOption(index, 'showValidity')}
                                    className="text-slate-400 hover:text-rose-500 ml-auto"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}

                              {item.showDescription && (
                                <div className="space-y-1">
                                  <textarea
                                    rows="2"
                                    placeholder="Enter item description or syllabus details..."
                                    value={item.description}
                                    onChange={(e) => handleLineItemFieldChange(index, 'description', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-tide focus:outline-none"
                                  />
                                </div>
                              )}

                              {item.showTax && (
                                <div className="flex items-center gap-2 rounded-lg bg-amber-50/70 p-2 border border-amber-100">
                                  <span className="text-[11px] font-semibold text-amber-800">Tax Rate (%):</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={item.taxRate}
                                    onChange={(e) => handleLineItemFieldChange(index, 'taxRate', e.target.value)}
                                    className="w-16 rounded border border-amber-200 bg-white px-2 py-0.5 text-xs text-amber-900"
                                  />
                                  <span className="text-[11px] font-medium text-amber-700">
                                    +{formatAED(item.taxAmount)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleItemOption(index, 'showTax')}
                                    className="text-amber-500 hover:text-rose-500 ml-auto"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>

                            <td className="px-3 py-3">
                              <input
                                type="number"
                                min="1"
                                required
                                value={item.quantity}
                                onChange={(e) => handleLineItemFieldChange(index, 'quantity', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-center focus:border-tide focus:outline-none"
                              />
                            </td>

                            <td className="px-3 py-3">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                required
                                value={item.unitPrice}
                                onChange={(e) => handleLineItemFieldChange(index, 'unitPrice', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:border-tide focus:outline-none font-mono"
                              />
                            </td>

                            <td className="px-3 py-3 text-right font-mono font-semibold text-slate-800">
                              {formatAED(item.lineTotal)}
                            </td>

                            <td className="px-3 py-3 text-center">
                              {calculatedItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLineItem(index)}
                                  className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                  title="Delete item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddNewLineItem}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-tide hover:underline py-1"
                  >
                    <Plus className="h-4 w-4" /> Add item
                  </button>
                </div>

                {/* SECTION 3: TOTALS & COUPON BREAKDOWN */}
                <div className="flex flex-col sm:flex-row justify-between gap-6 border-t border-slate-100 pt-4">
                  <div className="flex-1 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Notes / Terms (Optional)</label>
                    <textarea
                      rows="3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Thank you for choosing Aqua Fishing Academy."
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-tide focus:outline-none text-slate-600"
                    />
                  </div>

                  <div className="w-full sm:w-80 space-y-2.5 text-xs">
                    {/* Coupon Section */}
                    <div>
                      {showCouponInput ? (
                        <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                              <Tag className="h-3.5 w-3.5 text-tide" /> Coupon Discount
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setShowCouponInput(false);
                                setCouponCode('');
                                setCouponDiscount(0);
                              }}
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Coupon Code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-tide focus:outline-none"
                            />
                            <input
                              type="number"
                              min="0"
                              placeholder="AED Amount"
                              value={couponDiscount}
                              onChange={(e) => setCouponDiscount(e.target.value)}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-tide focus:outline-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowCouponInput(true)}
                          className="text-xs font-semibold text-tide hover:underline inline-flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add coupon
                        </button>
                      )}
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900">{formatAED(formSubtotal)}</span>
                    </div>

                    {formTotalDiscounts > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discounts &amp; Coupons</span>
                        <span className="font-semibold">-{formatAED(formTotalDiscounts)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>Total excluding tax</span>
                      <span className="font-semibold text-slate-900">{formatAED(formTotalExcludingTax)}</span>
                    </div>

                    {formTotalTax > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Taxes (VAT)</span>
                        <span className="font-semibold text-slate-900">{formatAED(formTotalTax)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Rounded off</span>
                      <input
                        type="number"
                        step="0.01"
                        value={roundingAdjustment}
                        onChange={(e) => setRoundingAdjustment(e.target.value)}
                        className="w-20 rounded border border-slate-200 px-2 py-0.5 text-right font-mono text-xs focus:border-tide focus:outline-none"
                      />
                    </div>

                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-900">Total</span>
                      <span className="text-base font-bold text-marine">{formatAED(formGrandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-tide px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-tide-dark disabled:opacity-50 transition"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STUDENT SELECTOR MODAL                                                    */}
        {/* ========================================================================= */}
        {showStudentPicker && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-marine-dark/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display text-base font-bold text-slate-900">Select Student</h3>
                <button
                  type="button"
                  onClick={() => setShowStudentPicker(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search by name, student code, email, or phone..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-xs focus:border-tide focus:outline-none"
                />
              </div>

              <div className="mt-3 flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[50vh]">
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No matching students found.
                  </div>
                ) : (
                  filteredStudents.map((s) => (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => {
                        setSelectedStudent(s);
                        setShowStudentPicker(false);
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-50 text-left transition rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tide/10 text-tide font-bold text-xs">
                          {s.fullName
                            ? s.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)
                            : 'ST'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">{s.fullName}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            {s.studentCode && (
                              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                ID: {s.studentCode}
                              </span>
                            )}
                            <span>{s.email || 'No email provided'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-tide">Select</div>
                    </button>
                  ))
                )}
              </div>
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
