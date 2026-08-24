import { useState, useEffect } from 'react';
import {
  CreditCard, Facebook as FacebookIcon, Search, MessageCircle, Mail,
  BookOpen, Calendar as CalendarIcon, Copy, ExternalLink, RefreshCw,
  CheckCircle2, AlertTriangle, XCircle, Clock, Zap, ArrowRight, Filter, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/card';
import integrationService from '../services/integrationService';

const API_BASE_URL = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1')).replace(/\/$/, '');

const PROVIDER_METADATA = {
  payment_gateway: {
    name: 'Payment Gateway Integration',
    category: 'Finance & Payments',
    icon: CreditCard,
    iconBg: 'bg-emerald-50 text-emerald-600',
    webhookUrl: `${API_BASE_URL}/integrations/webhooks/payment`,
    envVars: ['PAYMENT_PROVIDER', 'PAYMENT_PUBLIC_KEY', 'PAYMENT_SECRET_KEY', 'PAYMENT_WEBHOOK_SECRET'],
    docsUrl: 'https://stripe.com/docs/webhooks',
    description: 'Processes online credit card payments, payment links, and deposits with webhook signature verification and automated reconciliation.',
  },
  meta_leads: {
    name: 'Facebook & Instagram Lead Ads',
    category: 'Marketing & CRM',
    icon: FacebookIcon,
    iconBg: 'bg-blue-50 text-blue-600',
    webhookUrl: `${API_BASE_URL}/webhooks/leads/meta`,
    envVars: ['META_VERIFY_TOKEN', 'META_APP_SECRET', 'META_PAGE_ACCESS_TOKEN'],
    docsUrl: 'https://developers.facebook.com/docs/marketing-api/guides/lead-ads/',
    description: 'Captures inbound leads from Meta ad campaigns into the sales pipeline with automatic deduplication and agent auto-assignment.',
  },
  google_leads: {
    name: 'Google Ads Lead Forms',
    category: 'Marketing & CRM',
    icon: Search,
    iconBg: 'bg-amber-50 text-amber-600',
    webhookUrl: `${API_BASE_URL}/webhooks/leads/google`,
    envVars: ['GOOGLE_ADS_WEBHOOK_KEY'],
    docsUrl: 'https://support.google.com/google-ads/answer/9439509',
    description: 'Receives Google Ads lead extensions with key verification, campaign attribution, and duplicate protection.',
  },
  whatsapp: {
    name: 'WhatsApp Business Cloud API',
    category: 'Omnichannel Messaging',
    icon: MessageCircle,
    iconBg: 'bg-teal-50 text-teal-600',
    webhookUrl: `${API_BASE_URL}/webhooks/leads/whatsapp`,
    envVars: ['WHATSAPP_VERIFY_TOKEN', 'WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID'],
    docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api/',
    description: 'Two-way customer messaging, booking confirmations, invoice links, and status webhooks (sent/delivered/read).',
  },
  email: {
    name: 'Transactional Email Service',
    category: 'Communications',
    icon: Mail,
    iconBg: 'bg-indigo-50 text-indigo-600',
    webhookUrl: null,
    envVars: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'EMAIL_FROM'],
    docsUrl: 'https://nodemailer.com/about/',
    description: 'Dispatches branded HTML notifications for bookings, receipts, password resets, and executive reports.',
  },
  accounting: {
    name: 'Accounting Ledger Integration',
    category: 'Finance & ERP',
    icon: BookOpen,
    iconBg: 'bg-purple-50 text-purple-600',
    webhookUrl: null,
    envVars: ['ACCOUNTING_PROVIDER', 'ACCOUNTING_CLIENT_ID', 'ACCOUNTING_CLIENT_SECRET'],
    docsUrl: 'https://developer.xero.com/',
    description: 'Synchronizes customers, invoices, and payments to Xero, QuickBooks, or Zoho Books without blocking core ERP operations.',
  },
  google_calendar: {
    name: 'Google Calendar Synchronization',
    category: 'Operations & Schedules',
    icon: CalendarIcon,
    iconBg: 'bg-sky-50 text-sky-600',
    webhookUrl: `${API_BASE_URL}/integrations/oauth/google-calendar/callback`,
    envVars: ['GOOGLE_CALENDAR_CLIENT_ID', 'GOOGLE_CALENDAR_CLIENT_SECRET'],
    docsUrl: 'https://developers.google.com/calendar/api',
    description: 'Synchronizes academy schedules, coach sessions, and fishing charters with persistent event ID mapping.',
  },
};

