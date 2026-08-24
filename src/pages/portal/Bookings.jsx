import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import portalService from '../../services/portalService';
import toast from 'react-hot-toast';
import {
  CalendarDays, Clock, MapPin, CheckCircle2, XCircle, AlertCircle, Plus, Search, Filter, BookOpen, DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await portalService.getBookings();
      setBookings(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking reservation?')) return;
    try {
      await portalService.cancelBooking(id);
      toast.success('Booking reservation cancelled');
      fetchBookings();
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'confirmed') return b.status === 'Confirmed';
    if (activeTab === 'cancelled') return b.status === 'Cancelled';
    if (activeTab === 'trial') return b.bookingType === 'Trial Session';
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">Session & Class Bookings</h1>
            <p className="text-sm text-slate-500">
              Manage your trial reservations, upcoming class bookings, and payment status.
            </p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {[
            { key: 'all', label: 'All Bookings' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'trial', label: 'Trial Sessions' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-tide text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-semibold text-slate-700">No Bookings Found</h3>
            <p className="mt-1 text-sm text-slate-500">Browse the Program Catalogue to book a trial or regular class session.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div
                key={b._id}
                className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-100 sm:flex-row sm:items-center justify-between transition hover:border-slate-200"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tide/10 text-tide font-bold">
                    <BookOpen className="h-6 w-6" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{b.bookingId}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          b.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : b.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {b.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                        {b.bookingType}
                      </span>
                    </div>

                    <h3 className="mt-1 font-display text-base font-bold text-marine">{b.program?.title || 'Academy Program'}</h3>

                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-tide" />
                        <span>{new Date(b.sessionDate).toDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-tide" />
                        <span>{b.slotTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-tide" />
                        <span>{b.branch?.name} ({b.branch?.city})</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400">Payment Status: </span>
                    <span className="text-xs font-bold text-marine">{b.paymentStatus}</span>
                    <p className="font-display text-sm font-bold text-tide">
                      {b.amount === 0 ? 'FREE (Trial)' : `$${b.amount} USD`}
                    </p>
                  </div>

                  {b.status === 'Confirmed' && (
                    <button
                      onClick={() => handleCancelBooking(b._id)}
                      className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
