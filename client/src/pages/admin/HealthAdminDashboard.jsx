import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Hospital,
  Bed,
  AlertTriangle,
  Activity,
  CheckCircle,
  FileText,
  Building,
  TrendingUp,
  MapPin,
  RefreshCw,
  Package,
} from 'lucide-react';
import { healthAdminAPI } from '../../services/api';
import NearbyFacilities from '../../components/common/NearbyFacilities';

export default function HealthAdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [surveillance, setSurveillance] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ovRes, survRes] = await Promise.all([
        healthAdminAPI.getOverview(),
        healthAdminAPI.getSurveillance(),
      ]);
      if (ovRes.data.success) setOverview(ovRes.data.data);
      if (survRes.data.success) setSurveillance(survRes.data.data);
    } catch (err) {
      console.error('Failed to load health admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          Loading Maharashtra Public Health Directorate Surveillance...
        </div>
      </div>
    );
  }

  const d = overview || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Administrative Role Guard Disclaimer */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Maharashtra State Health Department • DHS Oversight
          </div>
          <h1 className="text-2xl font-black tracking-tight">Public Health Surveillance & Resource Coordination</h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time multi-district epidemiological monitoring, bed availability, and referral logistics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/facilities"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20 flex items-center gap-1.5"
          >
            <Building className="w-3.5 h-3.5" />
            Facility Directory
          </Link>
          <Link
            to="/admin/audit-logs"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Audit Trail
          </Link>
        </div>
      </div>

      {/* Statewide Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Patients</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">{d.totalPatients || 0}</p>
          <span className="text-[10px] text-slate-400">Statewide Registered</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200/90 shadow-2xs bg-red-50/20">
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-xs font-semibold">High Risk (RED)</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-700">{d.highRiskCount || 0}</p>
          <span className="text-[10px] text-red-500 font-medium">Critical triage flagged</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/90 shadow-2xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-semibold">Moderate Risk</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-700">{d.mediumRiskCount || 0}</p>
          <span className="text-[10px] text-amber-600">Active monitoring</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-xs font-semibold">Bed Occupancy</span>
            <Bed className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-700">{d.bedOccupancyRate || 0}%</p>
          <span className="text-[10px] text-slate-500">
            {d.occupiedBeds || 0} / {d.totalBeds || 0} occupied
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-purple-600 mb-1">
            <span className="text-xs font-semibold">Active Referrals</span>
            <Hospital className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-700">{d.activeReferrals || 0}</p>
          <span className="text-[10px] text-purple-600">In hospital transit</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-orange-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-orange-600 mb-1">
            <span className="text-xs font-semibold">Stock Alerts</span>
            <Package className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-black text-orange-700">{d.criticalShortages || 0}</p>
          <span className="text-[10px] text-orange-600">Items low / out of stock</span>
        </div>
      </div>

      {/* Disease Clusters & Outbreak Surveillance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Active Disease Clusters & Syndromic Surveillance
              </h3>
              <p className="text-xs text-slate-500">
                Automated clustering from ASHA frontline screening and OPD encounters
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-200 animate-pulse">
              1 Active Cluster Alert
            </span>
          </div>

          <div className="space-y-3">
            {surveillance?.diseaseClusters?.map((c) => (
              <div
                key={c.clusterId}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        c.alertLevel === 'WARNING'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {c.alertLevel}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{c.clusterName}</h4>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{c.district}</strong> • Sub-District: {c.subDistrict} • Villages: {c.affectedVillages?.join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Reported Cases</span>
                    <span className="text-lg font-black text-indigo-700">{c.caseCount}</span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700">
                    Status: {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* District Risk Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Pilot Districts Breakdown
            </h3>
            <p className="text-xs text-slate-500 mb-4">Patient screening risk levels by district</p>

            <div className="space-y-3">
              {d.districts?.map((dist) => (
                <div key={dist.district} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900">{dist.district} District</span>
                    <span className="text-xs font-bold text-slate-700">{dist.total} screened</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="bg-red-50 text-red-700 p-1.5 rounded-lg border border-red-100">
                      <span className="text-[10px] block text-red-500">RED</span>
                      <strong>{dist.highRisk}</strong>
                    </div>
                    <div className="bg-amber-50 text-amber-700 p-1.5 rounded-lg border border-amber-100">
                      <span className="text-[10px] block text-amber-500">YELLOW</span>
                      <strong>{dist.mediumRisk}</strong>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 p-1.5 rounded-lg border border-emerald-100">
                      <span className="text-[10px] block text-emerald-500">GREEN</span>
                      <strong>{dist.lowRisk}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500 text-center">
            Integrated with Maharashtra State Health Systems Resource Centre (SHSRC)
          </div>
        </div>
      </div>

      {/* Statewide Curated Facility Bed Status */}
      <NearbyFacilities
        currentDistrict="Pune"
        title="Public Healthcare Facilities & Bed Capacity Overview"
      />
    </div>
  );
}
