// Shared enums/constants for the Sales CRM & Lead Management module (Phase 2)

export const LEAD_SOURCES = [
  'Website',
  'Referral',
  'Social Media',
  'Facebook Ads',
  'Google Ads',
  'WhatsApp',
  'Walk-in',
  'Phone Inquiry',
  'Email Campaign',
  'Event',
  'Advertisement',
  'Other',
];

// Sources populated automatically by the inbound lead webhooks rather than
// typed in manually by a sales rep — see backend INTEGRATIONS.md.
export const AUTOMATED_LEAD_SOURCES = ['Facebook Ads', 'Google Ads', 'WhatsApp'];

// Ordered sales pipeline stages. Order matters — it drives the Kanban board columns
// and the "next stage" progression on the lead detail page.
export const PIPELINE_STAGES = [
  { key: 'new', label: 'New Lead', color: 'marine' },
  { key: 'contacted', label: 'Contacted', color: 'tide' },
  { key: 'qualified', label: 'Qualified', color: 'tide' },
  { key: 'proposal', label: 'Proposal Sent', color: 'sandbar' },
  { key: 'negotiation', label: 'Negotiation', color: 'sandbar' },
  { key: 'won', label: 'Won', color: 'won' },
  { key: 'lost', label: 'Lost', color: 'lost' },
];

export const OPEN_STAGES = PIPELINE_STAGES.filter((s) => !['won', 'lost'].includes(s.key)).map((s) => s.key);

export const STAGE_STYLES = {
  new: 'bg-slate-100 text-slate-800 border border-slate-300 font-bold',
  contacted: 'bg-blue-50 text-blue-800 border border-blue-200 font-bold',
  qualified: 'bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold',
  proposal: 'bg-amber-50 text-amber-900 border border-amber-200 font-bold',
  negotiation: 'bg-orange-50 text-orange-900 border border-orange-200 font-bold',
  won: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold',
  lost: 'bg-rose-50 text-rose-800 border border-rose-200 font-bold',
};

export const FOLLOW_UP_TYPES = ['Call', 'Email', 'Meeting', 'WhatsApp', 'Site Visit'];

export const FOLLOW_UP_STATUSES = ['pending', 'completed', 'overdue', 'cancelled'];

// Activity timeline entry types — covers both system-generated events and
// manually logged customer interactions.
export const ACTIVITY_TYPES = {
  note: { label: 'Note', color: 'text-slate-700' },
  call: { label: 'Call', color: 'text-tide-dark' },
  email: { label: 'Email', color: 'text-blue-700' },
  meeting: { label: 'Meeting', color: 'text-amber-800' },
  whatsapp: { label: 'WhatsApp', color: 'text-emerald-700' },
  stage_change: { label: 'Stage change', color: 'text-marine' },
  assignment: { label: 'Assignment', color: 'text-marine' },
  conversion: { label: 'Converted to customer', color: 'text-emerald-700 font-bold' },
  payment_link: { label: 'Payment link', color: 'text-amber-800 font-bold' },
};

export const PAYMENT_STATUSES = ['pending', 'paid', 'expired', 'cancelled'];

// ---- Phase 2.2 — Calendar & Class Scheduling ----
export const CALENDAR_EVENT_TYPES = [
  { key: 'class', label: 'Student Class' },
  { key: 'demo', label: 'Lead / Demo Class' },
];

export const CALENDAR_EVENT_REPEAT_TYPES = [
  { key: 'one-time', label: 'One-Time Event' },
  { key: 'repeating', label: 'Repeating Event' },
];

export const CALENDAR_SUBJECT_OPTIONS = [
  'Chemistry',
  'Mathematics',
  'English',
  'Physics',
  'Biology',
  'Computer Science',
  'General Science',
  'History',
  'Art & Craft',
  'Physical Training',
];

export const CALENDAR_SEAT_TYPES = [
  { key: 'unlimited', label: 'Unlimited' },
  { key: 'limited', label: 'Limited' },
];

export const CALENDAR_PUBLISHED_STATUSES = [
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Draft' },
];

export const CALENDAR_EVENT_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'];

export const CALENDAR_STATUS_STYLES = {
  scheduled: 'bg-blue-50 text-blue-800 border border-blue-200 font-bold',
  completed: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold',
  cancelled: 'bg-rose-50 text-rose-800 border border-rose-200 font-bold',
  no_show: 'bg-amber-50 text-amber-900 border border-amber-200 font-bold',
};

export const CALENDAR_TYPE_STYLES = {
  demo: 'bg-amber-50 text-amber-900 border border-amber-200 font-bold',
  class: 'bg-cyan-50 text-cyan-900 border border-cyan-200 font-bold',
};

export const CALENDAR_PUBLISHED_STYLES = {
  published: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold',
  draft: 'bg-slate-100 text-slate-700 border border-slate-300 font-bold',
};

// Event detail panel — Enrollments / Trials / Waitlist roster.
export const CALENDAR_REGISTRATION_KINDS = [
  { key: 'enrolled', label: 'Enrollments' },
  { key: 'trial', label: 'Trials' },
  { key: 'waitlist', label: 'Waitlist' },
];

export const CALENDAR_ATTENDANCE_STATUSES = ['pending', 'present', 'absent'];

export const CALENDAR_ATTENDANCE_STYLES = {
  pending: 'bg-slate-100 text-slate-700 border border-slate-300 font-semibold',
  present: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold',
  absent: 'bg-rose-50 text-rose-800 border border-rose-200 font-bold',
};

