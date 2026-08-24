import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { 
  HardHat, Wrench, Plus, Search, Filter, Trash2, Edit3, 
  AlertTriangle, CheckCircle2, RefreshCw, X, ShieldAlert, Package
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import toast from 'react-hot-toast';

export default function EquipmentInventory() {
  const [equipment, setEquipment] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Fishing Rod',
    branch: '',
    totalQuantity: 10,
    damagedQuantity: 0,
    status: 'Active'
  });

  const categories = [
    'All',
    'Fishing Rod',
    'Reel',
    'Life Jacket',
    'Tackle & Lures',
    'Safety Gear',
    'Boat Equipment',
    'Other'
  ];

  const fetchEquipment = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/operations/equipment');
      setEquipment(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load equipment inventory');
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
    fetchEquipment();
    fetchBranches();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Fishing Rod',
      branch: branches[0]?._id || '',
      totalQuantity: 10,
      damagedQuantity: 0,
      status: 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || 'Fishing Rod',
      branch: item.branch?._id || item.branch || '',
      totalQuantity: item.totalQuantity || 0,
      damagedQuantity: item.damagedQuantity || 0,
      status: item.status || 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter equipment name');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        branch: formData.branch || null,
        totalQuantity: Number(formData.totalQuantity),
        damagedQuantity: Number(formData.damagedQuantity),
        availableQuantity: Math.max(0, Number(formData.totalQuantity) - Number(formData.damagedQuantity)),
        status: formData.status
      };

      if (editingItem) {
        await api.put(`/operations/equipment/${editingItem._id}`, payload);
        toast.success('Equipment updated successfully!');
      } else {
        await api.post('/operations/equipment', payload);
        toast.success('Equipment added successfully!');
      }

      setIsAddModalOpen(false);
      fetchEquipment();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from inventory?`)) return;
    
    try {
      await api.delete(`/operations/equipment/${id}`);
      toast.success('Equipment removed');
      setEquipment(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      toast.error('Failed to delete equipment');
    }
  };

  const handleQuickAdjust = async (item, damageDelta) => {
    const newDamaged = Math.max(0, Math.min(item.totalQuantity, (item.damagedQuantity || 0) + damageDelta));
    const newAvailable = Math.max(0, item.totalQuantity - newDamaged);

    try {
      await api.put(`/operations/equipment/${item._id}`, {
        damagedQuantity: newDamaged,
        availableQuantity: newAvailable
      });
      toast.success(damageDelta > 0 ? 'Marked as damaged' : 'Repaired / Restored');
      fetchEquipment();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalStock = equipment.reduce((acc, curr) => acc + (curr.totalQuantity || 0), 0);
  const totalAvailable = equipment.reduce((acc, curr) => acc + (curr.availableQuantity || 0), 0);
  const totalDamaged = equipment.reduce((acc, curr) => acc + (curr.damagedQuantity || 0), 0);

  return (
    <DashboardLayout title="Equipment & Gear Inventory">
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-marine">Equipment & Gear Inventory</h1>
          <p className="text-sm text-slate-500">Track academy fishing gear, safety equipment, readiness, and damaged stock.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchEquipment}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-marine text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-marine/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Equipment
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Gear Stock</p>
              <h3 className="text-2xl font-bold text-marine mt-0.5">{totalStock} <span className="text-xs font-normal text-slate-500">units</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available For Sessions</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">{totalAvailable} <span className="text-xs font-normal text-slate-500">units</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Damaged / In Repair</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-0.5">{totalDamaged} <span className="text-xs font-normal text-slate-500">units</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                selectedCategory === cat
                  ? 'bg-marine text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search gear name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-marine"
          />
        </div>
      </div>

      {/* Inventory Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-marine border-t-transparent mb-2"></div>
          <p className="text-xs font-medium">Loading inventory...</p>
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="py-16 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6">
          <HardHat className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-marine">No equipment found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'All' 
              ? 'No gear matches your search criteria. Try selecting another category.' 
              : 'Your inventory is currently empty. Click the button below to register gear.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-2 bg-marine text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-marine/90 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Add First Item
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEquipment.map((item) => (
            <Card key={item._id} className="bg-white border-slate-200 hover:border-slate-300 transition shadow-xs">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 text-marine rounded-xl">
                      <HardHat className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-marine text-sm">{item.name}</h3>
                      <span className="inline-block mt-0.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-marine hover:bg-slate-50 rounded-lg transition"
                      title="Edit Item"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id, item.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stock Stats Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                    <span className="text-sm font-bold text-marine">{item.totalQuantity || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Available</span>
                    <span className="text-sm font-bold text-emerald-600">{item.availableQuantity || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-600 block">Damaged</span>
                    <span className="text-sm font-bold text-amber-600">{item.damagedQuantity || 0}</span>
                  </div>
                </div>

                {/* Branch Info */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span>Branch: <strong className="text-slate-700">{item.branch?.name || 'All Branches'}</strong></span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                    (item.availableQuantity || 0) <= 2 ? 'text-red-500' : 'text-emerald-600'
                  }`}>
                    {(item.availableQuantity || 0) <= 2 && <AlertTriangle className="h-3 w-3" />}
                    {(item.availableQuantity || 0) <= 2 ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                {/* Quick Damage / Repair Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleQuickAdjust(item, 1)}
                    disabled={(item.availableQuantity || 0) <= 0}
                    className="flex-1 py-1.5 px-2 border border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-100/70 rounded-lg text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    + Mark 1 Damaged
                  </button>
                  <button
                    onClick={() => handleQuickAdjust(item, -1)}
                    disabled={(item.damagedQuantity || 0) <= 0}
                    className="flex-1 py-1.5 px-2 border border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/70 rounded-lg text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Restore / Repaired
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Equipment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-marine">
                {editingItem ? 'Edit Equipment' : 'Add New Equipment'}
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
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shimano Saltwater Rod 7ft"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none bg-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Branch Location
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
                    Total Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalQuantity}
                    onChange={(e) => setFormData({ ...formData, totalQuantity: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Damaged Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.totalQuantity}
                    value={formData.damagedQuantity}
                    onChange={(e) => setFormData({ ...formData, damagedQuantity: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Operational Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-marine focus:outline-none bg-white"
                >
                  <option value="Active">Active (Ready for Use)</option>
                  <option value="Inactive">Inactive / Out of Inventory</option>
                </select>
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
                  {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Item'}
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
