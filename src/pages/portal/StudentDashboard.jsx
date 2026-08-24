import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import portalService from '../../services/portalService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  UserCheck, BookOpen, Calendar, CalendarDays, Award, Heart, FileText, Bell, CheckCircle2, Clock, Sparkles, MapPin, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        const [profRes, schedRes, bookRes, docRes] = await Promise.all([
          portalService.getStudentProfile(),
          portalService.getSchedules(),
          portalService.getBookings(),
          portalService.getDocuments(),
        ]);
        setProfile(profRes.data.data);
        setSchedules(schedRes.data.data || []);
        setBookings(bookRes.data.data || []);
        setDocuments(docRes.data.data || []);
      } catch (err) {
        toast.error('Failed to load student dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  const upcomingSessions = schedules.filter(s => s.status === 'Scheduled' || new Date(s.startTime) >= new Date());
  const attendedCount = schedules.filter(s => s.attendance === 'Present').length;
  const attendanceRate = schedules.length > 0 ? Math.round((attendedCount / schedules.length) * 100) : 100;

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-2xl bg-ripple-gradient p-6 text-white sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur text-tide-light mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Student Portal Active
            </div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
            <p className="mt-1 text-xs text-white/70">
              Student Code: <span className="font-mono font-bold text-sandbar">{profile?.studentCode || 'STU-XXXXXX'}</span> | Primary Branch: {profile?.primaryBranch?.name || 'Main Branch'}
            </p>
          </div>
          <Link
            to="/programs"
            className="inline-flex items-center gap-2 rounded-xl bg-tide px-4 py-2.5 text-xs font-bold text-white hover:bg-tide-dark shadow-sm self-start sm:self-auto"
          >
            <BookOpen className="h-4 w-4" /> Browse Catalogue
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Skill Level</p>
              <p className="font-display text-xl font-bold text-marine mt-1">{profile?.skillLevel || 'Beginner'}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tide/10 text-tide">
              <Award className="h-5 w-5" />
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Attendance Rate</p>
              <p className="font-display text-xl font-bold text-emerald-700 mt-1">{attendanceRate}%</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Bookings</p>
              <p className="font-display text-xl font-bold text-marine mt-1">{bookings.length}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tide/10 text-tide">
              <Calendar className="h-5 w-5" />
            </span>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Documents</p>
              <p className="font-display text-xl font-bold text-marine mt-1">{documents.length}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FileText className="h-5 w-5" />
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-marine flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-tide" /> Upcoming Sessions &amp; Timetable
              </h3>
              <Link to="/schedule" className="text-xs font-bold text-tide hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-tide border-t-transparent"></div>
              </div>
            ) : upcomingSessions.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-600 font-medium border border-slate-200">
                No upcoming sessions scheduled. Reserve a class from the Program Catalogue.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 4).map((s) => (
                  <div key={s._id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <div>
                      <p className="font-bold text-sm text-marine">{s.title}</p>
                      <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-amber-700" /> {s.location || s.branch?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-tide">{new Date(s.startTime).toLocaleDateString()}</p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                        <Clock className="h-3 w-3 text-slate-500" /> {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Profile Info & Medical Notes */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-display text-base font-bold text-marine flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-tide" /> Student Health &amp; Profile
            </h3>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-semibold text-slate-700">Emergency Contact</p>
                <p className="text-slate-500 mt-1">{profile?.emergencyContact?.name || 'Parent / Guardian'} ({profile?.emergencyContact?.phone || user?.phone || 'Not set'})</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-semibold text-slate-700">Medical Restrictions / Notes</p>
                <p className="text-slate-500 mt-1">{profile?.medicalNotes || 'No known medical restrictions.'}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-semibold text-slate-700">Dietary Preferences</p>
                <p className="text-slate-500 mt-1">{profile?.dietaryNotes || 'Standard academy menu.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
