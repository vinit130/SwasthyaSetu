import React, { useState, useEffect } from 'react';
import { Building, MapPin, Phone, Bed, Search, Filter, RefreshCw, ShieldCheck } from 'lucide-react';
import { facilityAPI } from '../../services/api';

export default function FacilityDirectory() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [type, setType] = useState('');

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (district) params.district = district;
      if (type) params.type = type;
      if (search) params.search = search;
      const res = await facilityAPI.getAllFacilities(params);
      if (res.data.success) {
        setFacilities(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load facilities directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [district, type]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFacilities();
  };

  const getTypeBadge = (t) => {
    switch (t) {
      case 'DISTRICT_HOSPITAL':
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-700 border border-purple-200">District Hospital (DH)</span>;
      case 'SUB_DISTRICT_HOSPITAL':
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200">Sub-District Hospital (SDH)</span>;
      case 'RURAL_HOSPITAL':
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Rural Hospital (RH)</span>;
      case 'PHC':
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-100 text-teal-700 border border-teal-200">Primary Health Centre (PHC)</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">{t}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-indigo-600" />
            Maharashtra Public Healthcare Facility Directory
          </h1>
          <p className="text-xs text-slate-500">
            Statewide institutional network, bed capacities, and emergency contacts
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search facility name, district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs">
        <span className="font-semibold text-slate-600 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter By:
        </span>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="border border-slate-300 rounded-lg px-2.5 py-1 bg-slate-50 text-slate-700 focus:outline-none"
        >
          <option value="">All Districts</option>
          <option value="Pune">Pune</option>
          <option value="Satara">Satara</option>
          <option value="Solapur">Solapur</option>
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-slate-300 rounded-lg px-2.5 py-1 bg-slate-50 text-slate-700 focus:outline-none"
        >
          <option value="">All Institution Types</option>
          <option value="DISTRICT_HOSPITAL">District Hospitals</option>
          <option value="SUB_DISTRICT_HOSPITAL">Sub-District Hospitals</option>
          <option value="RURAL_HOSPITAL">Rural Hospitals</option>
          <option value="PHC">Primary Health Centres (PHC)</option>
        </select>

        <button
          type="button"
          onClick={() => { setDistrict(''); setType(''); setSearch(''); }}
          className="text-indigo-600 hover:underline ml-auto font-medium"
        >
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
          Loading facilities directory...
        </div>
      ) : facilities.length === 0 ? (
        <div className="py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          No healthcare facilities match your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map((fac) => (
            <div
              key={fac._id || fac.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-sm">{fac.name}</h3>
                  {getTypeBadge(fac.type)}
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {fac.address}
                </p>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Beds</span>
                    <strong className="text-slate-800">{fac.totalBeds || 0}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Available</span>
                    <strong className="text-emerald-700">{fac.availableBeds || 0}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ICU Beds</span>
                    <strong className="text-purple-700">{fac.icuBeds || 0}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ICU Available</span>
                    <strong className="text-indigo-700">{fac.availableIcuBeds || 0}</strong>
                  </div>
                </div>

                {fac.servicesOffered && (
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Services:</span>
                    <div className="flex flex-wrap gap-1">
                      {fac.servicesOffered.map((s, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {fac.emergencyContact ? (
                  <a
                    href={`tel:${fac.emergencyContact}`}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Emergency: {fac.emergencyContact}
                  </a>
                ) : (
                  <span className="text-slate-400">Emergency: 108</span>
                )}

                {fac.phone && (
                  <span className="text-slate-500 font-mono text-[11px]">
                    Desk: {fac.phone}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
