import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Bed, Navigation, Hospital, AlertCircle, RefreshCw } from 'lucide-react';
import { facilityAPI } from '../../services/api';

export default function NearbyFacilities({ currentDistrict = 'Pune', title = 'Nearby Healthcare Facilities', className = '' }) {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [district, setDistrict] = useState(currentDistrict);

  const fetchFacilities = async (latitude, longitude, targetDistrict) => {
    setLoading(true);
    try {
      const params = {};
      if (latitude && longitude) {
        params.lat = latitude;
        params.lng = longitude;
        params.maxDistance = 60;
      }
      if (targetDistrict) {
        params.district = targetDistrict;
      }
      const res = await facilityAPI.getNearbyFacilities(params);
      if (res.data.success) {
        setFacilities(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load nearby facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attempt browser geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          fetchFacilities(lat, lng, district);
        },
        (err) => {
          console.log('Geolocation not available, using district fallback:', err.message);
          fetchFacilities(null, null, district);
        },
        { timeout: 5000 }
      );
    } else {
      fetchFacilities(null, null, district);
    }
  }, [district]);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'DISTRICT_HOSPITAL':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-700 border border-purple-200">District Hospital</span>;
      case 'SUB_DISTRICT_HOSPITAL':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200">Sub-District Hospital</span>;
      case 'RURAL_HOSPITAL':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Rural Hospital (RH)</span>;
      case 'PHC':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-teal-100 text-teal-700 border border-teal-200">PHC</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">Health Facility</span>;
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Hospital className="w-5 h-5 text-emerald-600" />
            {title}
          </h3>
          <p className="text-xs text-slate-500">
            {coords ? 'Showing facilities closest to your GPS location' : `Public healthcare centres in & around ${district}`}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Pune">Pune District</option>
            <option value="Satara">Satara District</option>
            <option value="Solapur">Solapur District</option>
          </select>
          <button
            type="button"
            onClick={() => fetchFacilities(coords?.lat, coords?.lng, district)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
            title="Refresh nearby facilities"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          Locating nearby healthcare facilities...
        </div>
      ) : facilities.length === 0 ? (
        <div className="py-6 text-center text-slate-500 text-sm">
          No public facilities recorded nearby for {district}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {facilities.slice(0, 6).map((fac) => (
            <div
              key={fac._id || fac.id}
              className="p-4 rounded-xl border border-slate-200/80 hover:border-emerald-300 bg-slate-50/50 hover:bg-white transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-sm text-slate-900 leading-snug">{fac.name}</h4>
                  {getTypeBadge(fac.type)}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{fac.block ? `${fac.block}, ` : ''}{fac.district}</span>
                  {fac.distanceKm !== null && (
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto text-xs whitespace-nowrap">
                      ~{fac.distanceKm} km
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 mb-3 bg-white p-2 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5 text-blue-500" />
                    <span>Total: <strong>{fac.totalBeds || 0}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Available: <strong>{fac.availableBeds || 0}</strong></span>
                  </div>
                </div>

                {fac.servicesOffered && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {fac.servicesOffered.slice(0, 4).map((srv, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded">
                        {srv}
                      </span>
                    ))}
                    {fac.servicesOffered.length > 4 && (
                      <span className="text-[10px] text-slate-400">+{fac.servicesOffered.length - 4} more</span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2 text-xs">
                {fac.emergencyContact ? (
                  <a
                    href={`tel:${fac.emergencyContact}`}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    <Phone className="w-3 h-3" />
                    {fac.emergencyContact}
                  </a>
                ) : (
                  <span className="text-slate-400">Emergency: 108</span>
                )}

                {fac.coordinates && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${fac.coordinates.lat},${fac.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-slate-600 hover:text-emerald-600 font-medium"
                  >
                    <Navigation className="w-3 h-3 text-emerald-500" />
                    Directions
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
