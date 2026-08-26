import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { 
  HardHat, Wrench, Plus, Search, Filter, Trash2, Edit3, 
  AlertTriangle, CheckCircle2, RefreshCw, X, ShieldAlert, Package, ShoppingBag, DollarSign, Tag, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import toast from 'react-hot-toast';
import { formatAED } from '../../utils/currency';

export default function EquipmentInventory() {
  const [activeTab, setActiveTab] = useState('ACADEMY_USE'); // 'ACADEMY_USE' | 'MERCHANDISE_FOR_SALE'
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementItem, setMovementItem] = useState(null);
  const [movementAction, setMovementAction] = useState('mark_damaged');
  const [movementQty, setMovementQty] = useState(1);
  const [movementNotes, setMovementNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    inventoryType: 'ACADEMY_USE',
    sku: '',
    category: 'Fishing Rod',
    branch: '',
    totalQuantity: 10,
    damagedQuantity: 0,
    inUseQuantity: 0,
    sellingPrice: 0,
    costPrice: 0,
    reorderLevel: 5,
    storageLocation: '',
    notes: '',
    status: 'Active'
  });

  const academyCategories = [
    'All',
    'Fishing Rod',
    'Reel',
    'Life Jacket',
    'Tackle & Lures',
    'Safety Gear',
    'Boat Equipment',
    'Training Gear',
    'Other'
  ];

  const merchandiseCategories = [
    'All',
    'Apparel & Uniforms',
    'Academy Merchandise',
    'Fishing Accessories',
    'Bait & Tackle',
    'Branded Gear',
    'Pro Shop',
    'Other'
  ];

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const [itemsRes, metricsRes] = await Promise.all([
        api.get(`/operations/equipment?inventoryType=${activeTab}`),
        api.get('/operations/equipment/metrics')
      ]);
      setItems(itemsRes.data.data || []);
      setMetrics(metricsRes.data.data || null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load inventory items');
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
    fetchItems();
    fetchBranches();
  }, [activeTab]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      inventoryType: activeTab,
      sku: '',
      category: activeTab === 'ACADEMY_USE' ? 'Fishing Rod' : 'Apparel & Uniforms',
      branch: branches[0]?._id || '',
      totalQuantity: 10,
      damagedQuantity: 0,
      inUseQuantity: 0,
      sellingPrice: activeTab === 'MERCHANDISE_FOR_SALE' ? 150 : 0,
      costPrice: activeTab === 'MERCHANDISE_FOR_SALE' ? 80 : 0,
      reorderLevel: 5,
      storageLocation: '',
      notes: '',
      status: 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      inventoryType: item.inventoryType || activeTab,
      sku: item.sku || '',
      category: item.category || (activeTab === 'ACADEMY_USE' ? 'Fishing Rod' : 'Apparel & Uniforms'),
      branch: item.branch?._id || item.branch || '',
      totalQuantity: item.totalQuantity || 0,
      damagedQuantity: item.damagedQuantity || 0,
      inUseQuantity: item.inUseQuantity || 0,
      sellingPrice: item.sellingPrice || 0,
      costPrice: item.costPrice || 0,
      reorderLevel: item.reorderLevel || 5,
      storageLocation: item.storageLocation || '',
      notes: item.notes || '',
      status: item.status || 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenMovementModal = (item, action) => {
    setMovementItem(item);
    setMovementAction(action);
    setMovementQty(1);
    setMovementNotes('');
    setIsMovementModalOpen(true);
  };

  const handleSubmitMovement = async (e) => {
    e.preventDefault();
    if (!movementItem) return;

    setIsSubmitting(true);
    try {
      await api.post(`/operations/equipment/${movementItem._id}/movement`, {
        action: movementAction,
        quantity: Number(movementQty),
        notes: movementNotes.trim()
      });
      toast.success('Stock movement recorded successfully!');
      setIsMovementModalOpen(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record stock movement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return toast.error('Please enter an item name');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        inventoryType: activeTab,
        sku: formData.sku.trim(),
        category: formData.category,
        branch: formData.branch || null,
        totalQuantity: Number(formData.totalQuantity),
        damagedQuantity: Number(formData.damagedQuantity || 0),
        inUseQuantity: Number(formData.inUseQuantity || 0),
        sellingPrice: Number(formData.sellingPrice || 0),
        costPrice: Number(formData.costPrice || 0),
        reorderLevel: Number(formData.reorderLevel || 5),
        storageLocation: formData.storageLocation.trim(),
        notes: formData.notes.trim(),
        status: formData.status
      };

      if (editingItem) {
        await api.put(`/operations/equipment/${editingItem._id}`, payload);
        toast.success('Inventory item updated successfully!');
      } else {
        await api.post('/operations/equipment', payload);
        toast.success('New inventory item added!');
      }

      setIsAddModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save inventory item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/operations/equipment/${id}`);
      toast.success('Item deleted');
      fetchItems();
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const activeCategories = activeTab === 'ACADEMY_USE' ? academyCategories : merchandiseCategories;

  const filteredItems = items.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-marine">
              Equipment &amp; Gear Inventory
            </h1>
            <p className="text-sm text-slate-500">
              Manage internal Academy gear readiness and retail merchandise stock.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchItems}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              title="Refresh inventory"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-tide px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-tide-dark transition"
            >
              <Plus className="h-4 w-4" />
              {activeTab === 'ACADEMY_USE' ? 'Add Academy Gear' : 'Add Merchandise Item'}
            </button>
          </div>
        </div>

        {/* Section Segmented Navigation */}
        <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80 max-w-md">
          <button
            onClick={() => {
              setActiveTab('ACADEMY_USE');
              setSelectedCategory('All');
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeTab === 'ACADEMY_USE'
                ? 'bg-white text-marine shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HardHat className="h-4 w-4 text-tide" />
            Academy Use
            {metrics?.academy?.itemCount > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {metrics.academy.itemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('MERCHANDISE_FOR_SALE');
              setSelectedCategory('All');
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeTab === 'MERCHANDISE_FOR_SALE'
                ? 'bg-white text-marine shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
            Merchandise for Sale
            {metrics?.merchandise?.productCount > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {metrics.merchandise.productCount}
              </span>
            )}
          </button>
        </div>

        {/* KPI Metrics Cards */}
        {activeTab === 'ACADEMY_USE' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Card className="rounded-2xl border-slate-100 shadow-sm bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="rounded-xl bg-sky-50 p-3 text-tide">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Gear Stock</p>
                  <p className="font-display text-2xl font-bold text-marine">{metrics?.academy?.totalGear || 0} <span className="text-xs font-normal text-slate-400">units</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-100 shadow-sm bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Available for Sessions</p>
                  <p className="font-display text-2xl font-bold text-emerald-600">{metrics?.academy?.available || 0} <span className="text-xs font-normal text-slate-400">units</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-100 shadow-sm bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                  <Wrench className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">In Use / Issued</p>
                  <p className="font-display text-2xl font-bold text-amber-600">{metrics?.academy?.inUse || 0} <span className="text-xs font-normal text-slate-400">units</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-100 shadow-sm bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Damaged / Repair</p>
                  <p className="font-display text-2xl font-bold text-rose-600">{metrics?.academy?.damaged || 0} <span className="text-xs font-normal text-slate-400">units</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Card className="rounded-2xl border-slate-100 shadow-sm bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Merch Units</p>
                  <p className="font-display text-2xl font-bold text-marine">{metrics?.merchandise?.totalStock || 0} <span className="text-xs font-normal text-slate-400">units</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-100 shadow-sm bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="rounded-xl bg-sky-50 p-3 text-tide">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Available for Sale</p>
                  <p className="font-display text-2xl font-bold text-emerald-600">{metrics?.merchandise?.availableForSale || 0} <span className="text-xs font-normal text-slate-400">units</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-100 shadow-sm bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Stock Retail Value</p>
                  <p className="font-display text-xl font-bold text-marine">{formatAED(metrics?.merchandise?.inventoryRetailValue || 0)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-100 shadow-sm bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock Alerts</p>
                  <p className="font-display text-2xl font-bold text-amber-600">{metrics?.merchandise?.lowStockCount || 0} <span className="text-xs font-normal text-slate-400">items</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Categories & Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
            {activeCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-marine text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'ACADEMY_USE' ? 'Search gear name or SKU...' : 'Search product or SKU...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-xs focus:border-tide focus:outline-none bg-white"
            />
          </div>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tide border-t-transparent"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            {activeTab === 'ACADEMY_USE' ? (
              <HardHat className="mx-auto h-12 w-12 text-slate-300" />
            ) : (
              <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
            )}
            <h3 className="mt-3 text-lg font-semibold text-slate-700">
              No {activeTab === 'ACADEMY_USE' ? 'Equipment' : 'Merchandise'} Items Found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Click &quot;{activeTab === 'ACADEMY_USE' ? 'Add Academy Gear' : 'Add Merchandise Item'}&quot; to create your first record.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item._id} className="rounded-2xl border-slate-100 shadow-sm bg-white hover:shadow-md transition">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl p-2.5 ${activeTab === 'ACADEMY_USE' ? 'bg-sky-50 text-tide' : 'bg-emerald-50 text-emerald-600'}`}>
                        {activeTab === 'ACADEMY_USE' ? <HardHat className="h-5 w-5" /> : <Tag className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-marine leading-snug">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {item.category}
                          </span>
                          {item.sku && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.sku}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        title="Edit item"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Operational / Merchandise Stats */}
                  {activeTab === 'ACADEMY_USE' ? (
                    <div className="grid grid-cols-3 rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">TOTAL</p>
                        <p className="font-display font-bold text-slate-800 text-sm">{item.totalQuantity}</p>
                      </div>
                      <div className="border-x border-slate-200">
                        <p className="text-[10px] font-bold uppercase text-slate-400">AVAILABLE</p>
                        <p className="font-display font-bold text-emerald-600 text-sm">{item.availableQuantity}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">DAMAGED</p>
                        <p className="font-display font-bold text-rose-600 text-sm">{item.damagedQuantity || 0}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">PRICE</p>
                        <p className="font-display font-bold text-marine text-xs">{formatAED(item.sellingPrice || 0)}</p>
                      </div>
                      <div className="border-x border-slate-200">
                        <p className="text-[10px] font-bold uppercase text-slate-400">IN STOCK</p>
                        <p className="font-display font-bold text-emerald-600 text-sm">{item.availableQuantity}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">SOLD</p>
                        <p className="font-display font-bold text-slate-700 text-sm">{item.soldQuantity || 0}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate">Branch: <strong className="text-slate-700">{item.branch?.name || 'All Branches'}</strong></span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                      item.availableQuantity <= 3 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {item.availableQuantity <= 3 ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                      {item.availableQuantity <= 3 ? 'Low Stock' : 'Ready'}
                    </span>
                  </div>

                  {/* Quick Movement Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {activeTab === 'ACADEMY_USE' ? (
                      <>
                        <button
                          onClick={() => handleOpenMovementModal(item, 'mark_damaged')}
                          disabled={item.availableQuantity <= 0}
                          className="flex-1 rounded-lg border border-amber-200 bg-amber-50/50 py-1.5 text-[11px] font-bold text-amber-700 hover:bg-amber-100 transition disabled:opacity-40"
                        >
                          + Mark Damaged
                        </button>
                        <button
                          onClick={() => handleOpenMovementModal(item, 'repair_restore')}
                          disabled={(item.damagedQuantity || 0) <= 0}
                          className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50/50 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-40"
                        >
                          Restore / Repaired
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenMovementModal(item, 'record_sale')}
                          disabled={item.availableQuantity <= 0}
                          className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50/50 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-40"
                        >
                          Record Sale
                        </button>
                        <button
                          onClick={() => handleOpenMovementModal(item, 'restock')}
                          className="flex-1 rounded-lg border border-sky-200 bg-sky-50/50 py-1.5 text-[11px] font-bold text-sky-700 hover:bg-sky-100 transition"
                        >
                          Restock Units
                        </button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add / Edit Item Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className={`rounded-xl p-2 ${activeTab === 'ACADEMY_USE' ? 'bg-sky-50 text-tide' : 'bg-emerald-50 text-emerald-600'}`}>
                    {activeTab === 'ACADEMY_USE' ? <HardHat className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-marine">
                      {editingItem ? 'Edit Item' : activeTab === 'ACADEMY_USE' ? 'Add Academy Equipment' : 'Add Merchandise Product'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {activeTab === 'ACADEMY_USE' ? 'Operational internal equipment' : 'Retail commercial stock for sale'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {activeTab === 'ACADEMY_USE' ? 'Equipment Name *' : 'Product Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={activeTab === 'ACADEMY_USE' ? 'e.g. Shimano Stella SW 8000 Reel' : 'e.g. Academy UV Sun-Shield Long Sleeve Shirt'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      SKU / Item Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ROD-SHIM-001"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                    >
                      {(activeTab === 'ACADEMY_USE' ? academyCategories : merchandiseCategories).filter(c => c !== 'All').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Primary Branch
                    </label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                    >
                      {branches.map((b) => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Total Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.totalQuantity}
                      onChange={(e) => setFormData({ ...formData, totalQuantity: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                    />
                  </div>
                </div>

                {activeTab === 'MERCHANDISE_FOR_SALE' && (
                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-emerald-50/50 p-3 border border-emerald-100">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Selling Price (AED) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:border-tide focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Cost Price (AED)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-tide px-5 py-2 text-xs font-bold text-white hover:bg-tide-dark shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : editingItem ? 'Update Item' : 'Create Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stock Movement Modal */}
        {isMovementModalOpen && movementItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-tide/10 p-2 text-tide">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-marine">Stock Movement</h2>
                    <p className="text-xs font-mono text-slate-500">{movementItem.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsMovementModalOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitMovement} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Movement Action *
                  </label>
                  <select
                    value={movementAction}
                    onChange={(e) => setMovementAction(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:border-tide focus:outline-none bg-white"
                  >
                    {activeTab === 'ACADEMY_USE' ? (
                      <>
                        <option value="mark_damaged">Mark as Damaged</option>
                        <option value="repair_restore">Repair / Restore to Available</option>
                        <option value="issue_gear">Issue Gear (In Use)</option>
                        <option value="return_gear">Return Gear (Available)</option>
                        <option value="restock">Restock / Add Quantity</option>
                      </>
                    ) : (
                      <>
                        <option value="record_sale">Record Customer Sale</option>
                        <option value="restock">Restock Inventory</option>
                        <option value="mark_damaged">Mark Damaged / Write-off</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movementQty}
                    onChange={(e) => setMovementQty(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:border-tide focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Remarks / Notes
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Session gear inspection or retail customer purchase"
                    value={movementNotes}
                    onChange={(e) => setMovementNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsMovementModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-tide px-5 py-2 text-xs font-bold text-white hover:bg-tide-dark shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm Movement'}
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