export default function Integrations() {
  const [statuses, setStatuses] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState(null);
  const [selectedTab, setSelectedTab] = useState('providers'); // 'providers' | 'logs'
  const [logFilter, setLogFilter] = useState({ provider: '', status: '' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statusRes, logsRes] = await Promise.all([
        integrationService.getStatuses(),
        integrationService.getLogs(logFilter),
      ]);
      setStatuses(statusRes.data.data || []);
      setLogs(logsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load integrations data', err);
      toast.error('Failed to load integration statuses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [logFilter]);

  const copyToClipboard = (text, label = 'URL') => {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleTestConnection = async (providerKey) => {
    setTestingProvider(providerKey);
    try {
      const res = await integrationService.testConnection(providerKey);
      const data = res.data;
      toast.success(`${data.message} (${data.latencyMs}ms)`, { duration: 4000 });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Connection ping failed');
    } finally {
      setTestingProvider(null);
    }
  };

  const handleToggleEnvironment = async (providerKey, currentEnv) => {
    const nextEnv = currentEnv === 'TEST' ? 'LIVE' : 'TEST';
    try {
      await integrationService.updateConfig(providerKey, { environment: nextEnv });
      toast.success(`Switched to ${nextEnv} mode`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update environment');
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
                Central Integration Architecture
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine mt-0.5">
              Third-Party Integrations Hub
            </h1>
            <p className="text-xs text-slate-500">
              Manage payment gateways, lead ads webhooks, WhatsApp Cloud API, transactional email, accounting sync, and Google Calendar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTab(selectedTab === 'providers' ? 'logs' : 'providers')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-xs"
            >
              <Zap className="h-4 w-4 text-marine" />
              {selectedTab === 'providers' ? 'View Live Logs Stream' : 'View Providers Hub'}
            </button>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition"
              title="Refresh Statuses"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab 1: Providers Hub */}
        {selectedTab === 'providers' ? (
          <div className="grid gap-5 md:grid-cols-2">
            {Object.entries(PROVIDER_METADATA).map(([key, meta]) => {
              const liveStatus = statuses.find((s) => s.provider === key) || {};
              const statusStr = liveStatus.status || 'WAITING_FOR_CREDENTIALS';
              const env = liveStatus.environment || 'TEST';
              const Icon = meta.icon;

              const isWaiting = statusStr === 'WAITING_FOR_CREDENTIALS';
              const isConnected = statusStr === 'CONNECTED';
              const isError = statusStr === 'ERROR';

              return (
                <Card key={key} className="bg-white border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between">
                  <CardContent className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-2xl ${meta.iconBg}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            {meta.category}
                          </span>
                          <h3 className="font-bold text-sm text-marine mt-0.5">{meta.name}</h3>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-md border ${
                            isConnected
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : isWaiting
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : isError
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {isWaiting ? 'WAITING CREDENTIALS' : statusStr}
                        </span>

                        <button
                          onClick={() => handleToggleEnvironment(key, env)}
                          className="text-[10px] font-mono font-bold text-slate-600 hover:text-marine underline"
                          title="Click to toggle Test/Live mode"
                        >
                          Env: {env}
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{meta.description}</p>

                    {/* Webhook URL Box (if applicable) */}
                    {meta.webhookUrl && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-600">Webhook Receiver URL</span>
                        <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                          <code className="text-[11px] font-mono text-marine truncate flex-1 font-bold">{meta.webhookUrl}</code>
                          <button
                            onClick={() => copyToClipboard(meta.webhookUrl, 'Webhook URL')}
                            className="p-1 text-slate-500 hover:text-marine rounded-lg"
                            title="Copy Webhook URL"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Server Env Vars */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-600">Required Environment Keys</span>
                      <div className="flex flex-wrap gap-1">
                        {meta.envVars.map((v) => (
                          <span key={v} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded text-[10px] font-mono">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <a
                        href={meta.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-marine text-[11px]"
                      >
                        <span>Provider Documentation</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>

                      <button
                        onClick={() => handleTestConnection(key)}
                        disabled={testingProvider === key}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-marine text-white rounded-xl text-xs font-bold hover:bg-marine-dark transition disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3 w-3 ${testingProvider === key ? 'animate-spin' : ''}`} />
                        <span>{testingProvider === key ? 'Pinging...' : 'Test Connection'}</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Tab 2: Live Integration Activity Logs */
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-marine">Live Inbound &amp; Outbound Event Logs</h3>
                  <p className="text-xs text-slate-600 font-medium">Real-time audit log of webhooks, idempotency checks, and API dispatches.</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-600">{logs.length} events</span>
              </div>

              {isLoading ? (
                <div className="py-16 flex justify-center text-slate-500">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-marine border-t-transparent"></div>
                </div>
              ) : logs.length === 0 ? (
                <p className="text-xs text-slate-500 py-12 text-center font-medium">No integration events recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px]">
                        <th className="pb-3 font-bold">Timestamp</th>
                        <th className="pb-3 font-bold">Provider</th>
                        <th className="pb-3 font-bold">Event Type</th>
                        <th className="pb-3 font-bold">Direction</th>
                        <th className="pb-3 font-bold">External ID</th>
                        <th className="pb-3 font-bold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 text-slate-600 font-mono font-medium">{new Date(log.createdAt).toLocaleTimeString()}</td>
                          <td className="py-3 font-bold text-marine uppercase text-[10px]">{log.provider}</td>
                          <td className="py-3 font-semibold text-slate-700">{log.event}</td>
                          <td className="py-3">
                            <span
                              className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                log.direction === 'INBOUND' ? 'bg-blue-50 text-blue-700' : 'bg-teal-50 text-teal-700'
                              }`}
                            >
                              {log.direction}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-[11px] text-slate-500">{log.externalId || '—'}</td>
                          <td className="py-3 text-right">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                                log.status === 'SUCCESS'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : log.status === 'IGNORED_DUPLICATE'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
