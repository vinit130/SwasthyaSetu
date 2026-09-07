import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Hospital,
  Share2,
  Bed,
  AlertOctagon,
  FileCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  Search,
  Package,
  RefreshCw,
} from 'lucide-react';
import { hospitalAPI, referralAPI } from '../../services/api';
import FacilityStockWidget from '../../components/inventory/FacilityStockWidget';

export default function HospitalDashboard() {
  const [referrals, setReferrals] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [refRes, bedRes] = await Promise.all([
        hospitalAPI.getReferrals(),
        hospitalAPI.getBeds(),
      ]);
      if (refRes.data.success) setReferrals(refRes.data.data);
      if (bedRes.data.success) setBeds(refRes.data.data);
    } catch (err) {
      console.error('Failed to load hospital dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (referralId, newStatus) => {
    setStatusUpdating(referralId);
    try {
      const res = await referralAPI.updateStatus(referralId, { status: newStatus });
      if (res.data.success) {
        setReferrals((prev) =>
          prev.map((r) => (r._id === referralId ? res.data.data : r))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update referral status.');
    } finally {
      setStatusUpdating(null);
    }
  };

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === 'OCCUPIED').length;
  const availableBeds = beds.filter((b) => b.status === 'AVAILABLE').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const pendingArrivals = referrals.filter((r) => ['CREATED', 'ACCEPTED'].includes(r.status));
  const activeTreatments = referrals.filter((r) => r.status === 'PATIENT ARRIVED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-2xl shadow-md border border-purple-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 mb-2">
            <Hospital className="w-3.5 h-3.5" />
            District Hospital Specialized Care Hub
          </div>
          <h1 className="text-2xl font-black tracking-tight">Secondary & Tertiary Healthcare Receiving Center</h1>
          <p className="text-xs text-purple-200 mt-1">
            Token verification, emergency break-glass triage, bed allocation & inpatient clinical records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/hospital/referrals"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-purple-950 hover:bg-purple-50 transition-all shadow-sm flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5 text-purple-700" />
            Lookup Token
          </Link>
          <Link
            to="/hospital/emergency"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm flex items-center gap-1.5"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Break-Glass Emergency
          </Link>
          <Link
            to="/hospital/treatment"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-sm flex items-center gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5" />
            Record Treatment
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Inbound</span>
            <Share2 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{referrals.length}</p>
          <span className="text-[10px] text-slate-400">Referrals registered</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs bg-blue-50/20">
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-xs font-semibold">Awaiting Arrival</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-700">{pendingArrivals.length}</p>
          <span className="text-[10px] text-blue-500 font-medium">Created or Accepted</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-semibold">Under Treatment</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{activeTreatments.length}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Patient Arrived</span>
        </div>

        <Link
          to="/hospital/beds"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-all group block"
        >
          <div className="flex items-center justify-between text-purple-600 mb-1">
            <span className="text-xs font-semibold">Ward Beds</span>
            <Bed className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-slate-900">{availableBeds} Available</p>
          <span className="text-[10px] text-slate-500">{occupancyRate}% occupancy ({occupiedBeds}/{totalBeds})</span>
        </Link>
      </div>

      {/* Inbound Referrals Queue with State Machine Transitions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
              <Share2 className="w-5 h-5 text-purple-600" />
              Inbound Hospital Referrals & Triage Workflow
            </h3>
            <p className="text-xs text-slate-500">
              Sequential continuum of care: CREATED → ACCEPTED → PATIENT ARRIVED → COMPLETED
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading inbound referrals...</div>
        ) : referrals.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">No referrals currently routed to this hospital.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {referrals.map((ref) => (
              <div
                key={ref._id || ref.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                      {ref.referralToken || 'TOKEN-PENDING'}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                        ref.priority === 'EMERGENCY'
                          ? 'bg-red-100 text-red-800 animate-pulse'
                          : ref.priority === 'URGENT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ref.priority} Priority
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        ref.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ref.status === 'PATIENT ARRIVED'
                          ? 'bg-indigo-100 text-indigo-800'
                          : ref.status === 'ACCEPTED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Status: {ref.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">
                    {ref.patientId?.name || 'Patient'}
                    <span className="font-normal text-slate-500 text-xs ml-2">
                      ({ref.patientId?.gender}, {ref.patientId?.age} yrs, Phone: {ref.patientId?.phone})
                    </span>
                  </h4>

                  <p className="text-xs text-slate-600">
                    <strong>Department:</strong> {ref.department} • <strong>Reason:</strong> {ref.reason}
                  </p>
                  {ref.instructions && (
                    <p className="text-xs text-slate-500 italic bg-white p-1.5 rounded border border-slate-100">
                      Doctor instructions: "{ref.instructions}"
                    </p>
                  )}
                </div>

                {/* Status Advancement Controls according to State Machine */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {ref.status === 'CREATED' && (
                    <button
                      type="button"
                      disabled={statusUpdating === ref._id}
                      onClick={() => handleUpdateStatus(ref._id, 'ACCEPTED')}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1"
                    >
                      Accept Referral
                    </button>
                  )}

                  {ref.status === 'ACCEPTED' && (
                    <button
                      type="button"
                      disabled={statusUpdating === ref._id}
                      onClick={() => handleUpdateStatus(ref._id, 'PATIENT ARRIVED')}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1"
                    >
                      Confirm Patient Arrival
                    </button>
                  )}

                  {ref.status === 'PATIENT ARRIVED' && (
                    <Link
                      to={`/hospital/treatment?referralId=${ref._id}&patientId=${ref.patientId?._id || ref.patientId?.id}`}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1"
                    >
                      Record Treatment & Discharge
                    </Link>
                  )}

                  {ref.status === 'COMPLETED' && (
                    <span className="px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hospital Stock Management Widget */}
      <FacilityStockWidget facilityName="District Hospital, Aundh, Pune" />
    </div>
  );
}
