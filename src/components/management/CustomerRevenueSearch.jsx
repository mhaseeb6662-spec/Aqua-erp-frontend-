import { useState, useEffect, useCallback } from 'react';
import { Search, User, DollarSign, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import customerService from '../../services/customerService';
import managementService from '../../services/managementService';
import { formatAED } from '../../utils/currency';

export default function CustomerRevenueSearch({ filters }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);

  // Debounce search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await customerService.getCustomers({ search: query.trim(), limit: 10 });
        setResults(res.data.data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Customer search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Load revenue when customer is selected or filters change
  const fetchRevenue = useCallback(async (customerId) => {
    setIsLoadingRevenue(true);
    setRevenueData(null);
    try {
      const res = await managementService.getCustomerRevenue({
        customerId,
        ...filters
      });
      setRevenueData(res.data.data);
    } catch (err) {
      console.error('Failed to load customer revenue', err);
    } finally {
      setIsLoadingRevenue(false);
    }
  }, [filters]);

  // If a customer is already selected, refetch when filters change
  useEffect(() => {
    if (selectedCustomer) {
      fetchRevenue(selectedCustomer._id);
    }
  }, [selectedCustomer, filters, fetchRevenue]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setQuery('');
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    setRevenueData(null);
    setQuery('');
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-bold text-marine flex items-center gap-2">
          <Search className="h-4 w-4" /> Customer Revenue Search
        </h2>
      </div>

      {!selectedCustomer ? (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-marine/20 focus:border-marine transition shadow-sm"
              placeholder="Search customer by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-marine border-t-transparent"></div>
              </div>
            )}
          </div>

          {showDropdown && results.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 max-h-60 overflow-auto">
              {results.map(c => (
                <div 
                  key={c._id}
                  onClick={() => handleSelectCustomer(c)}
                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-marine">{c.fullName}</p>
                      <p className="text-xs text-slate-500">{c.email || c.phone || 'No contact info'}</p>
                    </div>
                    {c.branch && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold uppercase">{c.branch}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {showDropdown && query.length >= 2 && results.length === 0 && !isSearching && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 p-4 text-center text-sm text-slate-500">
              No customer found.
            </div>
          )}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-marine to-marine-800 border-none shadow-md overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <DollarSign className="h-32 w-32 -mt-4 -mr-4" />
          </div>
          <CardContent className="p-5 text-white relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Customer</p>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <User className="h-5 w-5 opacity-70" /> {selectedCustomer.fullName}
                </h3>
                <p className="text-white/60 text-xs mt-1">{selectedCustomer.email}</p>
              </div>
              <button 
                onClick={handleClear}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition text-white"
                title="Clear Search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10">
              {isLoadingRevenue ? (
                <div className="flex items-center gap-3 text-white/80 text-sm font-medium">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></div>
                  Loading revenue...
                </div>
              ) : revenueData ? (
                <div>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                  <div className="flex items-end gap-3">
                    <p className="text-3xl font-display font-bold text-teal-400">
                      {formatAED(revenueData.netRevenue)}
                    </p>
                    {(revenueData.totalRefunds > 0) && (
                      <p className="text-xs text-white/60 mb-1.5">
                        (After {formatAED(revenueData.totalRefunds)} refunds)
                      </p>
                    )}
                  </div>
                  {revenueData.netRevenue === 0 && revenueData.totalPayments === 0 && (
                    <p className="text-xs text-amber-200 mt-2 bg-amber-500/10 inline-block px-2 py-1 rounded border border-amber-500/20">
                      No completed payments found for this customer in the selected period.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-red-300 text-sm">Failed to load revenue data.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
