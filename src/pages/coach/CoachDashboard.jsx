import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import coachService from '../../services/coachService';
import toast from 'react-hot-toast';
import {
  Calendar, Users, CheckSquare, FileText, AlertTriangle, ShieldCheck, Clock, MapPin, Award, ArrowRight, Camera, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CoachDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await coachService.getDashboard();
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load Coach Dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">
              Welcome, Coach {user?.fullName?.split(' ')[0]} 👋
            </h1>
            <p className="text-xs text-slate-500">
              Mobile Field Operational Portal — View assigned sessions, record attendance, and submit student progress notes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/coach/sessions"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-tide px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-tide-dark"
            >
              <Calendar className="h-4 w-4" /> View My Schedule
            </Link>
          </div>
        </div>

        {/* Certification Expiry Warning Alert */}
        {data?.expiringCertsCount > 0 && (
          <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-bold">License Renewal Alert ({data.expiringCertsCount} Certification Expiring Soon)</p>
              <p className="mt-0.5 text-amber-800">
                One or more of your professional licenses (CPR / Maritime Safety) require renewal within 30 days.
              </p>
            </div>
            <Link
              to="/coach/certifications"
              className="rounded-xl bg-amber-200 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-300 transition"
            >
              View Licenses
            </Link>
          </div>
        )}

        {/* Operational Metrics Row */}
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Today's Sessions</span>
                <Calendar className="h-5 w-5 text-tide" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-marine">{data?.todaySessionsCount || 0}</p>
              <p className="text-[11px] text-slate-400">Assigned for today</p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Assigned Students</span>
                <Users className="h-5 w-5 text-tide" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-marine">{data?.assignedStudentsCount || 0}</p>
              <p className="text-[11px] text-slate-400">Active participants</p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Attendance Pending</span>
                <CheckSquare className="h-5 w-5 text-amber-500" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-amber-600">{data?.pendingAttendanceCount || 0}</p>
              <p className="text-[11px] text-slate-400">Require roll call</p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Reports Pending</span>
                <FileText className="h-5 w-5 text-sky-500" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-sky-600">{data?.pendingReportsCount || 0}</p>
              <p className="text-[11px] text-slate-400">Completion reports</p>
            </div>
          </div>
        )}

        {/* Safety Alerts for Assigned Students */}
        {data?.safetyAlerts && data.safetyAlerts.length > 0 && (
          <div className="rounded-2xl bg-rose-50 p-4 border border-rose-100 text-xs text-rose-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-700">
              <AlertTriangle className="h-4 w-4" />
              <span>Important Student Medical &amp; Safety Restrictions:</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {data.safetyAlerts.map((sa) => (
                <div key={sa._id} className="rounded-xl bg-white p-2.5 border border-rose-200">
                  <span className="font-bold text-marine">{sa.user?.fullName}:</span>{' '}
                  <span className="text-slate-600">{sa.medicalNotes}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Assigned Sessions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-marine">Today's Assigned Sessions</h2>
            <Link to="/coach/sessions" className="text-xs font-bold text-tide hover:underline flex items-center gap-1">
              View All Sessions <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
            </div>
          ) : !data?.todaySessions || data.todaySessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <Calendar className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-2 text-sm font-bold text-slate-700">No Assigned Sessions Today</h3>
              <p className="mt-1 text-xs text-slate-500">You have no class sessions scheduled for today. Check upcoming sessions below.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.todaySessions.map((session) => (
                <div key={session._id} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SESSION</span>
                      <h3 className="font-display text-base font-bold text-marine">{session.program?.title}</h3>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        session.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : session.status === 'Ongoing'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-tide" />
                      <span>{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-tide" />
                      <span>{session.branch?.name} ({session.location})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-tide" />
                      <span>Student: <strong className="text-marine">{session.student?.fullName}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Attendance: <strong className={session.attendance === 'Not Marked' ? 'text-amber-600' : 'text-emerald-600'}>{session.attendance}</strong>
                    </span>
                    <button
                      onClick={() => navigate(`/coach/sessions/${session._id}`)}
                      className="rounded-xl bg-tide px-3.5 py-1.5 text-xs font-bold text-white hover:bg-tide-dark transition"
                    >
                      Open Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Field Shortcuts */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-3">
          <h3 className="font-display text-sm font-bold text-marine">Quick Operational Actions</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link
              to="/coach/sessions"
              className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-3 text-center border border-slate-100 hover:bg-tide/5 hover:border-tide/20 transition"
            >
              <CheckSquare className="h-6 w-6 text-tide mb-1" />
              <span className="text-xs font-bold text-marine">Mark Roll Call</span>
            </Link>
            <Link
              to="/coach/students"
              className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-3 text-center border border-slate-100 hover:bg-tide/5 hover:border-tide/20 transition"
            >
              <Award className="h-6 w-6 text-sky-500 mb-1" />
              <span className="text-xs font-bold text-marine">Record Progress</span>
            </Link>
            <Link
              to="/coach/sessions"
              className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-3 text-center border border-slate-100 hover:bg-tide/5 hover:border-tide/20 transition"
            >
              <FileText className="h-6 w-6 text-emerald-500 mb-1" />
              <span className="text-xs font-bold text-marine">Session Report</span>
            </Link>
            <Link
              to="/coach/certifications"
              className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-3 text-center border border-slate-100 hover:bg-tide/5 hover:border-tide/20 transition"
            >
              <ShieldCheck className="h-6 w-6 text-amber-500 mb-1" />
              <span className="text-xs font-bold text-marine">My Licenses</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
