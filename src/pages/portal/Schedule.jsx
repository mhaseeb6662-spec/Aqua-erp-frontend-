import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import portalService from '../../services/portalService';
import toast from 'react-hot-toast';
import {
  Calendar as CalendarIcon, Clock, MapPin, CheckCircle2, User, Award, CheckSquare, XCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const res = await portalService.getSchedules();
      setSchedules(res.data.data || []);
    } catch (err) {
      console.error('Schedule fetch error:', err);
      toast.error(err.response?.data?.message || 'Failed to load timetable schedule');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleAttendanceChange = async (scheduleId, attendance) => {
    try {
      await portalService.updateScheduleStatus(scheduleId, { attendance });
      toast.success(`Attendance updated to ${attendance}`);
      fetchSchedules();
    } catch (err) {
      toast.error('Failed to update attendance');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">Student Timetable & Schedule</h1>
            <p className="text-sm text-slate-500">
              View your upcoming class sessions, dock locations, assigned instructors, and attendance status.
            </p>
          </div>
        </div>

        {/* Schedule List */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : schedules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-semibold text-slate-700">No Scheduled Sessions</h3>
            <p className="mt-1 text-sm text-slate-500">Your upcoming classes and workshops will be automatically displayed here once booked.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schedules.map((item) => (
              <div key={item._id} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-tide/10 px-2.5 py-1 text-xs font-semibold text-tide">
                      {item.program?.category || 'Session'}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        item.attendance === 'Present'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.attendance === 'Absent'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.attendance || 'Not Marked'}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-base font-bold text-marine">{item.title}</h3>

                  <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-tide" />
                      <span>{new Date(item.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-tide" />
                      <span>
                        {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-tide shrink-0 mt-0.5" />
                      <span>{item.location || item.branch?.name}</span>
                    </div>
                    {item.instructor && (
                      <div className="flex items-center gap-2 text-marine font-medium">
                        <User className="h-4 w-4 text-tide" />
                        <span>Instructor: {item.instructor.fullName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {(user?.role?.slug === 'super-admin' || user?.role?.slug === 'admin' || user?.role?.slug === 'coach') && (
                  <div className="mt-5 border-t border-slate-100 pt-3">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mark Attendance</label>
                    <div className="flex items-center gap-2">
                      {['Present', 'Absent', 'Late'].map((att) => (
                        <button
                          key={att}
                          onClick={() => handleAttendanceChange(item._id, att)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                            item.attendance === att ? 'bg-marine text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {att}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
