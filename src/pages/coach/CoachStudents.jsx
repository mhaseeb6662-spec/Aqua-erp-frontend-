import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import coachService from '../../services/coachService';
import toast from 'react-hot-toast';
import {
  Users, ShieldCheck, HeartPulse, Phone, Mail, Award, BookOpen, AlertTriangle, Search, RefreshCw
} from 'lucide-react';

export default function CoachStudents() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAssignedStudents = async () => {
    setIsLoading(true);
    try {
      const res = await coachService.getAssignedStudents();
      setStudents(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load assigned students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedStudents();
  }, []);

  const filteredStudents = students.filter((sp) => {
    const q = searchTerm.toLowerCase();
    return (
      (sp.user?.fullName || '').toLowerCase().includes(q) ||
      (sp.user?.email || '').toLowerCase().includes(q) ||
      (sp.user?.phone || '').toLowerCase().includes(q) ||
      (sp.studentCode || '').toLowerCase().includes(q) ||
      (sp.skillLevel || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">My Assigned Students</h1>
            <p className="text-xs text-slate-500">
              Field directory of students assigned to your training sessions, including medical restrictions &amp; safety notes.
            </p>
          </div>
          <button
            onClick={fetchAssignedStudents}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-xs self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" /> Refresh List
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, email, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs focus:border-tide focus:outline-none bg-white"
          />
        </div>

        {/* Directory List */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-700">No Assigned Students Found</h3>
            <p className="mt-1 text-xs text-slate-500">Students will appear here once Operations assigns you to active class sessions.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((sp) => (
              <div key={sp._id} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-display text-base font-bold text-marine">{sp.user?.fullName}</h3>
                      <p className="text-xs text-slate-400">{sp.user?.email || sp.user?.phone}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-tide bg-tide/10 px-2.5 py-1 rounded-lg">
                      {sp.studentCode}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Skill Level:</span>
                      <span className="font-semibold text-marine">{sp.skillLevel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Primary Branch:</span>
                      <span className="font-semibold text-marine">{sp.primaryBranch?.name || 'Dubai'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Media Consent:</span>
                      <span className={`font-bold ${sp.mediaConsent ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {sp.mediaConsent ? 'Granted' : 'Declined'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {/* Safety & Medical Alert */}
                  <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1 border border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>Medical &amp; Allergies:</span>
                    </div>
                    <p className="text-slate-600">{sp.medicalNotes || 'No known allergies or medical restrictions.'}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1 border border-slate-100">
                    <p className="font-semibold text-slate-700">Emergency Contact:</p>
                    <p className="text-slate-600">
                      {sp.emergencyContact?.name || 'Parent On Record'} ({sp.emergencyContact?.phone || sp.user?.phone || 'N/A'})
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
