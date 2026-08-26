import { useState, useEffect, useRef } from 'react';
import { 
  X, UserPlus, Upload, Camera, Trash2, CheckCircle2, 
  AlertCircle, ShieldCheck, MapPin, User, Phone, Mail, FileText, HeartPulse, Share2, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import customerService from '../../services/customerService';
import api from '../../services/api';

const NATIONALITY_OPTIONS = [
  'United Arab Emirates', 'Saudi Arabia', 'Kuwait', 'Bahrain', 'Oman', 'Qatar',
  'United Kingdom', 'United States', 'Canada', 'Australia', 'South Africa',
  'India', 'Pakistan', 'Egypt', 'Jordan', 'Lebanon', 'Philippines', 'France',
  'Germany', 'Russia', 'Other'
];

const UAE_CITIES = [
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Al Ain', 'Other'
];

const REFERRAL_SOURCES = [
  'Social Media', 'Word-of-mouth', 'Google Search', 'Website', 'WhatsApp', 'Walk-in', 'Referral', 'Other'
];

export default function StudentFormModal({ open, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [programs, setPrograms] = useState([]);
  const fileInputRef = useRef(null);

  // Form State
  const [form, setForm] = useState({
    // Student Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    nationality: 'United Arab Emirates',

    // Contact
    email: '',
    phone: '',

    // Emirates ID
    emiratesIdUrl: '',
    emiratesIdMetadata: { fileName: '', fileSize: 0, mimeType: '' },

    // Address
    streetAddress: '',
    country: 'United Arab Emirates',
    city: 'Dubai',
    state: '',
    zipCode: '',

    // Parent / Guardian
    parentFullName: '',
    parentEmail: '',
    parentPhone: '',
    parentRelationship: 'Father',

    // Behavioural / Attention Needs
    hasBehaviouralNeeds: false,
    behaviouralNeedsDetails: '',

    // Consent & Source
    socialMediaConsent: true,
    source: 'Social Media',
    interestedIn: '',
    notes: '',
  });

  // Fetch programs for course dropdown
  useEffect(() => {
    if (open) {
      api.get('/programs')
        .then(res => setPrograms(res.data.data || []))
        .catch(() => {});
    }
  }, [open]);

  if (!open) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return toast.error('Please upload an image (JPG, PNG, WebP) or PDF file.');
    }

    if (file.size > 10 * 1024 * 1024) {
      return toast.error('Document file size must be less than 10MB.');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target.result;
      setForm(prev => ({
        ...prev,
        emiratesIdUrl: base64Str,
        emiratesIdMetadata: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date(),
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setForm(prev => ({
      ...prev,
      emiratesIdUrl: '',
      emiratesIdMetadata: { fileName: '', fileSize: 0, mimeType: '' }
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Both Student First Name and Last Name are required.');
      return;
    }

    if (!form.phone.trim()) {
      setError('Contact phone number is required.');
      return;
    }

    if (form.hasBehaviouralNeeds && !form.behaviouralNeedsDetails.trim()) {
      setError('Please provide details for the student\'s behavioural or attention needs.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      };

      const { data } = await customerService.createCustomer(payload);
      toast.success(`${payload.fullName} registered successfully as a student!`);
      if (onSaved) onSaved(data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register student.');
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-marine-dark/50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-tide/10 p-2.5 text-tide">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-marine">Add New Student Registration</h2>
              <p className="text-xs text-slate-500">Official Aqua Fishing Academy Student Onboarding</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          {/* SECTION 1: STUDENT INFORMATION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5 text-xs font-bold uppercase tracking-wider text-marine">
              <User className="h-4 w-4 text-tide" />
              <span>1. Student Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student First Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Tariq"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Last Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Al-Mansoor"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  max={todayStr}
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nationality</label>
                <select
                  value={form.nationality}
                  onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                >
                  {NATIONALITY_OPTIONS.map((nat) => (
                    <option key={nat} value={nat}>{nat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACT INFORMATION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5 text-xs font-bold uppercase tracking-wider text-marine">
              <Phone className="h-4 w-4 text-tide" />
              <span>2. Contact Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone No. *</label>
                <input
                  required
                  type="tel"
                  placeholder="e.g. +971 50 123 4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Email (Optional)</label>
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: IDENTIFICATION (EMIRATES ID) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5 text-xs font-bold uppercase tracking-wider text-marine">
              <ShieldCheck className="h-4 w-4 text-tide" />
              <span>3. Identification — Emirates ID Photo</span>
            </div>

            <div>
              {form.emiratesIdUrl ? (
                <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center gap-3">
                  <img
                    src={form.emiratesIdUrl}
                    alt="Emirates ID Preview"
                    className="h-16 w-24 object-cover rounded-lg border border-slate-200 bg-white"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-bold text-slate-800 truncate">{form.emiratesIdMetadata.fileName || 'Emirates ID'}</p>
                    <p className="text-[11px] text-slate-500">{(form.emiratesIdMetadata.fileSize / 1024).toFixed(1)} KB</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-0.5">
                      <CheckCircle2 className="h-3 w-3" /> Securely attached
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 transition"
                    title="Remove Emirates ID"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-sky-200 rounded-xl bg-sky-50/30 hover:bg-sky-50/70 cursor-pointer transition text-center"
                >
                  <div className="flex gap-2 text-tide mb-1">
                    <Camera className="h-5 w-5" />
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Upload Emirates ID Document / Photo</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Supports Camera capture / JPG, PNG, PDF up to 10MB</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* SECTION 4: FULL ADDRESS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5 text-xs font-bold uppercase tracking-wider text-marine">
              <MapPin className="h-4 w-4 text-tide" />
              <span>4. Residential Address</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                placeholder="e.g. Villa 14, Al Wasl Road, Jumeirah 1"
                value={form.streetAddress}
                onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <select
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                >
                  {UAE_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Province / State</label>
                <input
                  type="text"
                  placeholder="e.g. Dubai"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Zip / Postal Code</label>
                <input
                  type="text"
                  placeholder="e.g. 00000"
                  value={form.zipCode}
                  onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: PARENT / GUARDIAN INFORMATION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5 text-xs font-bold uppercase tracking-wider text-marine">
              <User className="h-4 w-4 text-tide" />
              <span>5. Parent / Guardian Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parent Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sultan Al-Mansoor"
                  value={form.parentFullName}
                  onChange={(e) => setForm({ ...form, parentFullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                <select
                  value={form.parentRelationship}
                  onChange={(e) => setForm({ ...form, parentRelationship: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parent Email</label>
                <input
                  type="email"
                  placeholder="parent@example.com"
                  value={form.parentEmail}
                  onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parent Phone No.</label>
                <input
                  type="tel"
                  placeholder="e.g. +971 50 999 8877"
                  value={form.parentPhone}
                  onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: BEHAVIOURAL / ATTENTION NEEDS */}
          <div className="space-y-3 rounded-xl bg-amber-50/40 p-4 border border-amber-200/60">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
              <HeartPulse className="h-4 w-4 text-amber-600" />
              <span>6. Behavioural / Attention Needs</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Does the child have any behavioural or attention needs that we should be aware of?
              </label>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="hasBehaviouralNeeds"
                    checked={!form.hasBehaviouralNeeds}
                    onChange={() => setForm({ ...form, hasBehaviouralNeeds: false, behaviouralNeedsDetails: '' })}
                    className="text-tide focus:ring-tide h-4 w-4"
                  />
                  <span>No</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="hasBehaviouralNeeds"
                    checked={form.hasBehaviouralNeeds}
                    onChange={() => setForm({ ...form, hasBehaviouralNeeds: true })}
                    className="text-tide focus:ring-tide h-4 w-4"
                  />
                  <span>Yes</span>
                </label>
              </div>
            </div>

            {form.hasBehaviouralNeeds && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Please provide details *
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe specific attention triggers, sensory considerations, or behavioural support requirements..."
                  value={form.behaviouralNeedsDetails}
                  onChange={(e) => setForm({ ...form, behaviouralNeedsDetails: e.target.value })}
                  className="w-full rounded-xl border border-amber-200 p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none bg-white"
                />
              </div>
            )}
          </div>

          {/* SECTION 7: CONSENT, REFERRAL & PROGRAM */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5 text-xs font-bold uppercase tracking-wider text-marine">
              <Share2 className="h-4 w-4 text-tide" />
              <span>7. Consent, Referral &amp; Course Selection</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Social Media Consent</label>
                <select
                  value={form.socialMediaConsent ? 'Yes' : 'No'}
                  onChange={(e) => setForm({ ...form, socialMediaConsent: e.target.value === 'Yes' })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                >
                  <option value="Yes">Yes (Consent granted for academy media)</option>
                  <option value="No">No (Do not include in public media)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">How did you hear about us?</label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                >
                  {REFERRAL_SOURCES.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Interested In / Enrolled Course</label>
              {programs.length > 0 ? (
                <select
                  value={form.interestedIn}
                  onChange={(e) => setForm({ ...form, interestedIn: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                >
                  <option value="">-- Select Academy Course / Program --</option>
                  {programs.map(p => (
                    <option key={p._id} value={p.title}>{p.title}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Junior Angler Academy Course"
                  value={form.interestedIn}
                  onChange={(e) => setForm({ ...form, interestedIn: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes</label>
              <textarea
                rows="2"
                placeholder="Internal notes or registration remarks..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-tide px-6 py-2.5 text-xs font-bold text-white hover:bg-tide-dark shadow-sm transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Registering Student...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Register Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
