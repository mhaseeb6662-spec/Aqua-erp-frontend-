import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import portalService from '../../services/portalService';
import toast from 'react-hot-toast';
import {
  Bell, Check, CheckCheck, Megaphone, Calendar, FileText, Info, Plus, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function NotificationsPage() {
  const { user, hasPermission } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Broadcast Form
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await portalService.getNotifications();
      setNotifications(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await portalService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await portalService.markAllAsRead();
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!annTitle || !annMessage) return toast.error('Please enter title and message');
    setIsSubmitting(true);
    try {
      await portalService.broadcastAnnouncement({ title: annTitle, message: annMessage });
      toast.success('Announcement broadcast to all active academy users!');
      setShowBroadcastModal(false);
      setAnnTitle('');
      setAnnMessage('');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to broadcast announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="h-5 w-5 text-amber-500" />;
      case 'booking_alert':
        return <Calendar className="h-5 w-5 text-tide" />;
      case 'document_status':
        return <FileText className="h-5 w-5 text-emerald-500" />;
      default:
        return <Info className="h-5 w-5 text-sky-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">Notifications & Announcements</h1>
            <p className="text-sm text-slate-500">
              Stay up-to-date with session booking alerts, schedule changes, and academy broadcasts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <CheckCheck className="h-4 w-4 text-tide" /> Mark All as Read
            </button>
            {hasPermission('portal:notifications:manage') && (
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-tide px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-tide-dark"
              >
                <Megaphone className="h-4 w-4" /> Broadcast Announcement
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-semibold text-slate-700">No Notifications</h3>
            <p className="mt-1 text-sm text-slate-500">You are all caught up! New alerts will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`flex items-start justify-between rounded-2xl p-4 transition border ${
                  n.isRead ? 'bg-white border-slate-100' : 'bg-tide/5 border-tide/20 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs border border-slate-100">
                    {getIcon(n.type)}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-sm font-bold text-marine">{n.title}</h4>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-tide animate-pulse"></span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    <span className="mt-2 block text-[11px] text-slate-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-marine"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Broadcast Modal */}
        {showBroadcastModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-display text-lg font-bold text-marine">Broadcast Academy Announcement</h2>
                <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleBroadcastSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Announcement Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Academy Weather Advisory / Schedule Update"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Message Content *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type the announcement message to broadcast to students and parents..."
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  ></textarea>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-tide px-5 py-2 text-sm font-semibold text-white hover:bg-tide-dark disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Broadcast Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
