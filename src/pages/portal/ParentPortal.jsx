import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import portalService from '../../services/portalService';
import toast from 'react-hot-toast';
import {
  Users, UserPlus, ShieldCheck, HeartPulse, Award, BookOpen, Calendar, Phone, Mail, Link as LinkIcon, Plus, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ParentPortalPage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.slug === 'super-admin' || user?.role?.slug === 'admin';
  const [parentData, setParentData] = useState(null);
  const [allParents, setAllParents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [studentCodeInput, setStudentCodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchParentData = async () => {
    setIsLoading(true);
    try {
      if (isAdmin) {
        const res = await portalService.getAllParents();
        setAllParents(res.data.data || []);
      } else {
        const res = await portalService.getParentProfile();
        setParentData(res.data.data);
      }
    } catch (err) {
      console.error('Parent Portal Fetch Error:', err);
      toast.error(err.response?.data?.message || 'Failed to load parent portal data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  const handleLinkChild = async (e) => {
    e.preventDefault();
    if (!studentCodeInput.trim()) return toast.error('Please enter Student ID Code or Email');
    setIsSubmitting(true);
    try {
      await portalService.linkChild(studentCodeInput.trim());
      toast.success('Child account successfully linked to parent portal!');
      setShowLinkModal(false);
      setStudentCodeInput('');
      fetchParentData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to link student account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">
              {isAdmin ? 'Parent Accounts Management' : 'Parent Account Portal'}
            </h1>
            <p className="text-sm text-slate-500">
              {isAdmin
                ? 'Admin Management View: Monitor registered parent accounts, family relationships, and linked students.'
                : 'Manage your registered children, view their class progress, bookings, and emergency info.'}
            </p>
          </div>
          {!isAdmin && (
            <button
              onClick={() => setShowLinkModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-tide px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-tide-dark"
            >
              <UserPlus className="h-4 w-4" /> Link Child Account
            </button>
          )}
        </div>

        {/* ADMIN MANAGEMENT TABLE */}
        {isAdmin ? (
          isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
            </div>
          ) : allParents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-lg font-semibold text-slate-700">No Parent Accounts Registered</h3>
              <p className="mt-1 text-sm text-slate-500">Registered parent accounts will automatically appear here.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Parent Account</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Linked Students / Children</th>
                      <th className="px-6 py-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allParents.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-semibold text-marine">{p.user?.fullName || 'Parent Account'}</td>
                        <td className="px-6 py-4 text-slate-600">{p.user?.email}</td>
                        <td className="px-6 py-4 text-slate-600">{p.user?.phone || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {p.childrenProfiles && p.childrenProfiles.length > 0 ? (
                              p.childrenProfiles.map((cp) => (
                                <span
                                  key={cp._id}
                                  className="inline-flex items-center gap-1 rounded-lg bg-tide/10 px-2.5 py-1 text-xs font-bold text-tide"
                                >
                                  <span>{cp.user?.fullName}</span>
                                  <span className="font-mono text-[10px] text-slate-400">({cp.studentCode})</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">No linked children</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {p.user?.createdAt ? new Date(p.user.createdAt).toLocaleDateString() : 'Active'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : !parentData?.children || parentData.children.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-semibold text-slate-700">No Linked Children Accounts</h3>
            <p className="mt-1 text-sm text-slate-500">
              Click "Link Child Account" above and enter your child's Student ID Code or registered Email.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {parentData.children.map((child) => (
              <div key={child._id} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-marine">{child.user?.fullName}</h3>
                    <p className="text-xs text-slate-400">{child.user?.email}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-tide bg-tide/10 px-2.5 py-1 rounded-lg">
                    {child.studentCode}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Skill Level:</span>
                    <span className="font-semibold text-marine">{child.skillLevel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Primary Branch:</span>
                    <span className="font-semibold text-marine">{child.primaryBranch?.name || 'Not Set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Membership:</span>
                    <span className="font-semibold text-emerald-600">{child.membershipStatus || 'Active'}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1">
                  <p className="font-semibold text-slate-700">Medical Notes:</p>
                  <p className="text-slate-500">{child.medicalNotes || 'None'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Link Child Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-display text-lg font-bold text-marine">Link Child Account</h2>
                <button onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleLinkChild} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Enter Student ID Code or Email
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., STU-729182 or student@email.com"
                    value={studentCodeInput}
                    onChange={(e) => setStudentCodeInput(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    The student ID code is displayed on top of your child's profile page.
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-tide px-5 py-2 text-sm font-semibold text-white hover:bg-tide-dark disabled:opacity-50"
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