export const REGISTRATION_PAYMENT_STATUSES = ['Paid', 'Invoice Generated', 'No Invoice'];

export const REGISTRATION_PAYMENT_STYLES = {
  Paid: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold',
  'Invoice Generated': 'bg-blue-50 text-blue-800 border border-blue-200 font-bold',
  'No Invoice': 'bg-slate-100 text-slate-700 border border-slate-300 font-bold',
};

export const PAYMENT_STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-900 border border-amber-200 font-bold',
  paid: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold',
  expired: 'bg-slate-100 text-slate-700 border border-slate-300 font-bold',
  cancelled: 'bg-rose-50 text-rose-800 border border-rose-200 font-bold',
};

// ---- Program Calendar Color Palettes ----
export const PROGRAM_COLOR_THEMES = {
  blue: {
    key: 'blue',
    name: 'Ocean Blue',
    card: 'bg-blue-50/95 hover:bg-blue-100/90 text-blue-950 border border-blue-200 border-l-4 border-l-blue-600 shadow-2xs',
    pill: 'bg-blue-100 text-blue-900 border border-blue-200 font-bold',
    text: 'text-blue-950',
    subtext: 'text-blue-800',
    accent: '#2563EB',
    dot: 'bg-blue-600',
  },
  emerald: {
    key: 'emerald',
    name: 'Emerald Sea',
    card: 'bg-emerald-50/95 hover:bg-emerald-100/90 text-emerald-950 border border-emerald-200 border-l-4 border-l-emerald-600 shadow-2xs',
    pill: 'bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold',
    text: 'text-emerald-950',
    subtext: 'text-emerald-800',
    accent: '#059669',
    dot: 'bg-emerald-600',
  },
  teal: {
    key: 'teal',
    name: 'Coastal Teal',
    card: 'bg-teal-50/95 hover:bg-teal-100/90 text-teal-950 border border-teal-200 border-l-4 border-l-teal-600 shadow-2xs',
    pill: 'bg-teal-100 text-teal-900 border border-teal-200 font-bold',
    text: 'text-teal-950',
    subtext: 'text-teal-800',
    accent: '#0D9488',
    dot: 'bg-teal-600',
  },
  rose: {
    key: 'rose',
    name: 'Coral Rose',
    card: 'bg-rose-50/95 hover:bg-rose-100/90 text-rose-950 border border-rose-200 border-l-4 border-l-rose-500 shadow-2xs',
    pill: 'bg-rose-100 text-rose-900 border border-rose-200 font-bold',
    text: 'text-rose-950',
    subtext: 'text-rose-800',
    accent: '#F43F5E',
    dot: 'bg-rose-500',
  },
  amber: {
    key: 'amber',
    name: 'Sunburst Amber',
    card: 'bg-amber-50/95 hover:bg-amber-100/90 text-amber-950 border border-amber-200 border-l-4 border-l-amber-500 shadow-2xs',
    pill: 'bg-amber-100 text-amber-900 border border-amber-200 font-bold',
    text: 'text-amber-950',
    subtext: 'text-amber-800',
    accent: '#D97706',
    dot: 'bg-amber-500',
  },
  purple: {
    key: 'purple',
    name: 'Deep Purple',
    card: 'bg-purple-50/95 hover:bg-purple-100/90 text-purple-950 border border-purple-200 border-l-4 border-l-purple-600 shadow-2xs',
    pill: 'bg-purple-100 text-purple-900 border border-purple-200 font-bold',
    text: 'text-purple-950',
    subtext: 'text-purple-800',
    accent: '#7C3AED',
    dot: 'bg-purple-600',
  },
  indigo: {
    key: 'indigo',
    name: 'Royal Indigo',
    card: 'bg-indigo-50/95 hover:bg-indigo-100/90 text-indigo-950 border border-indigo-200 border-l-4 border-l-indigo-600 shadow-2xs',
    pill: 'bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold',
    text: 'text-indigo-950',
    subtext: 'text-indigo-800',
    accent: '#4F46E5',
    dot: 'bg-indigo-600',
  },
};

export const DEFAULT_PROGRAM_COLOR = 'blue';

export const getProgramTheme = (colorKey) => {
  return PROGRAM_COLOR_THEMES[colorKey] || PROGRAM_COLOR_THEMES[DEFAULT_PROGRAM_COLOR];
};

// ---- Automated Financial & Invoice Status Badges ----
export const FINANCIAL_STATUS_BADGE_STYLES = {
  PAID: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold shadow-2xs',
  'PARTIALLY PAID': 'bg-amber-100 text-amber-900 border border-amber-300 font-bold shadow-2xs',
  OVERDUE: 'bg-rose-100 text-rose-800 border border-rose-300 font-bold shadow-2xs',
  INVOICED: 'bg-sky-100 text-sky-800 border border-sky-300 font-bold shadow-2xs',
  PENDING: 'bg-slate-100 text-slate-700 border border-slate-300 font-semibold shadow-2xs',
  REFUNDED: 'bg-purple-100 text-purple-800 border border-purple-300 font-bold shadow-2xs',
  SCHEDULED: 'bg-slate-100 text-slate-600 border border-slate-200 font-medium',
  EMPTY: 'bg-slate-100 text-slate-500 border border-slate-200 font-medium',
};

