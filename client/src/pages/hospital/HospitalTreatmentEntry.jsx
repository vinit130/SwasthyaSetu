import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileCheck,
  Stethoscope,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Hospital,
} from 'lucide-react';
import { hospitalAPI, patientAPI } from '../../services/api';

export default function HospitalTreatmentEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryPatientId = searchParams.get('patientId') || '';
  const queryReferralId = searchParams.get('referralId') || '';
  const isEmergency = searchParams.get('emergency') === 'true';

  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState(queryPatientId);
  const [facilityName, setFacilityName] = useState('District Hospital, Aundh, Pune');
  const [encounterType, setEncounterType] = useState(isEmergency ? 'EMERGENCY' : 'INPATIENT');
  const [department, setDepartment] = useState('General Medicine');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentSummary, setTreatmentSummary] = useState('');
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState([
    { medicineName: 'Inj Ceftriaxone 1g', dosage: '1g IV BD', duration: '5 days', instructions: 'After food' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await patientAPI.getPatients({ limit: 50 });
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load patients for treatment entry:', err);
    }
  };

  const handleAddMed = () => {
    setPrescriptions((prev) => [
      ...prev,
      { medicineName: '', dosage: '', duration: '', instructions: '' },
    ]);
  };

  const handleRemoveMed = (index) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedChange = (index, field, val) => {
    setPrescriptions((prev) =>
      prev.map((med, i) => (i === index ? { ...med, [field]: val } : med))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      setError('Please select a patient.');
      return;
    }
    if (!diagnosis.trim() || !treatmentSummary.trim()) {
      setError('Diagnosis and Treatment Summary are mandatory.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        patientId,
        referralId: queryReferralId || null,
        facilityName,
        encounterType,
        department,
        chiefComplaint: chiefComplaint.trim(),
        diagnosis: diagnosis.trim(),
        treatmentSummary: treatmentSummary.trim(),
        prescriptions: prescriptions.filter((p) => p.medicineName.trim()),
        dischargeSummary: dischargeNotes ? { instructions: dischargeNotes.trim() } : null,
        isEmergencyBreakGlass: isEmergency,
      };

      const res = await hospitalAPI.createEncounter(payload);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/hospital/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record hospital encounter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-purple-600" />
            Hospital Clinical Treatment & Discharge Entry
          </h1>
          <p className="text-xs text-slate-500">
            Record specialized hospital interventions, intravenous therapy, surgery, and discharge instructions
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-sm">Hospital Encounter Successfully Recorded!</p>
            <p className="text-xs text-emerald-700">Patient care continuum updated. Redirecting to dashboard...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Patient Selection & Hospital Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Inpatient / Patient *</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              required
            >
              <option value="">Choose Patient...</option>
              {patients.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name} ({p.patientId} - {p.village})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Encounter Type</label>
            <select
              value={encounterType}
              onChange={(e) => setEncounterType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="INPATIENT">Inpatient Admission (Ward/Bed)</option>
              <option value="OUTPATIENT">Specialist Outpatient (OPD)</option>
              <option value="EMERGENCY">Emergency Triage / Trauma</option>
              <option value="ICU">Intensive Care Unit (ICU)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Clinical Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="General Medicine">General Medicine</option>
              <option value="Pulmonology">Pulmonology & Chest Medicine</option>
              <option value="Obstetrics & Gynaecology">Obstetrics & Gynaecology</option>
              <option value="General Surgery">General Surgery</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
            </select>
          </div>
        </div>

        {/* Clinical Findings */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Chief Complaint & Onset</label>
            <input
              type="text"
              placeholder="e.g. Severe shortness of breath with productive cough for 4 days"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Primary Clinical Diagnosis *</label>
            <input
              type="text"
              placeholder="e.g. Acute Severe Bronchopneumonia with Type-1 Respiratory Failure"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Hospital Treatment & Procedures Performed *</label>
            <textarea
              rows={3}
              placeholder="Detailed treatment summary (e.g. IV Fluid resuscitation, IV Ceftriaxone, continuous SpO2 monitoring, supplemental oxygen via nasal cannula)..."
              value={treatmentSummary}
              onChange={(e) => setTreatmentSummary(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
        </div>

        {/* Medications Prescribed */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-sm">Medications & Inpatient Orders</h4>
            <button
              type="button"
              onClick={handleAddMed}
              className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Medication
            </button>
          </div>

          <div className="space-y-2">
            {prescriptions.map((med, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Medicine Name & Strength"
                  value={med.medicineName}
                  onChange={(e) => handleMedChange(idx, 'medicineName', e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g. 500mg BD)"
                  value={med.dosage}
                  onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. 5 days)"
                  value={med.duration}
                  onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Instructions (e.g. After food)"
                    value={med.instructions}
                    onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  {prescriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMed(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discharge / Followup Instructions */}
        <div className="text-xs">
          <label className="block font-bold text-slate-700 mb-1">
            Discharge Summary & Post-Hospital Care Instructions
          </label>
          <textarea
            rows={2}
            placeholder="Instructions for patient and ASHA frontline worker for village follow-up..."
            value={dischargeNotes}
            onChange={(e) => setDischargeNotes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || success}
            className="px-6 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 disabled:opacity-50 rounded-xl shadow-sm transition-all"
          >
            {loading ? 'Submitting...' : 'Save Encounter & Complete Care Step'}
          </button>
        </div>
      </form>
    </div>
  );
}
