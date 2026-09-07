import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bed, UserCheck, RefreshCw, CheckCircle, AlertCircle, X, Plus } from 'lucide-react';
import { hospitalAPI, patientAPI } from '../../services/api';

export default function BedManagement() {
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');

  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedBed, setSelectedBed] = useState(null);
  const [patients, setPatients] = useState([]);
  const [assignPatientId, setAssignPatientId] = useState(preselectedPatientId || '');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBeds = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedWard) params.ward = selectedWard;
      const res = await hospitalAPI.getBeds(params);
      if (res.data.success) {
        setBeds(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load beds:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await patientAPI.getPatients({ limit: 50 });
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load patients for bed assignment:', err);
    }
  };

  useEffect(() => {
    fetchBeds();
    fetchPatients();
  }, [selectedWard]);

  const handleUpdateBed = async (newStatus, pId = null) => {
    if (!selectedBed) return;
    setSaving(true);
    try {
      const res = await hospitalAPI.updateBed(selectedBed._id || selectedBed.id, {
        status: newStatus,
        patientId: pId,
        notes,
      });
      if (res.data.success) {
        setBeds((prev) =>
          prev.map((b) => (b._id === selectedBed._id ? res.data.data : b))
        );
        setSelectedBed(null);
        setAssignPatientId('');
        setNotes('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update bed status.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">AVAILABLE</span>;
      case 'OCCUPIED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200">OCCUPIED</span>;
      case 'MAINTENANCE':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">MAINTENANCE</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const availableCount = beds.filter((b) => b.status === 'AVAILABLE').length;
  const occupiedCount = beds.filter((b) => b.status === 'OCCUPIED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Bed className="w-6 h-6 text-purple-600" />
            Hospital Ward Bed Allocation & Occupancy
          </h1>
          <p className="text-xs text-slate-500">
            Real-time inpatient bed tracking across ICU, General, Maternity, and Emergency wards
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span><strong>{availableCount}</strong> Available</span>
            <span className="text-slate-300">|</span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <span><strong>{occupiedCount}</strong> Occupied</span>
          </div>

          <button
            onClick={fetchBeds}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
            title="Refresh beds"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Ward Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedWard('')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            selectedWard === ''
              ? 'bg-purple-700 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Wards ({beds.length})
        </button>
        {['ICU', 'GENERAL_MALE', 'GENERAL_FEMALE', 'MATERNITY', 'EMERGENCY'].map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setSelectedWard(w)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedWard === w
                ? 'bg-purple-700 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {w.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading ward bed grid...</div>
      ) : beds.length === 0 ? (
        <div className="py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          No beds found for this ward.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {beds.map((bed) => (
            <div
              key={bed._id || bed.id}
              onClick={() => setSelectedBed(bed)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${
                bed.status === 'AVAILABLE'
                  ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'
                  : bed.status === 'OCCUPIED'
                  ? 'bg-purple-50/40 border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                  : 'bg-amber-50/40 border-amber-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-sm text-slate-900">{bed.bedNumber}</span>
                  {getStatusBadge(bed.status)}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1.5">
                  {bed.ward?.replace('_', ' ')}
                </span>
                {bed.status === 'OCCUPIED' ? (
                  <p className="text-xs font-semibold text-purple-900 line-clamp-1">
                    {bed.patientName || bed.patientId?.name || 'Assigned Patient'}
                  </p>
                ) : (
                  <p className="text-xs text-emerald-700 font-medium">Ready for admission</p>
                )}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-200/60 text-[10px] text-slate-400 text-right">
                Click to manage
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bed Assignment / Release Modal */}
      {selectedBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Manage Bed: <span className="font-mono text-purple-700">{selectedBed.bedNumber}</span>
                </h4>
                <p className="text-xs text-slate-500">Ward: {selectedBed.ward?.replace('_', ' ')}</p>
              </div>
              <button
                onClick={() => setSelectedBed(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span>Current Status:</span>
                {getStatusBadge(selectedBed.status)}
              </div>

              {selectedBed.status === 'AVAILABLE' && (
                <div className="space-y-3">
                  <label className="block font-semibold text-slate-700">
                    Assign Admitted Patient:
                  </label>
                  <select
                    value={assignPatientId}
                    onChange={(e) => setAssignPatientId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="">Select a registered patient...</option>
                    {patients.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.name} ({p.patientId} - {p.village})
                      </option>
                    ))}
                  </select>

                  <textarea
                    placeholder="Admission notes (e.g. Admitted under acute respiratory protocol)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      disabled={saving || !assignPatientId}
                      onClick={() => handleUpdateBed('OCCUPIED', assignPatientId)}
                      className="flex-1 py-2 font-bold text-white bg-purple-700 hover:bg-purple-800 disabled:opacity-50 rounded-xl shadow-xs"
                    >
                      {saving ? 'Assigning...' : 'Confirm Admission'}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleUpdateBed('MAINTENANCE')}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
                    >
                      Maintenance
                    </button>
                  </div>
                </div>
              )}

              {selectedBed.status === 'OCCUPIED' && (
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 text-purple-900 rounded-xl border border-purple-200">
                    <p className="font-bold">Currently Assigned To:</p>
                    <p className="text-sm font-semibold">{selectedBed.patientName || selectedBed.patientId?.name || 'Inpatient'}</p>
                    {selectedBed.admissionDate && (
                      <p className="text-[10px] text-purple-700 mt-1">
                        Admitted: {new Date(selectedBed.admissionDate).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleUpdateBed('AVAILABLE', null)}
                    className="w-full py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                  >
                    {saving ? 'Releasing...' : 'Discharge Patient & Free Bed'}
                  </button>
                </div>
              )}

              {selectedBed.status === 'MAINTENANCE' && (
                <div className="space-y-3">
                  <p className="text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    This bed is currently marked for sterilization or repair.
                  </p>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleUpdateBed('AVAILABLE', null)}
                    className="w-full py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                  >
                    Mark Ready & Available
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
