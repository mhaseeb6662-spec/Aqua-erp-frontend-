import { useState, useEffect } from 'react';
import {
  Bell, Mail, MessageCircle, RefreshCw, Send, CheckCircle2,
  AlertTriangle, Clock, RotateCw, Filter, Layers, Edit3, X, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/card';
import notificationService from '../../services/notificationService';

export default function NotificationMonitor() {
  const [logs, setLogs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('logs'); // 'logs' | 'templates'
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isRunningReminders, setIsRunningReminders] = useState(false);

  // Template edit modal
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editInAppBody, setEditInAppBody] = useState('');
  const [editWhatsAppBody, setEditWhatsAppBody] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const [logsRes, tempRes] = await Promise.all([
        notificationService.getDeliveryLogs({
          page,
          limit: 25,
          type: filterType || undefined,
          status: filterStatus || undefined,
        }),
        notificationService.getTemplates(),
      ]);
      setLogs(logsRes.data.data || []);
      setTotal(logsRes.data.total || 0);
      setTemplates(tempRes.data.data || []);
    } catch (err) {
      console.error('Failed to load notification logs', err);
      toast.error('Failed to load notification telemetry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filterType, filterStatus]);

  const handleRetry = async (id) => {
    try {
      await notificationService.retryNotification(id);
      toast.success('Notification redelivery queued!');
      fetchLogs();
    } catch (err) {
      toast.error('Failed to retry notification');
    }
  };

  const handleRunReminders = async () => {
    setIsRunningReminders(true);
    try {
      const res = await notificationService.runReminderCycle();
      toast.success(res.data.message || 'Reminder cycle completed successfully!');
      fetchLogs();
    } catch (err) {
      toast.error('Failed to run reminder cycle');
    } finally {
      setIsRunningReminders(false);
    }
  };

  const handleEditTemplate = (tmpl) => {
    setEditingTemplate(tmpl);
    setEditSubject(tmpl.subject || '');
    setEditInAppBody(tmpl.inAppBody || '');
    setEditWhatsAppBody(tmpl.whatsAppBody || '');
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!editingTemplate) return;
    try {
      await notificationService.updateTemplate(editingTemplate._id, {
        subject: editSubject,
        inAppBody: editInAppBody,
        whatsAppBody: editWhatsAppBody,
      });
      toast.success('Notification template updated!');
      setEditingTemplate(null);
      fetchLogs();
    } catch (err) {
      toast.error('Failed to update template');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600">
                Phase 9 • Notification Engine &amp; Reminders
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine mt-0.5">
              Notification Monitor &amp; Templates
            </h1>
            <p className="text-xs text-slate-500">
              Inspect multi-channel delivery logs (In-App, Email, WhatsApp), trigger scheduled reminder cycles, and customize message templates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunReminders}
              disabled={isRunningReminders}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-marine text-white rounded-xl text-xs font-bold hover:bg-marine-dark transition disabled:opacity-50 shadow-sm"
              title="Process all pending 24h session and invoice reminders"
            >
              <Clock className={`h-4 w-4 ${isRunningReminders ? 'animate-spin' : ''}`} />
              <span>{isRunningReminders ? 'Processing...' : 'Run Reminder Cycle'}</span>
            </button>
            <button
              onClick={() => setSelectedTab(selectedTab === 'logs' ? 'templates' : 'logs')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-xs"
            >
              <Layers className="h-4 w-4 text-marine" />
              {selectedTab === 'logs' ? 'Manage Templates' : 'View Delivery Logs'}
            </button>
          </div>
        </div>

        {/* Tab 1: Delivery Logs Stream */}
        {selectedTab === 'logs' ? (
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardContent className="p-5 space-y-4">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:bg-white focus:outline-none"
                  >
                    <option value="">All Notification Types</option>
                    <option value="booking_confirmed">Booking Confirmed</option>
                    <option value="payment_confirmed">Payment Confirmed</option>
                    <option value="payment_failed">Payment Failed</option>
                    <option value="session_reminder">Session Reminder</option>
                    <option value="schedule_changed">Schedule Changed</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:bg-white focus:outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="SENT">Sent</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="READ">Read</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>

                <span className="text-xs text-slate-400 font-mono">({total} total logged deliveries)</span>
              </div>

              {/* Logs Table */}
              {isLoading ? (
                <div className="py-20 flex justify-center text-slate-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-marine border-t-transparent"></div>
                </div>
              ) : logs.length === 0 ? (
                <p className="text-xs text-slate-400 py-12 text-center">No delivery logs matching the selected filters.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-3 font-bold">Timestamp</th>
                        <th className="pb-3 font-bold">Recipient</th>
                        <th className="pb-3 font-bold">Category</th>
                        <th className="pb-3 font-bold">Channels</th>
                        <th className="pb-3 font-bold">Subject / Title</th>
                        <th className="pb-3 font-bold">Status</th>
                        <th className="pb-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 text-slate-400 font-mono text-[11px]">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="py-3 font-semibold text-slate-700">
                            {log.recipient?.fullName || 'User'}
                            <span className="block text-[10px] text-slate-400 font-mono">{log.recipient?.email}</span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 font-mono">
                              {log.type}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              {(log.channels || ['in_app']).map((c) => (
                                <span
                                  key={c}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                    c === 'email'
                                      ? 'bg-blue-50 text-blue-700'
                                      : c === 'whatsapp'
                                      ? 'bg-teal-50 text-teal-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 text-slate-600 max-w-xs truncate">{log.title}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                                log.status === 'SENT' || log.status === 'DELIVERED' || log.status === 'READ'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleRetry(log._id)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-marine hover:underline"
                            >
                              <RotateCw className="h-3 w-3" /> Retry
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-slate-500 font-medium">Page {page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={logs.length < 25}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Tab 2: Template Catalog & Editor */
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((tmpl) => (
              <Card key={tmpl._id} className="bg-white border-slate-200 shadow-xs flex flex-col justify-between">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-400">{tmpl.templateKey}</span>
                      <h3 className="font-bold text-sm text-marine mt-0.5">{tmpl.name}</h3>
                    </div>
                    <button
                      onClick={() => handleEditTemplate(tmpl)}
                      className="p-1.5 text-slate-400 hover:text-marine hover:bg-slate-100 rounded-lg transition"
                      title="Edit Template"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Subject</span>
                    <p className="font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {tmpl.subject}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">In-App &amp; WhatsApp Body</span>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      {tmpl.inAppBody}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Variables:</span>
                    {(tmpl.supportedVariables || []).slice(0, 4).map((v) => (
                      <span key={v} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Template Edit Modal */}
        {editingTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-marine">Edit Template — {editingTemplate.name}</h3>
                <button onClick={() => setEditingTemplate(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTemplate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">Subject Template</label>
                  <input
                    type="text"
                    required
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">In-App Body</label>
                  <textarea
                    rows={3}
                    required
                    value={editInAppBody}
                    onChange={(e) => setEditInAppBody(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">WhatsApp Text</label>
                  <textarea
                    rows={3}
                    value={editWhatsAppBody}
                    onChange={(e) => setEditWhatsAppBody(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingTemplate(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-marine text-white rounded-xl font-bold hover:bg-marine-dark"
                  >
                    Save Template
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
