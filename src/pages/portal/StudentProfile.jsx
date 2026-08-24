import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import portalService from '../../services/portalService';
import toast from 'react-hot-toast';
import {
  User, ShieldCheck, Phone, Mail, Award, HeartPulse, Utensils, MapPin, Calendar, CheckCircle2, Save, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.slug === 'super-admin' || user?.role?.slug === 'admin';
  const [profile, setProfile] = useState(null);
  const [branches, setBranches] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentUserId, setSelectedStudentUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Prefer not to say',
    skillLevel: 'Beginner',
    primaryBranch: '',
    medicalNotes: '',
    dietaryNotes: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRel: '',
  });

  const fetchData = async (targetUserId) => {
    setIsLoading(true);
    try {
      const promises = [
        portalService.getStudentProfile(targetUserId || undefined),
        portalService.getBranches(),
      ];
      if (isAdmin && allStudents.length === 0) {
        promises.push(portalService.getAllStudents());
      }
      const [profRes, branchRes, studListRes] = await Promise.all(promises);
      const prof = profRes.data.data;
      setProfile(prof);
      setBranches(branchRes.data.data || []);
      if (studListRes) {
        setAllStudents(studListRes.data.data || []);
      }

      if (prof) {
        setFormData({
          fullName: prof.user?.fullName || '',
          phone: prof.user?.phone || '',
          dateOfBirth: prof.dateOfBirth ? new Date(prof.dateOfBirth).toISOString().split('T')[0] : '',
          gender: prof.gender || 'Prefer not to say',
          skillLevel: prof.skillLevel || 'Beginner',
          primaryBranch: prof.primaryBranch?._id || '',
          medicalNotes: prof.medicalNotes || '',
          dietaryNotes: prof.dietaryNotes || '',
          emergencyName: prof.emergencyContact?.name || '',
          emergencyPhone: prof.emergencyContact?.phone || '',
          emergencyRel: prof.emergencyContact?.relationship || '',
        });
      }
    } catch (err) {
      toast.error('Failed to load student profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedStudentUserId);
  }, [selectedStudentUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await portalService.updateStudentProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender,
        skillLevel: formData.skillLevel,
        primaryBranch: formData.primaryBranch || null,
        medicalNotes: formData.medicalNotes,
        dietaryNotes: formData.dietaryNotes,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relationship: formData.emergencyRel,
        },
      });
      toast.success('Student profile updated successfully!');
      fetchData();
    } catch (err) {
      toast.error('Failed to update student profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">
              {isAdmin ? 'Student Management & Profiles' : 'Student Profile & Membership'}
            </h1>
            <p className="text-sm text-slate-500">
              {isAdmin
                ? 'Admin Management View: Inspect and manage student profile records, emergency contacts, and medical notes.'
                : 'Manage personal details, emergency contacts, medical/dietary notes, and skill progression.'}
            </p>
          </div>
          {profile?.studentCode && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-tide/10 px-4 py-2 text-sm font-bold text-tide border border-tide/20">
              <span>Student ID Code:</span>
              <span className="font-mono text-marine">{profile.studentCode}</span>
            </div>
          )}
        </div>

        {/* Super Admin Student Selection Bar */}
        {isAdmin && allStudents.length > 0 && (
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200 flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Select Student to Manage:</span>
            <select
              value={selectedStudentUserId}
              onChange={(e) => setSelectedStudentUserId(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-marine focus:border-tide focus:outline-none max-w-md"
            >
              <option value="">-- Currently Logged-in / Default Student --</option>
              {allStudents.map((s) => (
                <option key={s._id} value={s.user?._id || s.user}>
                  {s.user?.fullName} ({s.studentCode}) - {s.user?.email}
                </option>
              ))}
            </select>
          </div>
        )}

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
            {/* Left Column: Personal Info & Emergency */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-display text-base font-bold text-marine flex items-center gap-2">
                  <User className="h-5 w-5 text-tide" /> Personal Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Contact Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Skill Level</label>
                    <select
                      value={formData.skillLevel}
                      onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Master">Master</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Primary Preferred Branch</label>
                  <select
                    value={formData.primaryBranch}
                    onChange={(e) => setFormData({ ...formData, primaryBranch: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  >
                    <option value="">Select Primary Branch</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-display text-base font-bold text-marine flex items-center gap-2">
                  <Phone className="h-5 w-5 text-tide" /> Emergency Contact
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Contact Name</label>
                    <input
                      type="text"
                      placeholder="E.g., Jane Doe"
                      value={formData.emergencyName}
                      onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Emergency Phone</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Relationship</label>
                    <input
                      type="text"
                      placeholder="Mother / Father / Guardian"
                      value={formData.emergencyRel}
                      onChange={(e) => setFormData({ ...formData, emergencyRel: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Medical & Dietary */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-display text-base font-bold text-marine flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-tide" /> Medical & Dietary Notes
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Medical Restrictions / Allergies</label>
                  <textarea
                    rows={2}
                    value={formData.medicalNotes}
                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Dietary Preferences</label>
                  <textarea
                    rows={2}
                    value={formData.dietaryNotes}
                    onChange={(e) => setFormData({ ...formData, dietaryNotes: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-tide px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-tide-dark disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </div>

            {/* Right Column: Status Card */}
            <div className="space-y-6">
              <div className="rounded-2xl bg-marine p-6 text-white shadow-sm space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-tide-light">Membership Status</span>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold">{profile?.membershipStatus || 'Active'}</h3>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                    Active Student
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  Enrolled since: {profile?.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : 'Today'}
                </p>
                {profile?.parentUser && (
                  <div className="border-t border-white/10 pt-3 text-xs">
                    <span className="text-white/60">Linked Parent Account: </span>
                    <span className="font-semibold text-white">{profile.parentUser.fullName}</span>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
