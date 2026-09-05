import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { 
  ShieldAlert, AlertCircle, Plus, Search, Trash2, CheckCircle, 
  Clock, AlertTriangle, RefreshCw, X, FileText
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import toast from 'react-hot-toast';

export default function IncidentReports() {
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    incidentType: 'Safety / Injury',
    severity: 'Medium',
    description: '',
    immediateAction: '',
    status: 'Open',
    followUpRequired: false
  });

  const incidentTypes = [
    'Safety / Injury',
    'Equipment Damage',
    'Weather / Delay',
    'Marine / Boat Issue',
    'Behavioral / Student',
    'Customer Complaint',
    'Other'
  ];

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/operations/incidents');
      setIncidents(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load incident reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      incidentType: 'Safety / Injury',
      severity: 'Medium',
      description: '',
      immediateAction: '',
      status: 'Open',
      followUpRequired: false
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      toast.error('Please describe what happened');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/operations/incidents', formData);
      toast.success('Incident logged successfully!');
      setIsAddModalOpen(false);
      fetchIncidents();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveIncident = async (id) => {
    try {
      await api.put(`/operations/incidents/${id}`, {
        status: 'Resolved',
        resolutionDetails: 'Marked resolved by Operations'
      });
      toast.success('Incident marked as Resolved');
      fetchIncidents();
    } catch (err) {
      toast.error('Failed to update incident');
    }
  };

  const handleDelete = async (id, incId) => {
    if (!window.confirm(`Delete incident report ${incId}?`)) return;
    
    try {
      await api.delete(`/operations/incidents/${id}`);
      toast.success('Incident report deleted');
      setIncidents(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      toast.error('Failed to delete incident');
    }
  };

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.incidentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inc.incidentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCount = incidents.filter(i => i.status === 'Open' || i.status === 'Under Investigation').length;
  const criticalCount = incidents.filter(i => i.severity === 'Critical' || i.severity === 'High').length;
  const resolvedCount = incidents.filter(i => i.status === 'Resolved' || i.status === 'Closed').length;

  return (
    <DashboardLayout title="Safety & Incidents">
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-marine">Safety & Incident Reports</h1>
          <p className="text-sm text-slate-500">Log and manage on-water incidents, equipment failures, safety violations, and resolutions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchIncidents}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-700 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Report Incident
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Open Incidents</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-0.5">{openCount} <span className="text-xs font-normal text-slate-500">pending</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">High / Critical</p>
              <h3 className="text-2xl font-bold text-red-600 mt-0.5">{criticalCount} <span className="text-xs font-normal text-slate-500">alerts</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resolved</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">{resolvedCount} <span className="text-xs font-normal text-slate-500">cases</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex gap-2">
          {['All', 'Open', 'Under Investigation', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                statusFilter === st
                  ? 'bg-marine text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search incident ID or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-marine"
          />
        </div>
      </div>

      {/* Incidents List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-marine border-t-transparent mb-2"></div>
          <p className="text-xs font-medium">Loading reports...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="py-16 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-marine">No incidents found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'All' 
              ? 'No incidents match your filter.' 
              : 'Safety record is clean! No incidents have been reported.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((inc) => (
            <Card key={inc._id} className="bg-white border-slate-200 hover:border-slate-300 transition shadow-xs">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    inc.severity === 'Critical' || inc.severity === 'High' 
                      ? 'bg-red-50 text-red-600' 
                      : inc.severity === 'Medium' 
                      ? 'bg-amber-50 text-amber-600' 
                      : 'bg-blue-50 text-blue-600'
                  }`}>
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{inc.incidentId}</span>
                      <h3 className="font-bold text-marine text-base">{inc.incidentType}</h3>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                        inc.severity === 'Critical' || inc.severity === 'High' 
                          ? 'bg-red-100 text-red-700' 
                          : inc.severity === 'Medium' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {inc.severity} Severity
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 max-w-2xl">{inc.description}</p>
                    
                    {inc.immediateAction && (
                      <p className="text-xs text-slate-500 mt-1">
                        <strong>Action Taken:</strong> {inc.immediateAction}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                      <span>Reported by: <strong>{inc.reportedBy?.fullName || 'Staff'}</strong></span>
                      <span>Date: <strong>{new Date(inc.createdAt).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                    inc.status === 'Open' 
                      ? 'bg-amber-100 text-amber-700' 
                      : inc.status === 'Under Investigation' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {inc.status}
                  </span>

                  <div className="flex items-center gap-1">
                    {inc.status !== 'Resolved' && (
                      <button
                        onClick={() => handleResolveIncident(inc._id)}
                        className="text-xs font-semibold py-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(inc._id, inc.incidentId)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Report"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Report Incident Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-marine">Log Safety / Incident Report</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Incident Type *
                  </label>
                  <select
                    value={formData.incidentType}
                    onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none bg-white"
                  >
                    {incidentTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Severity Level *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe what occurred, time, and environment..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Immediate Action Taken
                </label>
                <input
                  type="text"
                  placeholder="e.g. First aid administered, gear replaced, session rescheduled"
                  value={formData.immediateAction}
                  onChange={(e) => setFormData({ ...formData, immediateAction: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Logging...' : 'Submit Incident'}
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
