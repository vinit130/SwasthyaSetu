import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  CheckCircle,
  AlertCircle,
  User,
  Activity,
  Bed,
  Calendar,
  Share2,
  Stethoscope,
  ArrowRight,
  Printer,
} from 'lucide-react';
import { hospitalAPI, referralAPI } from '../../services/api';

export default function ReferralTokenScanner() {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [referral, setReferral] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) {
      setError('Please enter a referral token.');
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage('');
    try {
      const clean = tokenInput.trim().toUpperCase();
      const res = await hospitalAPI.getReferralByToken(clean);
      if (res.data.success) {
        setReferral(res.data.data);
      }
    } catch (err) {
      setReferral(null);
      setError(
        err.response?.data?.message ||
          `Referral token '${tokenInput}' was not found. Please verify the slip or try Emergency Break-Glass lookup.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!referral) return;
    try {
      const res = await referralAPI.updateStatus(referral._id, { status: newStatus });
      if (res.data.success) {
        setReferral(res.data.data);
        setStatusMessage(`Referral status advanced to ${newStatus}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Status transition failed.');
    }
  };

  const p = referral?.patientId || {};
  const doc = referral?.doctorId || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Search className="w-6 h-6 text-purple-600" />
          Referral Token Slip Verification
        </h1>
        <p className="text-xs text-slate-500">
          Scan or enter patient's unique referral slip token (e.g. SS-REF-2026-8X4K29) for instant verification
        </p>
      </div>

      {/* Token Search Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Enter token: SS-REF-2026-XXXXXX"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase tracking-wider"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-purple-700 hover:bg-purple-800 disabled:opacity-50 rounded-xl shadow-sm transition-all"
            >
              {loading ? 'Verifying...' : 'Validate Slip'}
            </button>

            {/* Quick Demo Pill */}
            <button
              type="button"
              onClick={() => {
                setTokenInput('SS-REF-2026-8X4K29');
              }}
              className="px-3 py-2.5 text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 whitespace-nowrap font-medium"
            >
              Paste Demo
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl flex items-center justify-between gap-2 border border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
            <Link
              to="/hospital/emergency"
              className="text-xs font-bold text-red-800 underline hover:no-underline whitespace-nowrap"
            >
              Emergency Direct Lookup →
            </Link>
          </div>
        )}

        {statusMessage && (
          <div className="mt-4 p-3.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Verified Referral Details Card */}
      {referral && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-5 border-b border-slate-200 bg-purple-50/40 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-black px-2.5 py-1 rounded-lg bg-purple-200 text-purple-900 border border-purple-300">
                  {referral.referralToken}
                </span>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Slip Verified Authentic
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Created on {new Date(referral.createdAt).toLocaleString('en-IN')} by Dr. {doc.name || 'Referring Physician'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg border border-slate-200"
                title="Print Slip"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Patient Demographic Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
                <span className="font-bold text-sm text-slate-900">{p.name}</span>
                <span className="text-slate-500 block">ID: {p.patientId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Demographics</span>
                <span className="font-semibold text-slate-800">{p.gender}, {p.age} years</span>
                <span className="text-slate-500 block">Blood: {p.bloodGroup || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span>
                <span className="font-semibold text-slate-800 font-mono">+91 {p.phone}</span>
                <span className="text-slate-500 block">{p.village}, {p.district}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Destination Facility</span>
                <span className="font-bold text-purple-900">{referral.facility}</span>
                <span className="text-purple-700 block font-semibold">{referral.department}</span>
              </div>
            </div>

            {/* Clinical Referral Details */}
            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">Clinical Reason for Referral:</h4>
                <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  {referral.reason}
                </p>
              </div>

              {referral.instructions && (
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Referring Doctor Instructions:</h4>
                  <p className="p-3 bg-purple-50/50 rounded-lg border border-purple-200 text-purple-900 italic">
                    "{referral.instructions}"
                  </p>
                </div>
              )}
            </div>

            {/* Referral State Machine Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Current Status:</span>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-900">
                  {referral.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {referral.status === 'CREATED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('ACCEPTED')}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                  >
                    Accept Inbound Referral
                  </button>
                )}

                {referral.status === 'ACCEPTED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('PATIENT ARRIVED')}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                  >
                    Confirm Patient Arrival
                  </button>
                )}

                {referral.status === 'PATIENT ARRIVED' && (
                  <>
                    <Link
                      to={`/hospital/beds?patientId=${p._id || p.id}`}
                      className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 flex items-center gap-1.5"
                    >
                      <Bed className="w-3.5 h-3.5 text-blue-600" />
                      Assign Ward Bed
                    </Link>
                    <Link
                      to={`/hospital/treatment?referralId=${referral._id}&patientId=${p._id || p.id}`}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      Record Treatment & Discharge
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </>
                )}

                {referral.status === 'COMPLETED' && (
                  <span className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Treatment Completed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
