import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import coachService from '../../services/coachService';
import toast from 'react-hot-toast';
import { ShieldCheck, Calendar, AlertTriangle, FileText, CheckCircle2, Award } from 'lucide-react';

export default function CoachMyCertifications() {
  const [certs, setCerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCertifications = async () => {
    setIsLoading(true);
    try {
      const res = await coachService.getMyCertifications();
      setCerts(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load professional certifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">My Professional Licenses &amp; Certifications</h1>
            <p className="text-xs text-slate-500">
              BRD Certification Compliance — Track mandatory maritime, CPR, lifeguard, and coastal fishing licenses.
            </p>
          </div>
        </div>

        {/* Certifications List */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : certs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-700">No Certification Records Found</h3>
            <p className="mt-1 text-xs text-slate-500">Contact Operations to upload your official maritime and safety licenses.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {certs.map((cert) => {
              const isExpiring = new Date(cert.expiryDate) <= new Date(Date.now() + 30 * 86400000);
              return (
                <div key={cert._id} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tide/10 text-tide font-bold">
                        <Award className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-display text-base font-bold text-marine">{cert.title}</h3>
                        <p className="text-xs text-slate-400">{cert.issuingAuthority}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        isExpiring ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isExpiring ? 'Expiring Soon' : 'Active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Issue Date:</span>
                      <span className="font-semibold text-marine">{new Date(cert.issueDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Expiry Date:</span>
                      <span className={`font-bold ${isExpiring ? 'text-amber-700' : 'text-marine'}`}>
                        {new Date(cert.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {isExpiring && (
                    <div className="rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Renewal Notice: Please submit updated renewal certificate to Operations.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
