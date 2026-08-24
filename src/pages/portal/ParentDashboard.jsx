import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import portalService from '../../services/portalService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Heart, Users, Plus, CheckCircle2, CalendarDays, Award, FileText, Sparkles, MapPin, Clock, ChevronRight, UserPlus, Link2, X, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ParentDashboard() {
  const { user } = useAuth();
  const [parentProfile, setParentProfile] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);

  // Child-specific data states
  const [childSchedules, setChildSchedules] = useState([]);
  const [childBookings, setChildBookings] = useState([]);
  const [childDocuments, setChildDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChildLoading, setIsChildLoading] = useState(false);

  // Modals
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [activeTab, setActiveTab] = useState('link'); // 'link' or 'create'

  // Link Child form
  const [studentCodeOrEmail, setStudentCodeOrEmail] = useState('');
  // Create Child form
  const [newChildName, setNewChildName] = useState('');
  const [newChildEmail, setNewChildEmail] = useState('');
  const [newChildGender, setNewChildGender] = useState('Male');
  const [newChildDob, setNewChildDob] = useState('');
  const [newChildMedical, setNewChildMedical] = useState('No known allergies.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchParentData = async () => {
    setIsLoading(true);
    try {
      const res = await portalService.getParentProfile();
      const prof = res.data.data.profile;
      const childList = res.data.data.children || [];

      setParentProfile(prof);
      setChildren(childList);

      if (childList.length > 0 && !selectedChildId) {
        setSelectedChildId(childList[0]?.user?._id || childList[0]?.user);
      }
    } catch (err) {
      toast.error('Failed to load parent portal profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSelectedChildData = async (childUserId) => {
    if (!childUserId) return;
    setIsChildLoading(true);
    try {
      const [schedRes, bookRes, docRes] = await Promise.all([
        portalService.getSchedules(childUserId),
        portalService.getBookings(childUserId),
        portalService.getDocuments(childUserId),
      ]);
      setChildSchedules(schedRes.data.data || []);
      setChildBookings(bookRes.data.data || []);
      setChildDocuments(docRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load child data');
    } finally {
      setIsChildLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchSelectedChildData(selectedChildId);
    }
  }, [selectedChildId]);

  const selectedChild = children.find(
    (c) => (c.user?._id || c.user) === selectedChildId
  );

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!studentCodeOrEmail) return toast.error('Please enter Student Code or Email');
    setIsSubmitting(true);
    try {
      await portalService.linkChild(studentCodeOrEmail);
      toast.success('Child account linked successfully!');
      setShowAddChildModal(false);
      setStudentCodeOrEmail('');
      fetchParentData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to link student account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateChildSubmit = async (e) => {
    e.preventDefault();
    if (!newChildName) return toast.error('Child name is required');
    setIsSubmitting(true);
    try {
      await portalService.createChild({
        fullName: newChildName,
        email: newChildEmail,
        gender: newChildGender,
        dateOfBirth: newChildDob,
        medicalNotes: newChildMedical,
      });
      toast.success('New child profile created and linked successfully!');
      setShowAddChildModal(false);
      setNewChildName('');
      setNewChildEmail('');
      fetchParentData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create child profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const attendedCount = childSchedules.filter(s => s.attendance === 'Present').length;
  const attendanceRate = childSchedules.length > 0 ? Math.round((attendedCount / childSchedules.length) * 100) : 100;

  return (
    <DashboardLayout title="Parent Portal">
      <div className="space-y-6">
        {/* Banner */}
        <div className="rounded-2xl bg-ripple-gradient p-6 text-white sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur text-tide-light mb-2">
              <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" /> Parent Management Portal
            </div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Parent Dashboard</h1>
            <p className="mt-1 text-xs text-white/70">
              Logged in as: <span className="font-semibold text-white">{user?.fullName}</span> | Linked Children: <span className="font-bold text-sandbar">{children.length}</span>
            </p>
          </div>

          <button
            onClick={() => setShowAddChildModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-tide px-4 py-2.5 text-xs font-bold text-white hover:bg-tide-dark shadow-sm self-start sm:self-auto"
          >
            <UserPlus className="h-4 w-4" /> Add / Link Student
          </button>
        </div>

        {/* Multi-Child Selector Switcher Bar */}
        {children.length > 0 ? (
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Child:</span>
              <div className="flex flex-wrap gap-2">
                {children.map((c) => {
                  const uid = c.user?._id || c.user;
                  const isSelected = uid === selectedChildId;
                  return (
                    <button
                      key={uid}
                      onClick={() => setSelectedChildId(uid)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                        isSelected
                          ? 'bg-tide text-white shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>{c.user?.fullName || 'Student'}</span>
                      <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px]">{c.studentCode}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Link
              to="/parent/children"
              className="text-xs font-bold text-tide hover:underline inline-flex items-center gap-1 self-end sm:self-auto"
            >
              Manage Children <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-500/10 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />
            <h3 className="mt-2 text-sm font-bold text-marine">No Linked Children Found</h3>
            <p className="mt-1 text-xs text-slate-600">Please link your child's student code or create a student account to view timetable and progress.</p>
            <button
              onClick={() => setShowAddChildModal(true)}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-tide px-4 py-2 text-xs font-bold text-white hover:bg-tide-dark"
            >
              <Plus className="h-4 w-4" /> Add Child Now
            </button>
          </div>
        )}

        {/* Selected Child Details */}
        {selectedChild && (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skill Level</p>
                  <p className="font-display text-xl font-bold text-marine mt-1">{selectedChild.skillLevel || 'Beginner'}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tide/10 text-tide">
                  <Award className="h-5 w-5" />
                </span>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Rate</p>
                  <p className="font-display text-xl font-bold text-emerald-600 mt-1">{attendanceRate}%</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class Bookings</p>
                  <p className="font-display text-xl font-bold text-marine mt-1">{childBookings.length}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tide/10 text-tide">
                  <CalendarDays className="h-5 w-5" />
                </span>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Child Documents</p>
                  <p className="font-display text-xl font-bold text-marine mt-1">{childDocuments.length}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <FileText className="h-5 w-5" />
                </span>
              </div>
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Timetable */}
              <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-marine flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-tide" /> {selectedChild.user?.fullName}'s Sessions &amp; Timetable
                  </h3>
                  <Link to="/parent/schedule" className="text-xs font-semibold text-tide hover:underline flex items-center gap-1">
                    Full Schedule <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {isChildLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-tide border-t-transparent"></div>
                  </div>
                ) : childSchedules.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-500">
                    No active sessions found for {selectedChild.user?.fullName}.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {childSchedules.slice(0, 4).map((s) => (
                      <div key={s._id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <div>
                          <p className="font-semibold text-sm text-marine">{s.title}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" /> {s.location || s.branch?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-tide">{new Date(s.startTime).toLocaleDateString()}</p>
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="h-3 w-3" /> {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Health & Medical Notes */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-display text-base font-bold text-marine flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500 fill-rose-500" /> Medical &amp; Health Overview
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="font-semibold text-slate-700">Student Code</p>
                    <p className="font-mono font-bold text-tide mt-1">{selectedChild.studentCode}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="font-semibold text-slate-700">Medical Notes</p>
                    <p className="text-slate-500 mt-1">{selectedChild.medicalNotes || 'No known allergies or medical restrictions.'}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="font-semibold text-slate-700">Dietary Notes</p>
                    <p className="text-slate-500 mt-1">{selectedChild.dietaryNotes || 'Standard diet.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Add/Link Child Modal */}
        {showAddChildModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-display text-lg font-bold text-marine">Add or Link Student</h2>
                <button onClick={() => setShowAddChildModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('link')}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                    activeTab === 'link' ? 'bg-white text-tide shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Link Existing Student Code
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                    activeTab === 'create' ? 'bg-white text-tide shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create New Student
                </button>
              </div>

              {activeTab === 'link' ? (
                <form onSubmit={handleLinkSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Student ID Code or Email *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. STU-100281 or student@example.com"
                      value={studentCodeOrEmail}
                      onChange={(e) => setStudentCodeOrEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddChildModal(false)}
                      className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-tide px-5 py-2 text-sm font-bold text-white hover:bg-tide-dark disabled:opacity-50"
                    >
                      {isSubmitting ? 'Linking...' : 'Link Student'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCreateChildSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Johnson"
                      value={newChildName}
                      onChange={(e) => setNewChildName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Student Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="Leave empty to auto-generate"
                      value={newChildEmail}
                      onChange={(e) => setNewChildEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Gender</label>
                      <select
                        value={newChildGender}
                        onChange={(e) => setNewChildGender(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Date of Birth</label>
                      <input
                        type="date"
                        value={newChildDob}
                        onChange={(e) => setNewChildDob(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Medical Notes / Allergies</label>
                    <input
                      type="text"
                      value={newChildMedical}
                      onChange={(e) => setNewChildMedical(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddChildModal(false)}
                      className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-tide px-5 py-2 text-sm font-bold text-white hover:bg-tide-dark disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating...' : 'Register Student'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
