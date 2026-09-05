import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import OnlineCheckoutModal from '../finance/OnlineCheckoutModal';
import portalService from '../../services/portalService';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';
import { formatAED } from '../../utils/currency';
import {
  BookOpen, Search, Filter, Compass, Award, Users, DollarSign, Calendar, MapPin, CheckCircle2, Plus, X, ArrowRight, Edit, Trash2, Star, CreditCard, FileText, CheckCircle, ShieldCheck, Download, Receipt
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import AcademyLogo from '../../components/common/AcademyLogo';

export default function ProgramCatalogue() {
  const { user, hasPermission } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  // Modals
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  

  // Booking Wizard Steps: 'form' -> 'invoice' -> 'confirmation'
  const [bookingStep, setBookingStep] = useState('form');
  const [createdBooking, setCreatedBooking] = useState(null);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [completedReceipt, setCompletedReceipt] = useState(null);

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardHolder, setCardHolder] = useState(user?.fullName || '');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  // Booking Form State
  const [bookingBranch, setBookingBranch] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('09:00 AM - 11:00 AM');
  const [bookingType, setBookingType] = useState('Standard Class');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

    // Program Create/Edit Form
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState(null);
  
  // Delete/Archive Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);
  const [deleteDependencies, setDeleteDependencies] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [programForm, setProgramForm] = useState({
    title: "",
    description: "",
    ageGroup: "All Ages",
    durationWeeks: 4,
    durationHours: 1,
    durationMinutes: 0,
    price: 299,
    calendarColor: "Red",
    status: "active",
    branches: [],
    brochureUrl: "",
    brochureMetadata: null
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [progRes, branchRes] = await Promise.all([
        portalService.getPrograms({
          category: selectedCategory,
          level: selectedLevel,
          branch: selectedBranch,
          ...(hasPermission('portal:programs:manage') ? {} : { activeOnly: 'true' }),
        }),
        portalService.getBranches(),
      ]);
      setPrograms(progRes.data.data || []);
      setBranches(branchRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load program catalogue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedLevel, selectedBranch]);

  const handleOpenBooking = (program) => {
    setSelectedProgram(program);
    setBookingBranch(program.branches?.[0]?._id || branches[0]?._id || '');
    setBookingDate(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
    setBookingStep('form');
    setCreatedBooking(null);
    setGeneratedInvoice(null);
    setCompletedTransaction(null);
    setCompletedReceipt(null);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingBranch) {
      return toast.error('Please select a date and branch');
    }
    setIsSubmitting(true);
    try {
      const res = await portalService.createBooking({
        programId: selectedProgram._id,
        branchId: bookingBranch,
        sessionDate: bookingDate,
        slotTime: bookingSlot,
        bookingType,
        notes: bookingNotes,
      });
      const data = res.data.data;
      const bObj = data?.booking || data;
      const invObj = data?.invoice;

      setCreatedBooking(bObj);
      setGeneratedInvoice(invObj);

      if (bookingType === 'Trial Session' || !invObj || invObj.totalAmount === 0) {
        toast.success('Trial session reserved successfully! Check your schedule.');
        setBookingStep('confirmation');
      } else {
        toast.success('Invoice generated! Please complete online payment.');
        setBookingStep('invoice');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!generatedInvoice) return toast.error('Invoice missing');
    setIsSubmitting(true);
    try {
      const res = await financeService.processCheckout({
        invoiceId: generatedInvoice._id,
        amount: generatedInvoice.totalAmount,
        paymentMethod,
        cardDetails: { cardNumber, cardHolder, cardExpiry, cardCvv },
      });
      const data = res.data.data;
      setCompletedTransaction(data.transaction);
      setCompletedReceipt(data.receipt);
      toast.success('Payment successful! Booking confirmed & synchronized with Finance & Operations.');
      setBookingStep('confirmation');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed. Please check card details.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleOpenCreate = () => {
    setEditingProgramId(null);
    setProgramForm({
      title: "", description: "", ageGroup: "All Ages", durationWeeks: 4, durationHours: 1, durationMinutes: 0, price: 299, calendarColor: "Red", status: "active", branches: [], brochureUrl: "", brochureMetadata: null
    });
    setShowProgramModal(true);
  };

  const handleOpenEdit = (prog) => {
    setEditingProgramId(prog._id);
    setProgramForm({
      title: prog.title || "",
      description: prog.description || "",
      ageGroup: prog.ageGroup || "All Ages",
      durationWeeks: prog.durationWeeks || 4,
      durationHours: prog.durationHours || 1,
      durationMinutes: prog.durationMinutes || 0,
      price: prog.price || 0,
      calendarColor: prog.calendarColor || "Red",
      status: prog.status || "active",
      branches: (prog.branches || []).map(b => typeof b === 'object' ? b._id : b),
      brochureUrl: prog.brochureUrl || "",
      brochureMetadata: prog.brochureMetadata || null
    });
    setShowProgramModal(true);
  };

  const handleBrochureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPG, PNG and WEBP images are supported for the brochure.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Brochure image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProgramForm((prev) => ({
        ...prev,
        brochureUrl: reader.result,
        brochureMetadata: {
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleProgramSubmit = async (e) => {
    e.preventDefault();
    if (!programForm.title || !programForm.price) {
      return toast.error('Please fill required fields');
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...programForm,
        branches: programForm.branches.length ? programForm.branches : branches.map((b) => b._id),
      };
      if (editingProgramId) {
        await portalService.updateProgram(editingProgramId, payload);
        toast.success('Program updated successfully!');
      } else {
        await portalService.createProgram(payload);
        toast.success('New program added to catalogue!');
      }
      setShowProgramModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save program');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (prog) => {
    setProgramToDelete(prog);
    try {
      const res = await portalService.checkProgramDependencies(prog._id);
      setDeleteDependencies(res.data);
      setShowDeleteModal(true);
    } catch (err) {
      toast.error('Failed to check dependencies');
    }
  };

  const confirmDelete = async (archiveOnly) => {
    if (!programToDelete) return;
    setIsDeleting(true);
    try {
      if (archiveOnly) {
        await portalService.deleteProgram(programToDelete._id, true);
        toast.success('Program successfully archived.');
      } else {
        await portalService.deleteProgram(programToDelete._id);
        toast.success('Program permanently deleted.');
      }
      setShowDeleteModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete/archive program');
    } finally {
      setIsDeleting(false);
    }
  };


  const filteredPrograms = programs.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">Academy Program Catalogue</h1>
            <p className="text-sm text-slate-500">
              Explore fishing courses, specialized workshops, and certified angling programs across academy branches.
            </p>
          </div>
          {hasPermission('portal:programs:manage') && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-tide px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-tide-dark"
            >
              <Plus className="h-4 w-4" /> Add New Program
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="grid gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-tide focus:outline-none focus:ring-1 focus:ring-tide"
            />
          </div>

          

          

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="rounded-xl border border-slate-200 py-2 px-3 text-sm focus:border-tide focus:outline-none focus:ring-1 focus:ring-tide"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} ({b.city})
              </option>
            ))}
          </select>
        </div>

        {/* Programs Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-semibold text-slate-700">No Programs Found</h3>
            <p className="mt-1 text-sm text-slate-500">Try clearing filters or search query to find active academy courses.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPrograms.map((prog) => (
              <div
                key={prog._id}
                className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    {prog.brochureUrl ? (
                      <a href={prog.brochureUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 rounded-lg bg-marine/10 px-2.5 py-1 text-xs font-semibold text-marine hover:bg-marine/20 transition">
                        <FileText className="h-3.5 w-3.5" /> View Brochure
                      </a>
                    ) : (
                      <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">No brochure</span>
                    )}
                    <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
                      <span className={`inline-block w-3 h-3 rounded-full ${prog.calendarColor === 'Red' ? 'bg-red-500' : prog.calendarColor === 'Blue' ? 'bg-blue-500' : prog.calendarColor === 'Green' ? 'bg-emerald-500' : prog.calendarColor === 'Orange' ? 'bg-orange-500' : prog.calendarColor === 'Yellow' ? 'bg-yellow-500' : prog.calendarColor === 'Pink' ? 'bg-pink-500' : prog.calendarColor === 'Purple' ? 'bg-purple-500' : 'bg-slate-500'}`} title={prog.calendarColor}></span>
                      {hasPermission('portal:programs:manage') && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(prog); }} className="p-1 text-slate-400 hover:text-marine transition" title="Edit Program">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(prog); }} className="p-1 text-slate-400 hover:text-red-500 transition" title="Delete / Archive Program">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-3 font-display text-lg font-bold text-marine group-hover:text-tide transition leading-tight">
                    {prog.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-3">{prog.description}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Users className="h-4 w-4 text-tide" />
                      <span>{prog.ageGroup}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="h-4 w-4 text-tide" />
                      <span>{prog.durationWeeks} Weeks - {prog.durationHours ? prog.durationHours : (prog.durationMinutes ? prog.durationMinutes / 60 : 1)} hour(s)/session</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5 font-semibold text-marine">
                      <DollarSign className="h-4 w-4 text-tide" />
                      <span>{formatAED(prog.price)}</span>
                    </div>
                  </div>

                  {prog.branches && prog.branches.length > 0 && (
                    <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-tide" />
                      <span>Available at: {prog.branches.map((b) => b.name).join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    {prog.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Enrolling Open
                      </span>
                    ) : prog.status === 'inactive' ? (
                      <span className="text-slate-400">Archived</span>
                    ) : (
                      <span className="text-amber-600">Upcoming (Draft)</span>
                    )}
                  </span>
                  {prog.status === 'active' && (
                    <button
                      onClick={() => handleOpenBooking(prog)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-marine px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-marine-dark"
                    >
                      Book Session <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedProgram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-tide">Blueprint 7-Step Journey</span>
                  <h2 className="font-display text-lg font-bold text-marine">Book {selectedProgram.title}</h2>
                  <p className="text-xs text-slate-500">{formatAED(selectedProgram.price)} | {selectedProgram.category}</p>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 7-Step Progress Flow Indicator */}
              <div className="mt-3 rounded-xl bg-slate-50 p-2 border border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 overflow-x-auto">
                <span className={bookingStep === 'form' || bookingStep === 'invoice' || bookingStep === 'confirmation' ? 'text-tide font-extrabold' : ''}>1. Program ✓</span>
                <span>→</span>
                <span className={bookingStep === 'form' || bookingStep === 'invoice' || bookingStep === 'confirmation' ? 'text-tide font-extrabold' : ''}>2. Branch</span>
                <span>→</span>
                <span className={bookingStep === 'form' || bookingStep === 'invoice' || bookingStep === 'confirmation' ? 'text-tide font-extrabold' : ''}>3. Slot</span>
                <span>→</span>
                <span className={bookingStep === 'form' || bookingStep === 'invoice' || bookingStep === 'confirmation' ? 'text-tide font-extrabold' : ''}>4. Info</span>
                <span>→</span>
                <span className={bookingStep === 'invoice' || bookingStep === 'confirmation' ? 'text-tide font-extrabold' : ''}>5. Invoice</span>
                <span>→</span>
                <span className={bookingStep === 'invoice' || bookingStep === 'confirmation' ? 'text-tide font-extrabold' : ''}>6. Pay</span>
                <span>→</span>
                <span className={bookingStep === 'confirmation' ? 'text-emerald-600 font-extrabold' : ''}>7. Confirm</span>
              </div>

              {/* STEP 1-4: BOOKING FORM */}
              {bookingStep === 'form' && (
                <form onSubmit={handleBookingSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Select Academy Branch *</label>
                    <select
                      value={bookingBranch}
                      onChange={(e) => setBookingBranch(e.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    >
                      {branches.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name} - {b.city} ({b.address})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Preferred Date *</label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Slot Time *</label>
                      <select
                        value={bookingSlot}
                        onChange={(e) => setBookingSlot(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                      >
                        <option value="07:00 AM - 09:00 AM">07:00 AM - 09:00 AM (Early Bird)</option>
                        <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Morning)</option>
                        <option value="01:00 PM - 03:00 PM">01:00 PM - 03:00 PM (Afternoon)</option>
                        <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Booking Type</label>
                      <select
                        value={bookingType}
                        onChange={(e) => setBookingType(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                      >
                        <option value="Standard Class">Standard Class (AED {selectedProgram.price})</option>
                        <option value="Trial Session">Trial Session (FREE)</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Private Coaching">Private Coaching</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Total Price</label>
                      <div className="mt-1 rounded-xl bg-slate-100 p-2.5 text-sm font-bold text-marine">
                        {bookingType === 'Trial Session' ? 'FREE (Trial)' : formatAED(selectedProgram.price)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Special Notes / Student Requests</label>
                    <textarea
                      rows={2}
                      placeholder="E.g., Left-handed reel required, allergy notice..."
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowBookingModal(false)}
                      className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-tide px-5 py-2 text-sm font-bold text-white hover:bg-tide-dark disabled:opacity-50"
                    >
                      {isSubmitting ? 'Generating Invoice...' : 'Generate Invoice & Pay →'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 5 & 6: INVOICE GENERATED & PAY ONLINE */}
              {bookingStep === 'invoice' && generatedInvoice && (
                <div className="mt-4 space-y-5">
                  {/* Generated Invoice Card */}
                  <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Invoice</p>
                        <p className="font-mono text-sm font-bold text-marine">{generatedInvoice.invoiceNumber}</p>
                      </div>
                      <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 border border-amber-200">
                        {generatedInvoice.status || 'Pending Payment'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">Program:</span>
                        <p className="font-semibold text-marine">{selectedProgram.title}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Session Date:</span>
                        <p className="font-semibold text-marine">{bookingDate}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Time Slot:</span>
                        <p className="font-semibold text-marine">{bookingSlot}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Customer:</span>
                        <p className="font-semibold text-marine">{user?.fullName}</p>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="rounded-xl bg-white p-3 border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Course Fee:</span>
                        <span>{formatAED(generatedInvoice.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Academy Tax (5%):</span>
                        <span>{formatAED(generatedInvoice.taxAmount)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-marine text-sm pt-1 border-t border-slate-100">
                        <span>Total Due:</span>
                        <span className="text-tide">{formatAED(generatedInvoice.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                                    {/* Online Payment Form */}
                  <div className="mt-4">
                    <OnlineCheckoutModal
                      invoice={generatedInvoice}
                      onClose={() => setBookingStep('form')}
                      onSuccess={() => setBookingStep('confirmation')}
                      customReturnUrl={window.location.origin + '/bookings?payment_success=true'}
                    />
                  </div>
                </div>
              )}

              {/* STEP 7: CONFIRMATION & RECEIPT */}
              {bookingStep === 'confirmation' && (
                <div className="mt-4 text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 no-print">
                    <CheckCircle className="h-10 w-10" />
                  </div>

                  <div className="no-print">
                    <h3 className="font-display text-xl font-bold text-marine">Booking Confirmed!</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Your session for <span className="font-semibold text-marine">{selectedProgram?.title}</span> has been confirmed and synchronized with Finance and Operations.
                    </p>
                  </div>

                  {generatedInvoice && (
                    <div className="printable-document rounded-2xl bg-white p-6 border border-slate-200 text-xs space-y-3 text-left">
                      <div className="text-center border-b border-slate-100 pb-3 flex flex-col items-center">
                        <AcademyLogo variant="receipt" className="mb-2" />
                        <p className="text-[11px] text-slate-500 font-medium">Official Payment Receipt &amp; Booking Confirmation</p>
                        {completedReceipt && (
                          <p className="font-mono text-xs font-bold text-tide mt-1">{completedReceipt.receiptNumber}</p>
                        )}
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-500">Invoice Number:</span>
                          <span className="font-mono font-bold text-marine">{generatedInvoice.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-500">Customer Name:</span>
                          <span className="font-semibold text-marine">{user?.fullName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-500">Program:</span>
                          <span className="font-semibold text-marine">{selectedProgram?.title}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-500">Session Date &amp; Slot:</span>
                          <span className="font-semibold text-marine">{bookingDate} ({bookingSlot})</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-500">Payment Status:</span>
                          <span className="font-bold text-emerald-600">PAID</span>
                        </div>
                        <div className="flex justify-between items-center bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 mt-2">
                          <span className="text-emerald-800 font-bold">Total Paid:</span>
                          <span className="font-display text-base font-bold text-emerald-700">{formatAED(generatedInvoice.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100 no-print">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-tide px-4 py-2.5 text-xs font-bold text-white hover:bg-tide-dark no-print"
                    >
                      <Printer className="h-4 w-4" /> Print Official Receipt / Invoice
                    </button>
                    <Link
                      to={user?.role?.slug === 'parent' ? '/parent/schedule' : '/student/schedule'}
                      onClick={() => setShowBookingModal(false)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-marine px-4 py-2.5 text-xs font-bold text-white hover:bg-marine-dark no-print"
                    >
                      <Calendar className="h-4 w-4" /> View My Timetable
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowBookingModal(false)}
                      className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 no-print"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create/Edit Program Modal */}
        {showProgramModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-display text-lg font-bold text-marine">{editingProgramId ? 'Edit Program' : 'Create New Program'}</h2>
                <button onClick={() => setShowProgramModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleProgramSubmit} className="mt-4 space-y-4">
  <div>
    <label className="block text-xs font-semibold text-slate-700">Program Title *</label>
    <input
      type="text"
      required
      value={programForm.title}
      onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
      placeholder="E.g., Spearfishing Safety 101"
      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
    />
  </div>

  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="block text-xs font-semibold text-slate-700">Price (AED) *</label>
      <input
        type="number"
        required
        value={programForm.price}
        onChange={(e) => setProgramForm({ ...programForm, price: Number(e.target.value) })}
        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
      />
    </div>
    <div>
      <label className="block text-xs font-semibold text-slate-700">Program Colour</label>
      <select
        value={programForm.calendarColor}
        onChange={(e) => setProgramForm({ ...programForm, calendarColor: e.target.value })}
        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none bg-white"
      >
        <option value="Red">Red</option>
        <option value="Blue">Blue</option>
        <option value="Green">Green</option>
        <option value="Orange">Orange</option>
        <option value="Yellow">Yellow</option>
        <option value="Pink">Pink</option>
        <option value="Purple">Purple</option>
      </select>
    </div>
  </div>

  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="block text-xs font-semibold text-slate-700">Duration (Weeks)</label>
      <input
        type="number"
        value={programForm.durationWeeks}
        onChange={(e) => setProgramForm({ ...programForm, durationWeeks: Number(e.target.value) })}
        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
      />
    </div>
    <div>
      <label className="block text-xs font-semibold text-slate-700">Session Duration (Hours) *</label>
      <input
        type="number"
        step="0.5"
        min="0.5"
        required
        value={programForm.durationHours}
        onChange={(e) => setProgramForm({ ...programForm, durationHours: Number(e.target.value) })}
        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
      />
    </div>
  </div>

  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="block text-xs font-semibold text-slate-700">Status</label>
      <select
        value={programForm.status}
        onChange={(e) => setProgramForm({ ...programForm, status: e.target.value })}
        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none bg-white"
      >
        <option value="active">Active (Enrolling Open)</option>
        <option value="inactive">Inactive (Archived)</option>
        <option value="draft">Draft (Upcoming)</option>
      </select>
    </div>
    <div>
      <label className="block text-xs font-semibold text-slate-700">Program Brochure (Image)</label>
      <input
        type="file"
        accept="image/jpeg, image/png, image/webp"
        onChange={handleBrochureUpload}
        className="mt-1 w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-tide focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-tide/10 file:text-tide hover:file:bg-tide/20"
      />
      {programForm.brochureMetadata?.fileName && (
        <p className="text-[10px] text-slate-500 mt-1 truncate">
          {programForm.brochureMetadata.fileName}
        </p>
      )}
    </div>
  </div>

  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Available Branches</label>
    <div className="flex flex-wrap gap-2">
      {branches.map((b) => {
        const isSelected = programForm.branches?.includes(b._id);
        return (
          <label
            key={b._id}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition select-none ${
              isSelected
                ? 'border-tide bg-tide/10 text-marine font-bold'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                const current = programForm.branches || [];
                const nextBranches = e.target.checked
                  ? [...current, b._id]
                  : current.filter((id) => id !== b._id);
                setProgramForm({ ...programForm, branches: nextBranches });
              }}
              className="rounded text-tide focus:ring-tide h-3.5 w-3.5"
            />
            <span>{b.name}</span>
          </label>
        );
      })}
    </div>
  </div>

  <div>
    <label className="block text-xs font-semibold text-slate-700">Description</label>
    <textarea
      rows={3}
      required
      value={programForm.description}
      onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
      placeholder="Provide course overview and highlights..."
      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
    ></textarea>
  </div>

  <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
    <button
      type="button"
      onClick={() => setShowProgramModal(false)}
      className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isSubmitting}
      className="rounded-xl bg-tide px-5 py-2 text-sm font-semibold text-white hover:bg-tide-dark disabled:opacity-50"
    >
      {isSubmitting ? 'Saving...' : 'Save Program'}
    </button>
  </div>
</form>
            </div>
          </div>
        )}
      </div>
    
        {/* Delete / Archive Confirmation Modal */}
        {showDeleteModal && programToDelete && deleteDependencies && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="font-display text-lg font-bold text-marine mb-2">
                {deleteDependencies.hasDependencies ? 'Program In Use' : 'Delete Program'}
              </h3>
              
              <div className="mb-6 text-sm text-slate-600 space-y-3">
                {deleteDependencies.hasDependencies ? (
                  <>
                    <p className="text-amber-600 font-medium">This Program is already used in existing records.</p>
                    <p>It cannot be permanently deleted. Archive it instead?</p>
                    <ul className="mt-2 text-xs list-disc pl-5 text-slate-500">
                      {deleteDependencies.details.bookings > 0 && <li>{deleteDependencies.details.bookings} Bookings</li>}
                      {deleteDependencies.details.schedules > 0 && <li>{deleteDependencies.details.schedules} Sessions</li>}
                      {deleteDependencies.details.invoices > 0 && <li>{deleteDependencies.details.invoices} Invoices</li>}
                      {deleteDependencies.details.events > 0 && <li>{deleteDependencies.details.events} Calendar Events</li>}
                    </ul>
                  </>
                ) : (
                  <p>Are you sure you want to permanently delete <strong>{programToDelete.title}</strong>? This action cannot be undone.</p>
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                {deleteDependencies.hasDependencies ? (
                  <button
                    onClick={() => confirmDelete(true)}
                    disabled={isDeleting}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    {isDeleting ? 'Archiving...' : 'Archive Program'}
                  </button>
                ) : (
                  <button
                    onClick={() => confirmDelete(false)}
                    disabled={isDeleting}
                    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

    </DashboardLayout>
  );
}
