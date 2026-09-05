import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  HardHat, Wrench, Plus, Search, Filter, Trash2, Edit3, 
  AlertTriangle, CheckCircle2, RefreshCw, X, ShieldAlert, Package, ShoppingBag, 
  DollarSign, Tag, ArrowUpRight, ArrowDownLeft, Settings, Archive, Check, Eye
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import toast from 'react-hot-toast';
import { formatAED } from '../../utils/currency';

export default function EquipmentInventory() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('operations:equipment:manage');

  const [activeTab, setActiveTab] = useState('ACADEMY_USE'); // 'ACADEMY_USE' | 'MERCHANDISE_FOR_SALE'
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  // Category Add & Management Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ 
    name: '', 
    description: '', 
    inventoryType: 'BOTH', 
    status: 'Active' 
  });
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatForm, setEditCatForm] = useState({ 
    name: '', 
    description: '', 
    inventoryType: 'BOTH', 
    status: 'Active' 
  });

  // Movement Modal
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementItem, setMovementItem] = useState(null);
  const [movementAction, setMovementAction] = useState('mark_damaged');
  const [movementQty, setMovementQty] = useState(1);
  const [movementNotes, setMovementNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Item Form state
  const [formData, setFormData] = useState({
    name: '',
    inventoryType: 'ACADEMY_USE',
    sku: '',
    category: '',
    description: '',
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

  const fetchCategories = async () => {
    try {
      const res = await api.get('/operations/inventory-categories?includeInactive=true');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchBranches();
    fetchCategories();
  }, [activeTab]);

  // Categories available for current section / tab
  const availableCategories = useMemo(() => {
    return categories.filter(
      (c) => c.status === 'Active' && (c.inventoryType === 'BOTH' || c.inventoryType === activeTab)
    );
  }, [categories, activeTab]);

  // Distinct category tabs for top filter bar (combining active categories + categories on existing items)
  const filterCategoryTabs = useMemo(() => {
    const set = new Set(['All']);
    availableCategories.forEach((c) => set.add(c.name));
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [availableCategories, items]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const defaultCat = availableCategories[0]?.name || '';
    setFormData({
      name: '',
      inventoryType: activeTab,
      sku: '',
      category: defaultCat,
      description: '',
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
      category: item.category || availableCategories[0]?.name || '',
      description: item.description || '',
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
    if (!formData.category) {
      return toast.error('Please select or add a category');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        inventoryType: activeTab,
        sku: formData.sku.trim(),
        category: formData.category.trim(),
        description: formData.description ? formData.description.trim() : '',
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

  // --- Category Actions ---
  const handleOpenAddCategory = () => {
    setCategoryForm({
      name: '',
      description: '',
      inventoryType: activeTab === 'ACADEMY_USE' ? 'ACADEMY_USE' : 'MERCHANDISE_FOR_SALE',
      status: 'Active'
    });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      return toast.error('Category name is required');
    }

    setIsSubmittingCat(true);
    try {
      const res = await api.post('/operations/inventory-categories', {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        inventoryType: categoryForm.inventoryType,
        status: categoryForm.status
      });
      const newCat = res.data.data;
      toast.success(`Category "${newCat.name}" added successfully!`);
      setShowCategoryModal(false);
      await fetchCategories();
      // If adding an item, auto-select this new category
      setFormData((prev) => ({ ...prev, category: newCat.name }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleStartEditCategory = (cat) => {
    setEditingCatId(cat._id);
    setEditCatForm({
      name: cat.name,
      description: cat.description || '',
      inventoryType: cat.inventoryType,
      status: cat.status
    });
  };

  const handleSaveEditCategory = async (id) => {
    if (!editCatForm.name.trim()) {
      return toast.error('Category name cannot be empty');
    }
    try {
      await api.put(`/operations/inventory-categories/${id}`, {
        name: editCatForm.name.trim(),
        description: editCatForm.description.trim(),
        inventoryType: editCatForm.inventoryType,
        status: editCatForm.status
      });
      toast.success('Category updated successfully!');
      setEditingCatId(null);
      await fetchCategories();
      await fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    }
  };

  const handleToggleArchiveCategory = async (cat) => {
    const newStatus = cat.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/operations/inventory-categories/${cat._id}`, {
        status: newStatus
      });
      toast.success(`Category "${cat.name}" is now ${newStatus}`);
      await fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update category status');
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    try {
      await api.delete(`/operations/inventory-categories/${cat._id}`);
      toast.success('Category deleted successfully');
      await fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category. Try archiving instead.');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
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

          <div className="flex flex-wrap items-center gap-2.5">
            {canManage && (
              <button
                onClick={() => setShowManageCategoriesModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                title="Manage Categories"
              >
                <Settings className="h-3.5 w-3.5 text-tide" />
                Manage Categories
              </button>
            )}

            <button
              onClick={() => { fetchItems(); fetchCategories(); }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm"
              title="Refresh inventory"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {canManage && (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 rounded-xl bg-tide px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-tide-dark transition"
              >
                <Plus className="h-4 w-4" />
                {activeTab === 'ACADEMY_USE' ? 'Add Academy Gear' : 'Add Merchandise Item'}
              </button>
            )}
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
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
            {filterCategoryTabs.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-marine text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'ACADEMY_USE' ? 'Search gear, SKU, description...' : 'Search product, SKU, description...'}
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
              {canManage ? `Click "${activeTab === 'ACADEMY_USE' ? 'Add Academy Gear' : 'Add Merchandise Item'}" to create your first record.` : 'No inventory records matching your query.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item._id} className="rounded-2xl border-slate-100 shadow-sm bg-white hover:shadow-md transition flex flex-col justify-between">
                <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-2.5 shrink-0 ${activeTab === 'ACADEMY_USE' ? 'bg-sky-50 text-tide' : 'bg-emerald-50 text-emerald-600'}`}>
                          {activeTab === 'ACADEMY_USE' ? <HardHat className="h-5 w-5" /> : <Tag className="h-5 w-5" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-marine leading-snug">{item.name}</h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
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

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setViewingItem(item)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-marine transition"
                          title="View item details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                              title="Edit item"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                              title="Delete item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description preview */}
                    {item.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100/80">
                        {item.description}
                      </p>
                    )}

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

                    {/* Branch Info */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span className="truncate">Branch: <strong className="text-slate-700">{item.branch?.name || 'All Branches'}</strong></span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        item.availableQuantity <= 3 ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {item.availableQuantity <= 3 ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                        {item.availableQuantity <= 3 ? 'Low Stock' : 'Ready'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Movement Buttons */}
                  {canManage && (
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-auto">
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
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* ADD / EDIT ITEM MODAL */}
        {/* ======================================================== */}
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Category *
                      </label>
                      {canManage && (
                        <button
                          type="button"
                          onClick={handleOpenAddCategory}
                          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-tide hover:text-tide-dark hover:underline transition"
                        >
                          <Plus className="h-3 w-3" /> Add Category
                        </button>
                      )}
                    </div>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                    >
                      <option value="">Select Category</option>
                      {/* Show current category even if inactive/legacy so it doesn't get lost */}
                      {formData.category && !availableCategories.some(c => c.name === formData.category) && (
                        <option value={formData.category}>{formData.category} (Legacy/Archived)</option>
                      )}
                      {availableCategories.map((c) => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter item specifications, gear condition notes, or merchandise details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Branch
                    </label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                    >
                      <option value="">All Branches</option>
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

        {/* ======================================================== */}
        {/* VIEW ITEM DETAIL MODAL */}
        {/* ======================================================== */}
        {viewingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`rounded-xl p-2 ${viewingItem.inventoryType === 'ACADEMY_USE' ? 'bg-sky-50 text-tide' : 'bg-emerald-50 text-emerald-600'}`}>
                    {viewingItem.inventoryType === 'ACADEMY_USE' ? <HardHat className="h-5 w-5" /> : <Tag className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-marine">{viewingItem.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{viewingItem.sku || viewingItem.code || 'No SKU'}</p>
                  </div>
                </div>
                <button onClick={() => setViewingItem(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[10px]">Section</span>
                    <span className="font-bold text-slate-800">{viewingItem.inventoryType === 'ACADEMY_USE' ? 'Academy Use' : 'Merchandise for Sale'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[10px]">Category</span>
                    <span className="font-bold text-slate-800">{viewingItem.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[10px]">Branch</span>
                    <span className="font-bold text-slate-800">{viewingItem.branch?.name || 'All Branches'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase text-[10px]">Status</span>
                    <span className="font-bold text-emerald-600">{viewingItem.status}</span>
                  </div>
                </div>

                {viewingItem.description ? (
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[10px] mb-1">Description</span>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl leading-relaxed whitespace-pre-wrap">
                      {viewingItem.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No description provided for this item.</p>
                )}

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Total</span>
                    <span className="font-bold text-slate-800">{viewingItem.totalQuantity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Available</span>
                    <span className="font-bold text-emerald-600">{viewingItem.availableQuantity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      {viewingItem.inventoryType === 'ACADEMY_USE' ? 'Damaged' : 'Sold'}
                    </span>
                    <span className="font-bold text-slate-800">
                      {viewingItem.inventoryType === 'ACADEMY_USE' ? viewingItem.damagedQuantity || 0 : viewingItem.soldQuantity || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingItem(null)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ADD INVENTORY CATEGORY MODAL */}
        {/* ======================================================== */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-tide/10 p-2 text-tide">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-marine">Add Inventory Category</h3>
                    <p className="text-[11px] text-slate-400">Create a new category for items</p>
                  </div>
                </div>
                <button onClick={() => setShowCategoryModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Training Equipment"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional category description or guidelines..."
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Inventory Section
                  </label>
                  <select
                    value={categoryForm.inventoryType}
                    onChange={(e) => setCategoryForm({ ...categoryForm, inventoryType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                  >
                    <option value="ACADEMY_USE">Academy Use</option>
                    <option value="MERCHANDISE_FOR_SALE">Merchandise for Sale</option>
                    <option value="BOTH">Both (Usable across both)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={categoryForm.status}
                    onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive (Archived)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCat}
                    className="rounded-xl bg-tide px-4 py-2 text-xs font-bold text-white hover:bg-tide-dark shadow-sm disabled:opacity-50"
                  >
                    {isSubmittingCat ? 'Adding...' : 'Add Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MANAGE CATEGORIES MODAL (Edit / Rename / Archive) */}
        {/* ======================================================== */}
        {showManageCategoriesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl my-8 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-tide/10 p-2 text-tide">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-marine">Manage Inventory Categories</h3>
                    <p className="text-xs text-slate-500">Add, rename, or archive categories across Academy &amp; Merchandise</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddCategory}
                    className="inline-flex items-center gap-1 rounded-xl bg-tide px-3 py-1.5 text-xs font-bold text-white hover:bg-tide-dark shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" /> + Add Category
                  </button>
                  <button onClick={() => setShowManageCategoriesModal(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto pr-1">
                {categories.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400">No categories found.</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {editingCatId === cat._id ? (
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={editCatForm.name}
                              onChange={(e) => setEditCatForm({ ...editCatForm, name: e.target.value })}
                              className="rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-tide focus:outline-none"
                              placeholder="Category Name"
                            />
                            <select
                              value={editCatForm.inventoryType}
                              onChange={(e) => setEditCatForm({ ...editCatForm, inventoryType: e.target.value })}
                              className="rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                            >
                              <option value="ACADEMY_USE">Academy Use</option>
                              <option value="MERCHANDISE_FOR_SALE">Merchandise for Sale</option>
                              <option value="BOTH">Both</option>
                            </select>
                            <select
                              value={editCatForm.status}
                              onChange={(e) => setEditCatForm({ ...editCatForm, status: e.target.value })}
                              className="rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-tide focus:outline-none bg-white"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive (Archived)</option>
                            </select>
                          </div>
                          <input
                            type="text"
                            value={editCatForm.description}
                            onChange={(e) => setEditCatForm({ ...editCatForm, description: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:border-tide focus:outline-none"
                            placeholder="Optional description"
                          />
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleSaveEditCategory(cat._id)}
                              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => setEditingCatId(null)}
                              className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-marine">{cat.name}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                cat.inventoryType === 'ACADEMY_USE' ? 'bg-sky-50 text-tide' : cat.inventoryType === 'MERCHANDISE_FOR_SALE' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                              }`}>
                                {cat.inventoryType === 'ACADEMY_USE' ? 'Academy' : cat.inventoryType === 'MERCHANDISE_FOR_SALE' ? 'Merch' : 'Both'}
                              </span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                cat.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {cat.status}
                              </span>
                            </div>
                            {cat.description && (
                              <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleStartEditCategory(cat)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                              title="Edit / Rename"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleArchiveCategory(cat)}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                                cat.status === 'Active' 
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                              title={cat.status === 'Active' ? 'Archive Category' : 'Activate Category'}
                            >
                              {cat.status === 'Active' ? 'Archive' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                              title="Delete category (if unused)"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowManageCategoriesModal(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STOCK MOVEMENT MODAL */}
        {/* ======================================================== */}
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
                    rows={2}
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
