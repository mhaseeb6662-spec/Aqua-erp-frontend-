import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import coachService from '../../services/coachService';
import toast from 'react-hot-toast';
import {
  Calendar, Clock, MapPin, Users, CheckSquare, ChevronRight, Filter, Search
} from 'lucide-react';

export default function CoachSessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await coachService.getSessions();
      setSessions(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load assigned sessions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter((s) => {
    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Today' && new Date(s.startTime).toDateString() === new Date().toDateString()) ||
      s.status === activeTab;

    const matchesSearch =
      s.program?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.branch?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">My Assigned Sessions</h1>
            <p className="text-xs text-slate-500">
              Field schedule of all classes, camps, and fishing trips assigned to you by Operations.
            </p>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {['All', 'Today', 'Scheduled', 'Ongoing', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  activeTab === tab
                    ? 'bg-tide text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search program or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs focus:border-tide focus:outline-none"
            />
          </div>
        </div>

        {/* Sessions List */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-700">No Assigned Sessions Found</h3>
            <p className="mt-1 text-xs text-slate-500">No sessions match your selected filter. Contact Operations if you expect assigned sessions.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSessions.map((session) => (
              <div
                key={session._id}
                onClick={() => navigate(`/coach/sessions/${session._id}`)}
                className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-4 hover:border-tide/30 transition cursor-pointer"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {new Date(session.startTime).toDateString()}
                    </span>
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

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-tide" />
                    <span>
                      {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
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
                  <span className="text-xs text-slate-500">
                    Roll Call:{' '}
                    <strong className={session.attendance === 'Not Marked' ? 'text-amber-600' : 'text-emerald-600'}>
                      {session.attendance}
                    </strong>
                  </span>
                  <span className="inline-flex items-center text-xs font-bold text-tide hover:underline">
                    Manage <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
