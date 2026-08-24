import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { 
  Ship, Wrench, Plus, Search, Trash2, Edit3, 
  AlertTriangle, CheckCircle2, RefreshCw, X, Anchor, FileText
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import toast from 'react-hot-toast';

export default function FleetManagement() {
  const [vessels, setVessels] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    vesselType: 'Speedboat',
    capacity: 8,
    branch: '',
    operationalStatus: 'Available',
    readinessStatus: 'Ready',
    location: ''
  });

  const vesselTypes = [
    'Speedboat',
    'Yacht',
    'Catamaran',
    'Fishing Dinghy',
    'Offshore Cruiser',
    'Traditional Dhow'
  ];

  const fetchVessels = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/operations/vessels');
      setVessels(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load fleet vessels');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data.data || []);
    } catch (err) {
      console.error('Failed to load branches', err);
    }
  };

  useEffect(() => {
    fetchVessels();
    fetchBranches();
  }, []);

  const handleOpenAddModal = () => {
    setEditingVessel(null);
    setFormData({
      name: '',
      registrationNumber: '',
      vesselType: 'Speedboat',
      capacity: 8,
      branch: branches[0]?._id || '',
      operationalStatus: 'Available',
      readinessStatus: 'Ready',
      location: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (vessel) => {
    setEditingVessel(vessel);
    setFormData({
      name: vessel.name || '',
      registrationNumber: vessel.registrationNumber || '',
      vesselType: vessel.vesselType || 'Speedboat',
      capacity: vessel.capacity || 8,
      branch: vessel.branch?._id || vessel.branch || '',
      operationalStatus: vessel.operationalStatus || 'Available',
      readinessStatus: vessel.readinessStatus || 'Ready',
      location: vessel.location || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.registrationNumber.trim()) {
      toast.error('Please enter vessel name and registration number');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        vesselType: formData.vesselType,
        capacity: Number(formData.capacity) || 8,
        branch: formData.branch || null,
        operationalStatus: formData.operationalStatus,
        readinessStatus: formData.readinessStatus,
        location: formData.location.trim()
      };

      if (editingVessel) {
        await api.put(`/operations/vessels/${editingVessel._id}`, payload);
        toast.success('Vessel updated successfully!');
      } else {
        await api.post('/operations/vessels', payload);
        toast.success('Vessel added to fleet successfully!');
      }

      setIsAddModalOpen(false);
      fetchVessels();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove vessel "${name}" from the fleet?`)) return;
    
    try {
      await api.delete(`/operations/vessels/${id}`);
      toast.success('Vessel removed from fleet');
      setVessels(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      toast.error('Failed to delete vessel');
    }
  };

  const handleToggleMaintenance = async (vessel) => {
    const newStatus = vessel.operationalStatus === 'Maintenance' ? 'Available' : 'Maintenance';
    try {
      await api.put(`/operations/vessels/${vessel._id}`, {
        operationalStatus: newStatus,
        readinessStatus: newStatus === 'Available' ? 'Ready' : 'Not Ready'
      });
      toast.success(`Vessel marked as ${newStatus}`);
      fetchVessels();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredVessels = vessels.filter(v => {
    const matchesSearch = v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.vesselType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || v.operationalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const readyCount = vessels.filter(v => v.operationalStatus === 'Available').length;
  const maintenanceCount = vessels.filter(v => v.operationalStatus === 'Maintenance').length;
  const totalCapacity = vessels.reduce((acc, v) => acc + (v.capacity || 0), 0);

  return (
    <DashboardLayout title="Fleet Management">
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-marine">Fleet & Vessel Management</h1>
          <p className="text-sm text-slate-500">Manage academy boats, maritime readiness, maintenance cycles, and passenger capacities.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchVessels}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Fleet"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-marine text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-marine/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Vessel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Ship className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Fleet</p>
              <h3 className="text-2xl font-bold text-marine mt-0.5">{vessels.length} <span className="text-xs font-normal text-slate-500">vessels</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Operational & Ready</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">{readyCount} <span className="text-xs font-normal text-slate-500">vessels</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">In Maintenance</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-0.5">{maintenanceCount} <span className="text-xs font-normal text-slate-500">vessels</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex gap-2">
          {['All', 'Available', 'Maintenance', 'Out of Service'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                statusFilter === status
                  ? 'bg-marine text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vessel or reg #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-marine"
          />
        </div>
      </div>

      {/* Fleet Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-marine border-t-transparent mb-2"></div>
          <p className="text-xs font-medium">Loading fleet data...</p>
        </div>
      ) : filteredVessels.length === 0 ? (
        <div className="py-16 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6">
          <Ship className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-marine">No vessels found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'All' 
              ? 'No vessels match your search or filter criteria.' 
              : 'Your fleet inventory is currently empty. Add your first boat to start managing vessels.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-2 bg-marine text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-marine/90 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Add First Vessel
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVessels.map((vessel) => (
            <Card key={vessel._id} className="bg-white border-slate-200 hover:border-slate-300 transition shadow-xs">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      vessel.operationalStatus === 'Available' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      <Anchor className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-marine text-sm">{vessel.name}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{vessel.registrationNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(vessel)}
                      className="p-1.5 text-slate-400 hover:text-marine hover:bg-slate-50 rounded-lg transition"
                      title="Edit Vessel"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(vessel._id, vessel.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Vessel"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Vessel Type:</span>
                    <strong className="text-marine">{vessel.vesselType || 'Speedboat'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Passenger Capacity:</span>
                    <strong className="text-marine">{vessel.capacity} pax</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Primary Branch:</span>
                    <strong className="text-marine">{vessel.branch?.name || 'All Branches'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Readiness:</span>
                    <span className={`font-semibold ${
                      vessel.readinessStatus === 'Ready' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {vessel.readinessStatus || 'Ready'}
                    </span>
                  </div>
                </div>

                {/* Status Badge & Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                    vessel.operationalStatus === 'Available'
                      ? 'bg-emerald-100 text-emerald-700'
                      : vessel.operationalStatus === 'Maintenance'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {vessel.operationalStatus}
                  </span>

                  <button
                    onClick={() => handleToggleMaintenance(vessel)}
                    className={`text-xs font-semibold py-1.5 px-3 rounded-lg border transition ${
                      vessel.operationalStatus === 'Maintenance'
                        ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {vessel.operationalStatus === 'Maintenance' ? 'Set Available' : 'Send to Maintenance'}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Vessel Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-marine">
                {editingVessel ? 'Edit Vessel' : 'Add New Vessel to Fleet'}
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Vessel Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sea Hunter 1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Registration / Coast Guard # *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DXB-MAR-1049"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Vessel Type
                  </label>
                  <select
                    value={formData.vesselType}
                    onChange={(e) => setFormData({ ...formData, vesselType: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none bg-white"
                  >
                    {vesselTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Passenger Capacity (Pax) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Home Branch
                  </label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none bg-white"
                  >
                    <option value="">All Branches</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Operational Status
                  </label>
                  <select
                    value={formData.operationalStatus}
                    onChange={(e) => setFormData({ ...formData, operationalStatus: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Readiness Status
                  </label>
                  <select
                    value={formData.readinessStatus}
                    onChange={(e) => setFormData({ ...formData, readinessStatus: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none bg-white"
                  >
                    <option value="Ready">Ready for Trips</option>
                    <option value="Not Ready">Not Ready</option>
                  </select>
                </div>
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
                  className="flex-1 py-2.5 bg-marine text-white rounded-xl text-xs font-semibold hover:bg-marine/90 transition shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingVessel ? 'Save Changes' : 'Add Vessel'}
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
