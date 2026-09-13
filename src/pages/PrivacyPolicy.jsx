import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  UserCheck,
  CreditCard,
  Mail,
  ArrowLeft,
  Printer,
  Waves,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Database,
  Camera,
  Globe,
  LifeBuoy
} from 'lucide-react';
import AcademyLogo from '../components/common/AcademyLogo';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('overview');

  const lastUpdated = 'September 13, 2026';

  const sections = [
    { id: 'overview', title: '1. Overview & Scope' },
    { id: 'collection', title: '2. Information We Collect' },
    { id: 'usage', title: '3. How We Use Your Data' },
    { id: 'minors', title: '4. Student & Minor Protection' },
    { id: 'media', title: '5. Media & Photo Consent' },
    { id: 'financial', title: '6. Billing & Payment Security' },
    { id: 'sharing', title: '7. Information Sharing' },
    { id: 'security', title: '8. Data Security & Storage' },
    { id: 'rights', title: '9. Your Privacy Rights' },
    { id: 'contact', title: '10. Contact & Inquiries' },
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-tide selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/login" className="flex items-center gap-3 group">
              <AcademyLogo variant="navbar" />
              <div className="hidden sm:block">
                <span className="font-display font-bold text-marine text-base tracking-tight block">
                  Aqua Fishing Academy
                </span>
                <span className="text-[10px] font-semibold text-tide uppercase tracking-wider block">
                  ERP Platform
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              type="button"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              title="Print or Save as PDF"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Print Policy</span>
            </button>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-marine hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-tide hover:bg-tide-dark text-white text-xs font-bold shadow-sm transition"
            >
              Register Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-marine py-12 lg:py-16 text-white border-b border-marine-dark">
        <div className="absolute inset-0 bg-radial-gradient from-tide/20 via-transparent to-transparent pointer-events-none opacity-60"></div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-tide/10 blur-3xl pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-tide-light backdrop-blur-md border border-white/15">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Official Legal Document</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Privacy Policy
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
            At Aqua Fishing Academy (aquafishinghub.com), protecting your privacy and securing the personal information of our students, parents, coaches, and staff is our fundamental commitment.
          </p>

          <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-300">
            <span>Last Updated: <strong className="text-white">{lastUpdated}</strong></span>
            <span>•</span>
            <span>Public Access</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sticky Sidebar Navigation (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 pb-2 border-b border-slate-100">
                Contents
              </p>
              <nav className="space-y-1 pt-2">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      activeSection === sec.id
                        ? 'bg-tide/10 text-tide font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-marine'
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>

              <div className="pt-4 mt-4 border-t border-slate-100 px-2 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                  <Lock className="h-3.5 w-3.5" />
                  <span>256-bit TLS Encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Globe className="h-3.5 w-3.5" />
                  <span>aquafishinghub.com</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Legal Text Body */}
          <main className="lg:col-span-9 space-y-8">
            {/* 1. Overview */}
            <section id="overview" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-tide/10 text-tide">
                  <Waves className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-marine">1. Overview & Scope</h2>
                  <p className="text-xs text-slate-500">Introduction to our privacy commitments</p>
                </div>
              </div>
              <div className="text-sm leading-relaxed text-slate-600 space-y-3">
                <p>
                  This Privacy Policy outlines how <strong>Aqua Fishing Academy</strong> (&quot;Academy&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) through our official domain <strong>aquafishinghub.com</strong> and associated Enterprise Resource Planning (ERP) applications collects, uses, protects, and discloses personal data.
                </p>
                <p>
                  This policy applies to all users interacting with our services, including registered students, parents, guardians, academy coaches, administrative staff, maritime contractors, and public visitors. By accessing our platform, booking courses, or registering an account, you consent to the practices described in this document.
                </p>
              </div>
            </section>

            {/* 2. Information We Collect */}
            <section id="collection" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-marine/10 text-marine">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-marine">2. Information We Collect</h2>
                  <p className="text-xs text-slate-500">Data gathered directly from you and system operations</p>
                </div>
              </div>
              <div className="text-sm leading-relaxed text-slate-600 space-y-4">
                <p>We only collect information that is strictly required to provide quality maritime coaching, ensure safety, and manage academy operations:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                    <h3 className="font-bold text-xs uppercase tracking-wide text-marine">A. Account & Profile Info</h3>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                      <li>Full Legal Name</li>
                      <li>Contact Email Address</li>
                      <li>Phone / WhatsApp Number</li>
                      <li>Student Identification Code</li>
                      <li>Account Credentials (passwords hashed via bcrypt)</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                    <h3 className="font-bold text-xs uppercase tracking-wide text-marine">B. Academic & Maritime Records</h3>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                      <li>Course enrollments & level progress</li>
                      <li>Attendance & training session logs</li>
                      <li>Coach performance evaluations</li>
                      <li>Assigned boats, safety gear & equipment</li>
                      <li>Certifications and graduation milestones</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                    <h3 className="font-bold text-xs uppercase tracking-wide text-marine">C. Guardian & Minor Details</h3>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                      <li>Parent / Guardian identity & contact</li>
                      <li>Emergency contact telephone numbers</li>
                      <li>Relevant health or swimming readiness notes</li>
                      <li>Minor student safety acknowledgments</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                    <h3 className="font-bold text-xs uppercase tracking-wide text-marine">D. Billing & Transaction Data</h3>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                      <li>Invoice identifiers & line item details</li>
                      <li>Payment proof (POS slips, bank transaction IDs)</li>
                      <li>Receipt timestamps and amounts</li>
                      <li><em>Note: Full credit card numbers are never stored</em></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. How We Use Your Data */}
            <section id="usage" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sandbar/20 text-sandbar-dark">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-marine">3. How We Use Your Data</h2>
                  <p className="text-xs text-slate-500">Legitimate operational and safety purposes</p>
                </div>
              </div>
              <div className="text-sm leading-relaxed text-slate-600 space-y-3">
                <p>We process your personal information strictly for legitimate operational purposes:</p>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Program Administration:</strong> Organizing training slots, boat assignments, branch schedules, and instructor allocations.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Maritime Safety:</strong> Maintaining passenger manifests, emergency contacts, and incident prevention on open water.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Financial Accounting:</strong> Generating tax-compliant invoices, processing fee settlements, tracking outstanding payments, and handling refunds.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Communication:</strong> Sending session updates, weather advisories, schedule changes, and certification notices via SMS, Email, or WhatsApp.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Student & Minor Protection */}
            <section id="minors" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-coral/10 text-coral">
                  <LifeBuoy className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-marine">4. Student & Minor Protection</h2>
                  <p className="text-xs text-slate-500">Child privacy and guardian oversight</p>
                </div>
              </div>
              <div className="text-sm leading-relaxed text-slate-600 space-y-3">
                <p>
                  As an academy teaching youth fishing, maritime ethics, and boat handling, safeguarding students under 18 is our highest priority.
                </p>
                <div className="rounded-xl bg-amber-50/80 border border-amber-200/70 p-4 text-xs text-amber-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span>Parental Authority & Oversight</span>
                  </div>
                  <p>
                    Accounts for minors under the age of 18 are linked directly to registered Parent or Guardian accounts. Parents maintain full authority to review, update, or request the deletion of their child&apos;s personal records at any time through the Parent Portal or by contacting our administration.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Media & Photo Consent */}
            <section id="media" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-tide/10 text-tide">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-marine">5. Media & Photography Consent</h2>
                  <p className="text-xs text-slate-500">Guidelines on photos, videos, and promotional captures</p>
                </div>
              </div>
              <div className="text-sm leading-relaxed text-slate-600 space-y-3">
                <p>
                  During sessions, coaches and academy photographers may capture instructional photos or celebratory catch milestones.
                </p>
                <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <li><strong>Explicit Consent:</strong> Parents and adult students can choose to grant or decline media consent during registration or at any time in their profile settings.</li>
                  <li><strong>Coach Enforcement:</strong> When media consent is declined, our ERP automatically locks coach media uploads for that student, preventing any photo/video captures from being posted or published.</li>
                  <li><strong>Withdrawal:</strong> You may revoke media consent at any time without affecting your participation in academy courses.</li>
                </ul>
              </div>
            </section>

            {/* 6. Billing & Payment Security */}
            <section id="financial" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-marine">6. Billing & Payment Security</h2>
                  <p className="text-xs text-slate-500">PCI-DSS compliance and financial protection</p>
                </div>
              </div>
              <div className="text-sm leading-relaxed text-slate-600 space-y-3">
                <p>
                  We prioritize absolute security in our financial billing and invoicing infrastructure:
                </p>
                <div className="space-y-2 text-xs text-slate-600">
                  <p>• <strong>No Card Data Stored:</strong> Aqua Fishing Academy does not store debit/credit card numbers or CVV codes on our servers. All online transactions are processed through certified PCI-DSS compliant payment gateways.</p>
                  <p>• <strong>Proof of Payment:</strong> In-person POS slips, bank receipts, or cash voucher references uploaded to our system are kept strictly accessible only to authorized Finance Officers and Super Admins for audit compliance.</p>
                  <p>• <strong>Immutable Audit Trails:</strong> Financial status overrides and invoice changes are automatically logged with staff identity, timestamp, and justification reason.</p>
                </div>
              </div>
            </section>

            {/* 7. Information Sharing */}
            <section id="sharing" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-marine">7. Information Sharing</h2>
                  <p className="text-xs text-slate-500">Zero selling of personal data</p>
                </div>
              </div>
              <div className="text-sm leading-relaxed text-slate-600 space-y-3">
                <p className="font-semibold text-marine">
                  We never sell, trade, or rent your personal identifiable information to third-party advertisers or data brokers.
                </p>
                <p>We disclose information only in the following limited circumstances:</p>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li><strong>Authorized Service Providers:</strong> Trusted third-party cloud hosting providers, transactional email/SMS gateways, and database backup systems bound by strict non-disclosure obligations.</li>
                  <li><strong>Maritime & Legal Authorities:</strong> Maritime safety coastguards, port authorities, or emergency health responders during critical safety incidents.</li>
                  <li><strong>Legal Compliance:</strong> When required by court order, statutory regulation, or lawful governmental request.</li>
                </ul>
              </div>
            </section>

            {/* 8. Data Security & Storage */}
            <section id="security" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-tide/10 text-tide">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-marine">8. Data Security & Storage</h2>
                  <p className="text-xs text-slate-500">Encryption standards and infrastructure defense</p>
                </div>
              </div>
              <div className="text-sm leading-relaxed text-slate-600 space-y-3">
                <p>
                  We implement robust technical and organizational security measures to protect your data against unauthorized access, loss, alteration, or disclosure:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1">🔐 Transport Encryption</span>
                    All network traffic is encrypted using modern TLS (Transport Layer Security) 1.3 / HTTPS.
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1">🛡️ Role-Based Access</span>
                    Strict granular permissions ensure staff only access records required for their duty.
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1">💾 Redundant Backups</span>
                    Secure automated database backups with encryption at rest to prevent accidental data loss.
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1">📋 Security Audit Logs</span>
                    System-wide activity logs monitor authentication events and privileged administrative actions.
                  </div>
                </div>
              </div>
            </section>

            {/* 9. Your Privacy Rights */}
            <section id="rights" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-marine/10 text-marine">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-marine">9. Your Privacy Rights</h2>
                  <p className="text-xs text-slate-500">Access, correction, export, and deletion</p>
                </div>
              </div>
              <div className="text-sm leading-relaxed text-slate-600 space-y-3">
                <p>Under applicable privacy laws, you possess the following rights regarding your personal records:</p>
                <div className="space-y-2 text-xs text-slate-600">
                  <p>• <strong>Right to Access:</strong> You can review your profile, bookings, attendance, and receipts directly from your portal dashboard at any time.</p>
                  <p>• <strong>Right to Rectification:</strong> If any information is outdated or inaccurate, you may update it in your account settings or request our team to correct it.</p>
                  <p>• <strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> You may request deletion of your account and associated personal data, subject to legal, tax, or maritime audit requirements.</p>
                  <p>• <strong>Data Portability:</strong> You may request an export of your academic transcripts, attendance records, and payment receipts in digital format.</p>
                </div>
              </div>
            </section>

            {/* 10. Contact Us */}
            <section id="contact" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-tide/10 text-tide">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-marine">10. Contact & Inquiries</h2>
                  <p className="text-xs text-slate-500">Reach our Data Privacy & Compliance Team</p>
                </div>
              </div>
              <div className="text-sm leading-relaxed text-slate-600 space-y-4">
                <p>
                  If you have questions, concerns, or requests regarding this Privacy Policy or how your personal information is handled, please contact our team:
                </p>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
                  <h3 className="font-bold text-sm text-marine">Aqua Fishing Academy — Privacy Office</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-tide" />
                      <span>Email: <a href="mailto:privacy@aquafishinghub.com" className="text-tide font-semibold hover:underline">privacy@aquafishinghub.com</a></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-tide" />
                      <span>Website: <a href="https://aquafishinghub.com" target="_blank" rel="noreferrer" className="text-tide font-semibold hover:underline">aquafishinghub.com</a></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-tide" />
                      <span>Support: <a href="mailto:support@aquafishinghub.com" className="text-tide font-semibold hover:underline">support@aquafishinghub.com</a></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Data Protection Officer</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Back to Login Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-marine text-white">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-bold text-sm text-white">Ready to continue to Aqua Fishing Academy ERP?</h4>
                <p className="text-xs text-slate-300">Access your dashboard, manage bookings, or create a new student account.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-marine text-xs font-bold hover:bg-slate-100 transition shadow-sm"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Go to Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-tide text-white text-xs font-bold hover:bg-tide-dark transition shadow-sm"
                >
                  <span>Register</span>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/login" className="hover:text-tide transition">Sign In</Link>
            <Link to="/register" className="hover:text-tide transition">Create Account</Link>
            <Link to="/privacy-policy" className="font-bold text-tide hover:underline">Privacy Policy</Link>
            <a href="mailto:support@aquafishinghub.com" className="hover:text-tide transition">Support</a>
          </div>
          <p>© {new Date().getFullYear()} Aqua Fishing Academy (aquafishinghub.com). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
