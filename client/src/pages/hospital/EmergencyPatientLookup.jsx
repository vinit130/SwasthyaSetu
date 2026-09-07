import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon,
  ShieldAlert,
  Search,
  User,
  Heart,
  Phone,
  FileText,
  Bed,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { hospitalAPI } from '../../services/api';

export default function EmergencyPatientLookup() {
  const [identifier, setIdentifier] = useState('');
  const [reason, setReason] = useState('Acute trauma / unconscious patient arrived directly via 108 ambulance');
  const [attendingDoctor, setAttendingDoctor] = useState('Dr. Suresh Patil');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patient, setPatient] = useState(null);
  const [auditConfirmed, setAuditConfirmed] = useState(false);

  const handleBreakGlassSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter Patient Phone number or Patient ID.');
      return;
    }
    if (!reason.trim()) {
      setError('Mandatory Clinical Justification Reason is required for Break-Glass access.');
      return;
    }
    if (!attendingDoctor.trim()) {
      setError('Attending Doctor name is required.');
      return;
    }

    setLoading(true);
    setError('');
    setPatient(null);
    setAuditConfirmed(false);

    try {
      const res = await hospitalAPI.emergencyLookup({
        identifier: identifier.trim(),
        reason: reason.trim(),
        attendingDoctor: attendingDoctor.trim(),
        notes: notes.trim(),
      });

      if (res.data.success) {
        setPatient(res.data.data);
        setAuditConfirmed(true);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Patient '${identifier}' not found in the statewide healthcare registry.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Warning Banner */}
      <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 shadow-xs flex items-start gap-4">
        <div className="p-2.5 bg-red-100 text-red-700 rounded-xl shrink-0 mt-0.5">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-red-900 tracking-tight flex items-center gap-2">
            Emergency Break-Glass Direct Access Protocol
          </h2>
          <p className="text-xs text-red-700 mt-1 leading-relaxed">
            This privileged capability allows District Hospital clinicians to access statewide patient health records during critical trauma, unconscious patient arrivals, or direct 108 ambulance drop-offs without prior referral.
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-red-800 bg-red-100/70 px-2.5 py-1 rounded-lg border border-red-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            Mandatory Compliance Notice: All queries are permanently signed and logged to the state audit trail.
          </div>
        </div>
      </div>

      {/* Break Glass Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleBreakGlassSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient Identifier (10-Digit Mobile or Patient ID) *
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. 9876500001 or SS-2026-0001"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => setIdentifier('9876500001')}
                className="mt-1 text-[11px] text-purple-700 hover:underline font-medium"
              >
                Fill demo patient phone (9876500001)
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Attending Specialist / Medical Officer *
              </label>
              <input
                type="text"
                placeholder="Dr. Suresh Patil"
                value={attendingDoctor}
                onChange={(e) => setAttendingDoctor(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mandatory Clinical Justification Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white mb-2"
            >
              <option value="Acute trauma / unconscious patient arrived directly via 108 ambulance">
                Acute trauma / unconscious patient arrived directly via 108 ambulance
              </option>
              <option value="Severe respiratory distress / hypoxia requiring immediate ICU intubation">
                Severe respiratory distress / hypoxia requiring immediate ICU intubation
              </option>
              <option value="Obstetric emergency / active eclampsia without referral slip">
                Obstetric emergency / active eclampsia without referral slip
              </option>
              <option value="Patient lost referral token slip; urgent tertiary consultation required">
                Patient lost referral token slip; urgent tertiary consultation required
              </option>
              <option value="Suspected acute coronary syndrome / myocardial infarction">
                Suspected acute coronary syndrome / myocardial infarction
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Triage Notes & Arrival Circumstances
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Arrived in Emergency Ward at 20:15 via 108. SpO2 88%, BP 160/100."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 italic">
              Access will be recorded under your login identity
            </span>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              {loading ? 'Validating...' : 'Execute Break-Glass Access'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Patient Record Found */}
      {patient && (
        <div className="bg-white rounded-2xl border-2 border-emerald-300 shadow-lg overflow-hidden animate-fadeIn">
          <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm text-emerald-900">
                Break-Glass Access Approved & Logged to Compliance Trail
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700">AUDIT ID: #{Date.now().toString().slice(-6)}</span>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-black text-slate-900">{patient.name}</h3>
                <p className="text-xs text-slate-500">
                  ID: <strong className="text-slate-800">{patient.patientId}</strong> • {patient.gender}, {patient.age} yrs • Blood Group: <strong className="text-red-700">{patient.bloodGroup || 'Unknown'}</strong>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Address: {patient.village}, {patient.district}, {patient.state} • Mobile: <strong>+91 {patient.phone}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/hospital/beds?patientId=${patient._id || patient.id}`}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 flex items-center gap-1.5"
                >
                  <Bed className="w-3.5 h-3.5 text-blue-600" />
                  Assign Bed
                </Link>
                <Link
                  to={`/hospital/treatment?patientId=${patient._id || patient.id}&emergency=true`}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  Admit & Treat Now
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Medical Alerts & Background */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200">
                <span className="text-red-900 font-bold block mb-1">Known Allergies:</span>
                {patient.allergies?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies.map((a, idx) => (
                      <span key={idx} className="bg-white text-red-700 px-2 py-0.5 rounded border border-red-200 font-medium">
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500">No known drug allergies reported</span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="text-amber-900 font-bold block mb-1">Existing Chronic Conditions:</span>
                {patient.existingConditions?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {patient.existingConditions.map((c, idx) => (
                      <span key={idx} className="bg-white text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500">No chronic medical conditions on record</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
