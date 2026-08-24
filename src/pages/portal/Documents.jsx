import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import portalService from '../../services/portalService';
import toast from 'react-hot-toast';
import {
  FileText, Upload, CheckCircle2, XCircle, Clock, Plus, X, Download, ShieldCheck, Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DocumentsPage() {
  const { user, hasPermission } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form State
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('Waiver Form');
  const [fileUrlInput, setFileUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await portalService.getDocuments();
      setDocuments(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!docTitle || !docType || !fileUrlInput) {
      return toast.error('Please complete all required fields');
    }
    setIsSubmitting(true);
    try {
      await portalService.uploadDocument({
        title: docTitle,
        documentType: docType,
        fileUrl: fileUrlInput,
        fileSize: '1.4 MB',
      });
      toast.success('Document uploaded and submitted for review!');
      setShowUploadModal(false);
      setDocTitle('');
      setFileUrlInput('');
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewStatus = async (id, status) => {
    try {
      await portalService.reviewDocument(id, { status, reviewNotes: `Marked as ${status}` });
      toast.success(`Document status updated to ${status}`);
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to update document status');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">Document Management</h1>
            <p className="text-sm text-slate-500">
              Upload waiver forms, ID proofs, medical clearance certificates, and view approval status.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-tide px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-tide-dark"
          >
            <Upload className="h-4 w-4" /> Upload Document
          </button>
        </div>

        {/* Documents Table / Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-semibold text-slate-700">No Documents Uploaded</h3>
            <p className="mt-1 text-sm text-slate-500">Upload your liability waiver, medical clearance or ID proof to complete enrollment.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Document Title</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Uploaded Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-marine">
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-tide" />
                          <span>{doc.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{doc.documentType}</td>
                      <td className="px-6 py-4 text-slate-600">{doc.student?.fullName || 'Self'}</td>
                      <td className="px-6 py-4 text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            doc.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : doc.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {doc.status === 'Approved' && <CheckCircle2 className="h-3 w-3" />}
                          {doc.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                          {doc.status === 'Pending Review' && <Clock className="h-3 w-3" />}
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                            title="View Document"
                          >
                            <Download className="h-4 w-4" />
                          </a>

                          {hasPermission('portal:documents:manage') && doc.status === 'Pending Review' && (
                            <>
                              <button
                                onClick={() => handleReviewStatus(doc._id, 'Approved')}
                                className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-200"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReviewStatus(doc._id, 'Rejected')}
                                className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-200"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-display text-lg font-bold text-marine">Upload Document</h2>
                <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Document Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., 2026 Liability Waiver Form"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Document Type *</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  >
                    <option value="Waiver Form">Waiver Form</option>
                    <option value="ID Proof">ID Proof</option>
                    <option value="Medical Clearance">Medical Clearance</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Emergency Form">Emergency Form</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">File Link or Data URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="https://docs.aquafishing.academy/waiver.pdf"
                    value={fileUrlInput}
                    onChange={(e) => setFileUrlInput(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-tide focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Enter public PDF link or document storage URL.
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-tide px-5 py-2 text-sm font-semibold text-white hover:bg-tide-dark disabled:opacity-50"
                  >
                    {isSubmitting ? 'Uploading...' : 'Submit Document'}
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
