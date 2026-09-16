import React, { useState, useEffect } from 'react';
import { Package, Search, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { inventoryAPI } from '../../services/api';

export default function FacilityStockWidget({ facilityName = '', className = '' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStock();
  }, [facilityName]);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const params = {};
      if (facilityName) params.facility = facilityName;
      const res = await inventoryAPI.getInventory(params);
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load inventory stock:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(
    (i) =>
      i.itemName.toLowerCase().includes(search.toLowerCase()) ||
      (i.category && i.category.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN_STOCK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> In Stock
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Low Stock
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" /> Out of Stock
          </span>
        );
      case 'EXPIRING_SOON':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
            <Clock className="w-3 h-3 text-orange-600" /> Expiring Soon
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-emerald-600" />
            Essential Medicine & Supplies Availability
          </h4>
          <p className="text-xs text-slate-500">
            Live availability lookup before prescribing or referral
          </p>
        </div>

        <div className="relative w-full sm:w-48">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-4 text-center text-xs text-slate-400">Loading stock inventory...</div>
      ) : filtered.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-500">No matching medical supplies found.</div>
      ) : (
        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-lg">
          {filtered.map((item) => (
            <div
              key={item._id || item.id}
              className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="font-semibold text-slate-800">{item.itemName}</p>
                <p className="text-[11px] text-slate-400">
                  {item.facilityName ? `${item.facilityName} • ` : ''}Batch: {item.batchNumber || 'N/A'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-700">
                  {item.currentQuantity ?? item.quantityAvailable ?? 0} {item.unit || 'units'}
                </span>
                {getStatusBadge(item.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
