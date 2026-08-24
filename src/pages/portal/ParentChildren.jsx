import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import portalService from '../../services/portalService';
import toast from 'react-hot-toast';
import { Heart, Users, UserPlus, Award, Calendar, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ParentChildren() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchChildren = async () => {
    setIsLoading(true);
    try {
      const res = await portalService.getParentProfile();
      setChildren(res.data.data.children || []);
    } catch (err) {
      toast.error('Failed to load children list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleLink = async (e) => {
    e.preventDefault();
    if (!studentIdentifier) return toast.error('Please enter student code or email');
    setIsSubmitting(true);
    try {
      await portalService.linkChild(studentIdentifier);
      toast.success('Child account linked successfully!');
      setShowModal(false);
      setStudentIdentifier('');
      fetchChildren();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to link child');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="My Children">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">My Linked Children</h1>
            <p className="text-sm text-slate-500">
              Manage student profiles linked to your parent portal account.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-tide px-4 py-2.5 text-xs font-bold text-white hover:bg-tide-dark shadow-sm"
          >
            <UserPlus className="h-4 w-4" /> Link Child Account
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : children.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-rose-300" />
            <h3 className="mt-3 text-lg font-semibold text-slate-700">No Linked Children</h3>
            <p className="mt-1 text-sm text-slate-500">Link existing student accounts or register new student profiles under your account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((c) => (
              <div key={c._id} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-marine">{c.user?.fullName || 'Student'}</h3>
                    <p className="text-xs text-slate-500">{c.user?.email}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-tide bg-tide/10 px-2.5 py-1 rounded-lg">
                    {c.studentCode}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Skill Level:</span>
                    <span className="font-semibold text-marine">{c.skillLevel || 'Beginner'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Branch:</span>
                    <span className="font-semibold text-marine">{c.primaryBranch?.name || 'Main Branch'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" /> {c.membershipStatus || 'Active'}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-100">
                  <p className="font-bold text-slate-700">Medical Notes:</p>
                  <p className="text-slate-500 mt-0.5">{c.medicalNotes || 'No known allergies.'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-display text-lg font-bold text-marine">Link Child Account</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleLink} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Student Code or Email *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU-100281 or student@example.com"
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-tide px-5 py-2 text-sm font-bold text-white hover:bg-tide-dark disabled:opacity-50"
                  >
                    {isSubmitting ? 'Linking...' : 'Link Account'}
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
