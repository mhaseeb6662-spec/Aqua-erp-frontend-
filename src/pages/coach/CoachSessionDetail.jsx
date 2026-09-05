import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import coachService from '../../services/coachService';
import toast from 'react-hot-toast';
import {
  Calendar, Clock, MapPin, Users, CheckSquare, Award, FileText, Camera, ShieldCheck, AlertTriangle, ArrowLeft, Send, CheckCircle2, X
} from 'lucide-react';

export default function CoachSessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance', 'progress', 'report', 'media', 'badge'

  // Attendance Form
  const [selectedAttendance, setSelectedAttendance] = useState('Present');
  const [attendanceNotes, setAttendanceNotes] = useState('');

  // Progress Note Form
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [skillsRating, setSkillsRating] = useState(4);
  const [safetyAwareness, setSafetyAwareness] = useState('Proper lifejacket & safety protocol followed.');
  const [behaviorNotes, setBehaviorNotes] = useState('Attentive and eager to practice fishing techniques.');
  const [progressRemarks, setProgressRemarks] = useState('');
  const [isSubmittingProgress, setIsSubmittingProgress] = useState(false);

  // Session Report Form
  const [reportSummary, setReportSummary] = useState('');
  const [studentObs, setStudentObs] = useState('');
  const [safetyIncidents, setSafetyIncidents] = useState('No safety incidents.');
  const [followUp, setFollowUp] = useState(false);
  const [upsell, setUpsell] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Media Form
  const [mediaTitle, setMediaTitle] = useState('Practical Session Photo');
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Achievement Badge Form
  const [badgeTitle, setBadgeTitle] = useState('Knot Tying Specialist');
  const [badgeType, setBadgeType] = useState('Knot Tying Specialist');
  const [badgeRemarks, setBadgeRemarks] = useState('Mastered Palomar & Improved Clinch knots.');
  const [isIssuingBadge, setIsIssuingBadge] = useState(false);

  const fetchSessionDetail = async () => {
    setIsLoading(true);
    try {
      const res = await coachService.getSessionById(id);
      const sessionData = res.data.data;
      setData(sessionData);

      if (sessionData?.session) {
        setSelectedAttendance(sessionData.session.attendance !== 'Not Marked' ? sessionData.session.attendance : 'Present');
        setAttendanceNotes(sessionData.session.notes || '');
      }

      if (sessionData?.sessionReport) {
        setReportSummary(sessionData.sessionReport.summary || '');
        setStudentObs(sessionData.sessionReport.studentObservations || '');
        setSafetyIncidents(sessionData.sessionReport.safetyIncidents || 'No safety incidents.');
        setFollowUp(!!sessionData.sessionReport.followUpRequired);
        setUpsell(sessionData.sessionReport.upsellOpportunity || '');
      }

      if (sessionData?.studentProfile) {
        setSkillLevel(sessionData.studentProfile.skillLevel || 'Beginner');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load session details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetail();
  }, [id]);

  const handleUpdateAttendance = async (status) => {
    try {
      await coachService.updateAttendance(id, { attendance: status, notes: attendanceNotes });
      toast.success(`Attendance recorded as "${status}"`);
      setSelectedAttendance(status);
      fetchSessionDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update attendance');
    }
  };

  const handleSaveProgressNote = async (e) => {
    e.preventDefault();
    if (!progressRemarks.trim()) return toast.error('Please enter progress remarks');
    setIsSubmittingProgress(true);
    try {
      await coachService.createProgressNote({
        studentId: data.session?.student?._id || data.session?.student,
        sessionId: id,
        programId: data.session?.program?._id,
        skillLevel,
        skillsRating: Number(skillsRating),
        safetyAwareness,
        behaviorNotes,
        remarks: progressRemarks.trim(),
      });
      toast.success('Student progress note saved successfully!');
      setProgressRemarks('');
      fetchSessionDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save progress note');
    } finally {
      setIsSubmittingProgress(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportSummary.trim()) return toast.error('Please enter session summary');
    setIsSubmittingReport(true);
    try {
      await coachService.submitSessionReport({
        sessionId: id,
        summary: reportSummary.trim(),
        studentObservations: studentObs,
        safetyIncidents,
        followUpRequired: followUp,
        upsellOpportunity: upsell,
      });
      toast.success('Session completion report submitted successfully!');
      fetchSessionDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit session report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleUploadMedia = async (e) => {
    e.preventDefault();
    if (!mediaUrl.trim()) return toast.error('Please provide media URL or image file');
    setIsUploadingMedia(true);
    try {
      await coachService.uploadMedia({
        studentId: data.session?.student?._id || data.session?.student,
        sessionId: id,
        title: mediaTitle,
        fileUrl: mediaUrl,
        mimeType: 'image/jpeg',
      });
      toast.success('Session photo/video uploaded successfully!');
      fetchSessionDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload media');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleIssueBadge = async (e) => {
    e.preventDefault();
    if (!badgeTitle.trim()) return toast.error('Please enter achievement title');
    setIsIssuingBadge(true);
    try {
      await coachService.issueAchievement({
        studentId: data.session?.student?._id || data.session?.student,
        sessionId: id,
        programId: data.session?.program?._id,
        title: badgeTitle,
        badgeType,
        remarks: badgeRemarks,
      });
      toast.success(`Achievement badge "${badgeTitle}" issued to student!`);
      setBadgeTitle('');
      fetchSessionDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue achievement');
    } finally {
      setIsIssuingBadge(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  const session = data?.session;
  const student = session?.student;
  const profile = data?.studentProfile;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Back Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/coach/sessions')}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SESSION MANAGER</span>
            <h1 className="font-display text-xl font-bold text-marine">{session?.program?.title}</h1>
          </div>
        </div>

        {/* Session Card Overview */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-tide bg-tide/10 px-2 py-0.5 rounded-md">
                  {session?.sessionType || 'Class'}
                </span>
                <span className="text-xs font-bold text-slate-500">{new Date(session?.startTime).toDateString()}</span>
              </div>
              <h2 className="font-display text-base font-bold text-marine mt-1">{session?.branch?.name || 'Dubai'}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Location: {session?.location || 'Academy Dock'}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  session?.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {session?.status}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-tide shrink-0" />
              <span>
                {new Date(session?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {new Date(session?.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                <span className="font-semibold text-tide">
                  ({Math.floor(Math.round((new Date(session?.endTime) - new Date(session?.startTime)) / 60000) / 60) > 0 ? `${Math.floor(Math.round((new Date(session?.endTime) - new Date(session?.startTime)) / 60000) / 60)} hr ` : ''}
                  {Math.round((new Date(session?.endTime) - new Date(session?.startTime)) / 60000) % 60 > 0 ? `${Math.round((new Date(session?.endTime) - new Date(session?.startTime)) / 60000) % 60} min` : ''})
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-tide shrink-0" />
              <span>Student / Group: <strong className="text-marine">{student?.fullName || (session?.participants?.length > 0 ? `${session.participants.length} Students` : 'Open Roster')}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-tide shrink-0" />
              <span>Current Roll Call: <strong className="text-tide">{session?.attendance}</strong></span>
            </div>
          </div>
        </div>

        {/* Student Safety & Emergency Restrictions Box */}
        {profile && (
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-tide" />
                <h3 className="font-display text-sm font-bold text-marine">Student Safety &amp; Emergency Details</h3>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className={`px-2.5 py-0.5 rounded-full font-bold ${profile.mediaConsent ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {profile.mediaConsent ? 'Media Consent Allowed' : 'Media Consent Declined'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-sky-100 text-sky-700">
                  Skill: {profile.skillLevel}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-slate-500">Medical &amp; Allergy Restrictions:</span>
                <p className="font-medium text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                  {profile.medicalNotes || 'No known allergies or medical restrictions.'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-slate-500">Emergency Contact:</span>
                <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {profile.emergencyContact?.name || 'Parent On Record'} - {profile.emergencyContact?.phone || student?.phone || 'N/A'} ({profile.emergencyContact?.relationship || 'Parent'})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Operational Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {[
            { id: 'attendance', label: '1. Roll Call & Attendance', icon: CheckSquare },
            { id: 'progress', label: '2. Student Progress Note', icon: Award },
            { id: 'report', label: '3. Session Report', icon: FileText },
            { id: 'media', label: '4. Session Media', icon: Camera },
            { id: 'badge', label: '5. Award Achievement', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-tide text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-display text-base font-bold text-marine">Mark Student Roll Call</h3>
            <p className="text-xs text-slate-500">
              Select attendance status for <strong className="text-marine">{student?.fullName}</strong> for this session.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { status: 'Present', color: 'bg-emerald-600 text-white' },
                { status: 'Absent', color: 'bg-rose-600 text-white' },
                { status: 'Rescheduled', color: 'bg-amber-500 text-white' },
                { status: 'No-show', color: 'bg-slate-700 text-white' },
              ].map((item) => (
                <button
                  key={item.status}
                  onClick={() => handleUpdateAttendance(item.status)}
                  className={`rounded-xl py-3 px-4 text-xs font-bold shadow-xs transition hover:opacity-90 ${
                    selectedAttendance === item.status ? item.color : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.status}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700">Attendance Remarks / Notes</label>
              <input
                type="text"
                placeholder="Optional notes (e.g. arrived 5 mins late due to boat dock setup)..."
                value={attendanceNotes}
                onChange={(e) => setAttendanceNotes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-tide focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: PROGRESS NOTES */}
        {activeTab === 'progress' && (
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-display text-base font-bold text-marine">Record Student Skill Progress</h3>

            <form onSubmit={handleSaveProgressNote} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Skill Level</label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-marine focus:border-tide focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Master">Master</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Skills Performance Rating (1-5)</label>
                  <select
                    value={skillsRating}
                    onChange={(e) => setSkillsRating(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-marine focus:border-tide focus:outline-none"
                  >
                    <option value={5}>5 Stars - Outstanding</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Proficient</option>
                    <option value={2}>2 Stars - Developing</option>
                    <option value={1}>1 Star - Needs Improvement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Safety &amp; Protocol Adherence</label>
                <input
                  type="text"
                  value={safetyAwareness}
                  onChange={(e) => setSafetyAwareness(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-tide focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Behavior &amp; Attitude</label>
                <input
                  type="text"
                  value={behaviorNotes}
                  onChange={(e) => setBehaviorNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-tide focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Coach Remarks &amp; Feedback *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed observations regarding student casting, rigging, species identification, and safety..."
                  value={progressRemarks}
                  onChange={(e) => setProgressRemarks(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-tide focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingProgress}
                  className="rounded-xl bg-tide px-5 py-2.5 text-xs font-bold text-white hover:bg-tide-dark disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Send className="h-4 w-4" /> Save Progress Note
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: SESSION REPORT */}
        {activeTab === 'report' && (
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-display text-base font-bold text-marine">End-of-Session Operational Report</h3>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Session Delivery Summary *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize practical fishing drills conducted, sea weather conditions, boat operations..."
                  value={reportSummary}
                  onChange={(e) => setReportSummary(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-tide focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Student Observations &amp; Achievements</label>
                <input
                  type="text"
                  placeholder="E.g., Student successfully caught and safely released a 3kg Kingfish..."
                  value={studentObs}
                  onChange={(e) => setStudentObs(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-tide focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Safety &amp; Incident Log</label>
                <input
                  type="text"
                  value={safetyIncidents}
                  onChange={(e) => setSafetyIncidents(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-tide focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Recommended Next Program / Upsell</label>
                <input
                  type="text"
                  placeholder="E.g., Recommend advancing to Deep Sea & Offshore Tournament Camp..."
                  value={upsell}
                  onChange={(e) => setUpsell(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-tide focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" /> Submit Session Report
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: MEDIA UPLOAD */}
        {activeTab === 'media' && (
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-display text-base font-bold text-marine">Session Photos &amp; Media Upload</h3>

            {profile && !profile.mediaConsent ? (
              <div className="rounded-xl bg-rose-50 p-4 border border-rose-200 text-rose-800 text-xs">
                <p className="font-bold">Media Upload Restricted</p>
                <p className="mt-1">This student's parent has declined media consent. Photo/video upload is disabled for privacy.</p>
              </div>
            ) : (
              <form onSubmit={handleUploadMedia} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Media Title / Description</label>
                  <input
                    type="text"
                    required
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-tide focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Image / File URL</label>
                  <input
                    type="text"
                    required
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono focus:border-tide focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUploadingMedia}
                    className="rounded-xl bg-tide px-5 py-2.5 text-xs font-bold text-white hover:bg-tide-dark disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    <Camera className="h-4 w-4" /> Upload Media
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 5: BADGE / ACHIEVEMENT */}
        {activeTab === 'badge' && (
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-display text-base font-bold text-marine">Award Student Achievement Badge</h3>

            <form onSubmit={handleIssueBadge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Badge Type</label>
                <select
                  value={badgeType}
                  onChange={(e) => {
                    setBadgeType(e.target.value);
                    setBadgeTitle(e.target.value);
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-marine focus:border-tide focus:outline-none"
                >
                  <option value="Little Angler Badge">Little Angler Badge</option>
                  <option value="Knot Tying Specialist">Knot Tying Specialist</option>
                  <option value="Deep Sea Master">Deep Sea Master</option>
                  <option value="Navigation Pro">Navigation Pro</option>
                  <option value="Safety Hero">Safety Hero</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Achievement Title</label>
                <input
                  type="text"
                  required
                  value={badgeTitle}
                  onChange={(e) => setBadgeTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-tide focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Remarks / Milestone Details</label>
                <input
                  type="text"
                  value={badgeRemarks}
                  onChange={(e) => setBadgeRemarks(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-tide focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isIssuingBadge}
                  className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Award className="h-4 w-4" /> Issue Achievement Badge
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
