import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import portalService from '../../services/portalService';
import toast from 'react-hot-toast';
import {
  MapPin, Phone, Mail, Clock, ShieldCheck, CheckCircle2, Navigation, Users, Plus, X, Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BranchSelection() {
  const { user, setUser, hasPermission } = useAuth();
  const [branches, setBranches] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newBranch, setNewBranch] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    operatingHours: 'Mon-Sat: 07:00 AM - 08:00 PM',
    facilities: 'Deep Sea Simulator, Boat Dock, Tackle Shop',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const branchRes = await portalService.getBranches();
      setBranches(branchRes.data.data || []);

      if (user?.role?.slug === 'student' || user?.role?.slug === 'parent') {
        const profileRes = await portalService.getStudentProfile();
        setStudentProfile(profileRes.data.data);
      }
    } catch (err) {
      toast.error('Failed to load branches');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectPrimaryBranch = async (branchId) => {
    try {
      await portalService.updateStudentProfile({ primaryBranch: branchId });
      toast.success('Primary branch updated successfully!');
      fetchData();
    } catch (err) {
      toast.error('Failed to set primary branch');
    }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!newBranch.name || !newBranch.code || !newBranch.address || !newBranch.city) {
      return toast.error('Please fill required fields');
    }
    setIsSubmitting(true);
    try {
      const facilitiesArray = newBranch.facilities.split(',').map((f) => f.trim()).filter(Boolean);
      await portalService.createBranch({
        ...newBranch,
        facilities: facilitiesArray,
      });
      toast.success('New branch location added!');
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create branch');
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
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">Academy Branch Network</h1>
            <p className="text-sm text-slate-500">
              Select your primary academy location, explore branch facilities, and find operating hours.
            </p>
          </div>
          {hasPermission('portal:branches:manage') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-tide px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-tide-dark"
            >
              <Plus className="h-4 w-4" /> Add Branch Location
            </button>
          )}
        </div>

        {/* Current Branch Banner */}
        {studentProfile?.primaryBranch && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between rounded-2xl bg-gradient-to-r from-marine via-marine-dark to-tide p-6 text-white shadow-md">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-sandbar backdrop-blur-md">
                <Navigation className="h-6 w-6" />
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-tide-light">Your Primary Branch</span>
                <h2 className="font-display text-xl font-bold">{studentProfile.primaryBranch.name}</h2>
                <p className="text-xs text-white/70">{studentProfile.primaryBranch.address}, {studentProfile.primaryBranch.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="h-4 w-4" /> Active Preferred Location
              </span>
            </div>
          </div>
        )}

        {/* Branch Cards */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((b) => {
              const isCurrentPrimary = studentProfile?.primaryBranch?._id === b._id;

              return (
                <div
                  key={b._id}
                  className={`flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border transition duration-200 ${
                    isCurrentPrimary ? 'border-tide ring-2 ring-tide/20' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xs font-bold uppercase tracking-wider text-tide bg-tide/10 px-2.5 py-1 rounded-lg">
                        {b.code}
                      </span>
                      {isCurrentPrimary && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Primary
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 font-display text-lg font-bold text-marine">{b.name}</h3>

                    <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-tide mt-0.5" />
                        <span>{b.address}, {b.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0 text-tide" />
                        <span>{b.phone || '+1 (555) 019-2831'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-tide" />
                        <span>{b.email || 'info@aquafishing.academy'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0 text-tide" />
                        <span>{b.operatingHours}</span>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Available Facilities</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {b.facilities.map((fac, idx) => (
                          <span key={idx} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    {isCurrentPrimary ? (
                      <button
                        disabled
                        className="w-full rounded-xl bg-emerald-50 py-2.5 text-xs font-bold text-emerald-600 cursor-default"
                      >
                        Selected as Primary Branch
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectPrimaryBranch(b._id)}
                        className="w-full rounded-xl bg-marine py-2.5 text-xs font-semibold text-white transition hover:bg-marine-dark"
                      >
                        Set as My Primary Branch
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Branch Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-display text-lg font-bold text-marine">Add Academy Branch Location</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBranch} className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Branch Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Sunrise Harbor Branch"
                      value={newBranch.name}
                      onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Branch Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="BR-SUNRISE"
                      value={newBranch.code}
                      onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Miami / Tampa / Key West"
                      value={newBranch.city}
                      onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Phone</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={newBranch.phone}
                      onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="123 Pier Way, Marina Harbor"
                    value={newBranch.address}
                    onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Facilities (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Deep Sea Tank, Boat Ramp, Rental Locker, Pro Shop"
                    value={newBranch.facilities}
                    onChange={(e) => setNewBranch({ ...newBranch, facilities: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-tide px-5 py-2 text-sm font-semibold text-white hover:bg-tide-dark disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Branch'}
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
