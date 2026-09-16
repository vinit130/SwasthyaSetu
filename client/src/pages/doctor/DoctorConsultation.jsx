import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Stethoscope,
  Activity,
  User,
  CheckCircle2,
  CalendarCheck,
  AlertCircle,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Plus,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  Check,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { patientAPI, consultationAPI, referralAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import VitalsDisplay from '../../components/patient/VitalsDisplay';
import MedicalDocumentsCard from '../../components/documents/MedicalDocumentsCard';
import DocumentUploadModal from '../../components/documents/DocumentUploadModal';

const ESSENTIAL_OBSERVATIONS = [
  'Normal chest sounds',
  'Bilateral wheezing',
  'Throat congestion',
  'Febrile (warm to touch)',
  'Abdomen soft & non-tender',
  'Mild dehydration',
];

const ESSENTIAL_ASSESSMENTS = [
  'Viral Upper Respiratory Infection',
  'Acute Bronchitis',
  'Acute Gastroenteritis',
  'Essential Hypertension',
  'Type 2 Diabetes Review',
  'Routine Health Checkup',
];

const ESSENTIAL_PRESCRIPTIONS = [
  'Tab Paracetamol 500mg (1-0-1 after meals x 3 days)',
  'Tab Cetirizine 10mg (0-0-1 at night x 5 days)',
  'Tab Amoxicillin 500mg (1-1-1 after meals x 5 days)',
  'ORS sachet in 1L boiled water as needed',
  'Tab Pantoprazole 40mg (1-0-0 empty stomach x 5 days)',
];

const COMMON_ADVICE = [
  'Adequate oral hydration & rest for 3-5 days',
  'Warm salt water gargle TDS',
  'Low salt, low oil, bland diet',
  'Return immediately if fever > 102°F or breathlessness occurs',
];

export default function DoctorConsultation() {
  const [searchParams] = useSearchParams();
  const urlPatientId = searchParams.get('patientId');
  // Store patientId in persistent React state so query param fluctuations never lose it
  const [patientId] = useState(() => urlPatientId || '');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [patientData, setPatientData] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  // Essential Clinical State
  const [observations, setObservations] = useState('');
  const [riskLevel, setRiskLevel] = useState('GREEN');
  const [assessment, setAssessment] = useState('');
  const [treatmentInstructions, setTreatmentInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpQuickChoice, setFollowUpQuickChoice] = useState(null);

  // Progressive Disclosure: "Add More" State
  const [showExtended, setShowExtended] = useState(false);
  const [differentialDiagnosis, setDifferentialDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [extendedObservations, setExtendedObservations] = useState('');
  const [enableReferral, setEnableReferral] = useState(false);
  const [referralFacility, setReferralFacility] = useState('');
  const [referralUrgency, setReferralUrgency] = useState('ROUTINE');
  const [referralReason, setReferralReason] = useState('');

  // Frontline screening toggle
  const [showFrontlineVitals, setShowFrontlineVitals] = useState(false);

  // Document Upload Modal state
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [docsRefreshKey, setDocsRefreshKey] = useState(0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!patientId) {
      navigate('/doctor/dashboard');
      return;
    }

    const fetchPatient = async () => {
      try {
        setLoadingPatient(true);
        const res = await patientAPI.getPatientById(patientId);
        if (res.data.success) {
          const data = res.data.data;
          setPatientData(data);
          if (data.currentRisk) {
            setRiskLevel(data.currentRisk);
          } else if (data.latestVisit?.riskLevel) {
            setRiskLevel(data.latestVisit.riskLevel);
          }
        }
      } catch (err) {
        console.error('Failed to load patient for consultation:', err);
      } finally {
        setLoadingPatient(false);
      }
    };

    fetchPatient();
  }, [patientId, navigate]);

  const appendPhrase = (setter, currentVal, phrase) => {
    if (!currentVal.trim()) {
      setter(phrase);
    } else if (!currentVal.includes(phrase)) {
      setter(`${currentVal.trim()}, ${phrase}`);
    }
  };

  const appendLine = (setter, currentVal, line) => {
    if (!currentVal.trim()) {
      setter(line);
    } else if (!currentVal.includes(line)) {
      setter(`${currentVal.trim()}\n• ${line}`);
    }
  };

  const setFollowUpDays = (days) => {
    setFollowUpQuickChoice(days);
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowUpDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!observations.trim() || !assessment.trim()) {
      setError('Please provide both clinical observations and doctor assessment.');
      return;
    }

    try {
      setSaving(true);

      // 1. Build composite clinical notes if extended fields were filled
      let finalAssessment = assessment.trim();
      if (differentialDiagnosis.trim()) {
        finalAssessment += `\n[Differential Diagnosis: ${differentialDiagnosis.trim()}]`;
      }

      let finalObservations = observations.trim();
      if (extendedObservations.trim()) {
        finalObservations += `\n[Extended Findings: ${extendedObservations.trim()}]`;
      }

      // 2. Save consultation record
      const res = await consultationAPI.createConsultation(patientId, {
        visitId: patientData?.latestVisit?._id,
        observations: finalObservations,
        assessment: finalAssessment,
        advice: advice.trim(),
        treatmentInstructions: treatmentInstructions.trim(),
        followUpDate: followUpDate || undefined,
      });

      // 3. Confirm Authoritative Risk Level if changed
      try {
        await patientAPI.assessDoctorRisk(patientId, {
          doctorRiskLevel: riskLevel,
          rationale: finalAssessment,
        });
      } catch (riskErr) {
        console.warn('Risk assessment update non-fatal error:', riskErr);
      }

      // 4. Create hospital referral if doctor toggled and specified
      if (enableReferral && (referralFacility.trim() || referralReason.trim())) {
        try {
          await referralAPI.createReferral({
            patientId,
            toFacility: referralFacility.trim() || 'District Civil Hospital',
            urgency: referralUrgency,
            reason: referralReason.trim() || finalAssessment,
            clinicalSummary: `${finalAssessment}. Direct physician referral from consultation.`,
          });
        } catch (refErr) {
          console.warn('Referral creation non-fatal error:', refErr);
        }
      }

      if (res.data.success) {
        navigate(`/doctor/patients/${patientId}`);
      }
    } catch (err) {
      console.error('Failed to save consultation:', err);
      setError(err.response?.data?.message || 'Failed to save consultation record. Please review fields and retry.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingPatient) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-sm text-slate-500">
        Loading patient clinical chart...
      </div>
    );
  }

  const patient = patientData?.patient;
  const latestVisit = patientData?.latestVisit;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to={`/doctor/patients/${patientId}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-teal-700 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Chart</span>
        </Link>

        {/* Quick Upload Action */}
        <button
          type="button"
          onClick={() => setShowDocUploadModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
          <span>+ Upload Document / Scan</span>
        </button>
      </div>

      {/* Screen Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          {t('consultationTitle') || 'Physician Consultation & Directives'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Essential-first clinical assessment, authoritative triage confirmation, and prescription orders.
        </p>
      </div>

      {/* Patient Summary Bar (Read-only) */}
      <Card className="p-4 sm:p-5 bg-gradient-to-r from-teal-50/50 via-white to-slate-50 border-teal-100/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              {patient?.name?.[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900 text-base">{patient?.name}</span>
                <span className="font-mono text-xs text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-semibold">
                  {patient?.patientId}
                </span>
                <Badge type="risk" value={patientData?.currentRisk || 'GREEN'} size="sm" />
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {patient?.gender}, {patient?.age} yrs • Blood Group: <strong className="text-slate-800">{patient?.bloodGroup || 'Unknown'}</strong> • Village: {patient?.village}
              </p>
            </div>
          </div>

          {patient?.allergies?.length > 0 && (
            <div className="text-xs text-red-800 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl font-medium shrink-0">
              <strong className="text-red-900">Allergies:</strong> {patient.allergies.join(', ')}
            </div>
          )}
        </div>

        {/* Expandable Frontline Vitals Preview */}
        {latestVisit && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowFrontlineVitals((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{showFrontlineVitals ? 'Hide Frontline Screening Data' : 'View Frontline Reported Screening & Vitals'}</span>
              {showFrontlineVitals ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showFrontlineVitals && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Frontline Worker Screening:</span>
                  <Badge type="risk" value={latestVisit.riskLevel} size="sm" />
                </div>
                {latestVisit.symptoms?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {latestVisit.symptoms.map((s, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 font-medium text-slate-800">
                        {s.name} ({s.severity || 'Mild'})
                      </span>
                    ))}
                  </div>
                )}
                {latestVisit.vitals && <VitalsDisplay vitals={latestVisit.vitals} />}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Clinical Responsibility Banner */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
        <span>
          <strong>Physician Directive:</strong> Enter verified physical findings and clinical plan. SwasthyaSetu does not generate automated artificial diagnoses.
        </span>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PRIMARY CONSULTATION FORM (Essential First)                             */}
      {/* ========================================================================= */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ESSENTIAL SECTION: Clinical Assessment */}
        <Card className="p-5 space-y-5 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>1. Essential Clinical Assessment</span>
            </h2>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
              Mandatory Directives
            </span>
          </div>

          {/* Observations */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Clinical Observations & Examination Findings *
              </label>
              <span className="text-[11px] text-slate-400">Click quick chips to auto-fill</span>
            </div>

            {/* Quick Observation Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {ESSENTIAL_OBSERVATIONS.map((obs) => (
                <button
                  key={obs}
                  type="button"
                  onClick={() => appendPhrase(setObservations, observations, obs)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  + {obs}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="e.g. Bilateral clear breath sounds, no pedal edema, throat congested, vitals stable..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              required
            />
          </div>

          {/* Authoritative Confirmed Risk Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Authoritative Risk Level (Doctor Confirmed Triage) *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Green / Low */}
              <button
                type="button"
                onClick={() => setRiskLevel('GREEN')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  riskLevel === 'GREEN'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>LOW RISK (GREEN)</span>
                  </span>
                  {riskLevel === 'GREEN' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[10px] text-emerald-700 mt-1">Stable outpatient care</p>
              </button>

              {/* Yellow / Moderate */}
              <button
                type="button"
                onClick={() => setRiskLevel('YELLOW')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  riskLevel === 'YELLOW'
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>MODERATE (YELLOW)</span>
                  </span>
                  {riskLevel === 'YELLOW' && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-[10px] text-amber-700 mt-1">Active follow-up required</p>
              </button>

              {/* Red / High */}
              <button
                type="button"
                onClick={() => setRiskLevel('RED')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  riskLevel === 'RED'
                    ? 'bg-red-50 border-red-500 ring-2 ring-red-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span>HIGH RISK (RED)</span>
                  </span>
                  {riskLevel === 'RED' && <Check className="w-4 h-4 text-red-600" />}
                </div>
                <p className="text-[10px] text-red-700 mt-1">Urgent hospital intervention</p>
              </button>
            </div>
          </div>

          {/* Primary Assessment / Diagnosis */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Primary Assessment & Diagnosis *
              </label>
              <span className="text-[11px] text-slate-400">Click to choose diagnosis</span>
            </div>

            {/* Quick Assessment Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {ESSENTIAL_ASSESSMENTS.map((asmt) => (
                <button
                  key={asmt}
                  type="button"
                  onClick={() => appendPhrase(setAssessment, assessment, asmt)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                >
                  + {asmt}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="e.g. Viral Upper Respiratory Infection with mild reactive bronchospasm..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              required
            />
          </div>
        </Card>

        {/* ESSENTIAL SECTION: Treatment & Follow-up */}
        <Card className="p-5 space-y-5 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-teal-600" />
              <span>2. Essential Treatment & Plan</span>
            </h2>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
              Prescription & Review
            </span>
          </div>

          {/* Treatment Instructions (Prescription) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Prescription Directives & Medication Schedule
              </label>
              <span className="text-[11px] text-slate-400">Click standard formulations</span>
            </div>

            {/* Quick Prescription Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {ESSENTIAL_PRESCRIPTIONS.map((rx) => (
                <button
                  key={rx}
                  type="button"
                  onClick={() => appendLine(setTreatmentInstructions, treatmentInstructions, rx)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                >
                  + {rx}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={treatmentInstructions}
              onChange={(e) => setTreatmentInstructions(e.target.value)}
              placeholder="e.g. Tab Paracetamol 500mg 1-0-1 x 3 days after food..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Follow-up Days Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Recommended Follow-up Timeline
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {[3, 5, 7, 14].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setFollowUpDays(days)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    followUpQuickChoice === days
                      ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50 hover:border-teal-300'
                  }`}
                >
                  +{days} Days
                </button>
              ))}
              {followUpDate && (
                <button
                  type="button"
                  onClick={() => {
                    setFollowUpDate('');
                    setFollowUpQuickChoice(null);
                  }}
                  className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 cursor-pointer"
                >
                  Clear Date
                </button>
              )}
            </div>

            <div className="max-w-xs">
              <Input
                type="date"
                value={followUpDate}
                onChange={(e) => {
                  setFollowUpDate(e.target.value);
                  setFollowUpQuickChoice(null);
                }}
                helperText="Auto-notifies frontline ASHA worker on due date."
              />
            </div>
          </div>
        </Card>

        {/* ===================================================================== */}
        {/* PROGRESSIVE DISCLOSURE: "[ + Add More Details ]"                      */}
        {/* ===================================================================== */}
        <div className="border border-dashed border-teal-300 rounded-2xl p-4 bg-teal-50/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Additional Clinical Directives & Referral
              </h3>
              <p className="text-[11px] text-slate-500">
                Differential diagnosis, lifestyle advice, and hospital transfer directives.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowExtended((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-800 bg-white hover:bg-teal-50 border border-teal-300 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              {showExtended ? (
                <>
                  <ChevronUp className="w-4 h-4 text-teal-600" />
                  <span>− Hide Additional Fields</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-teal-600" />
                  <span>+ Add More</span>
                </>
              )}
            </button>
          </div>

          {showExtended && (
            <div className="mt-4 pt-4 border-t border-teal-200/60 space-y-4 animate-fadeIn">
              {/* Differential Diagnosis */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Differential / Secondary Diagnosis (Optional)
                </label>
                <input
                  type="text"
                  value={differentialDiagnosis}
                  onChange={(e) => setDifferentialDiagnosis(e.target.value)}
                  placeholder="e.g. Rule out bacterial superinfection, allergic rhinitis"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 bg-white text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Lifestyle & Home Care Advice */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Clinical Lifestyle & Home Care Advice
                  </label>
                  <span className="text-[11px] text-slate-400">Click standard directives</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COMMON_ADVICE.map((adv) => (
                    <button
                      key={adv}
                      type="button"
                      onClick={() => appendLine(setAdvice, advice, adv)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
                    >
                      + {adv.slice(0, 32)}...
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  placeholder="e.g. High oral fluids, steam inhalation twice daily, return if breathlessness occurs..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Extended Observations */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Extended Physical Findings / Systemic Examination
                </label>
                <textarea
                  rows={2}
                  value={extendedObservations}
                  onChange={(e) => setExtendedObservations(e.target.value)}
                  placeholder="e.g. CVS: S1 S2 heard; CNS: Conscious & oriented; P/A: Soft, no organomegaly..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Hospital Referral Option */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableReferral"
                    checked={enableReferral}
                    onChange={(e) => setEnableReferral(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                  />
                  <label htmlFor="enableReferral" className="text-xs font-bold text-slate-900 cursor-pointer">
                    Initiate Hospital / Specialist Referral
                  </label>
                </div>

                {enableReferral && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-fadeIn">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Referral Facility
                      </label>
                      <input
                        type="text"
                        value={referralFacility}
                        onChange={(e) => setReferralFacility(e.target.value)}
                        placeholder="e.g. District Civil Hospital Nashik"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Referral Urgency
                      </label>
                      <select
                        value={referralUrgency}
                        onChange={(e) => setReferralUrgency(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        <option value="ROUTINE">Routine Specialist Review</option>
                        <option value="URGENT">Urgent (Within 24-48 Hours)</option>
                        <option value="EMERGENCY">Emergency (Immediate Transfer)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Referral Indication / Clinical Reason
                      </label>
                      <input
                        type="text"
                        value={referralReason}
                        onChange={(e) => setReferralReason(e.target.value)}
                        placeholder="e.g. Persistent fever and wheezing unresponsive to initial therapy; evaluate for secondary pneumonia"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/doctor/patients/${patientId}`)}
            disabled={saving}
          >
            {t('cancel') || 'Cancel'}
          </Button>

          <Button
            type="submit"
            loading={saving}
            size="lg"
            className="shadow-md bg-teal-600 hover:bg-teal-700 text-white font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            <span>Save & Issue Consultation</span>
          </Button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* 2. MEDICAL DOCUMENTS SECTION (COMPLETELY OUTSIDE FORM TO PREVENT SUBMIT)   */}
      {/* ========================================================================= */}
      <div className="pt-2">
        <MedicalDocumentsCard
          key={`doc-card-${docsRefreshKey}`}
          patientId={patientId}
          patientName={patient?.name}
          onDocumentAdded={() => setDocsRefreshKey((k) => k + 1)}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. ROOT UPLOAD MODAL (ALSO COMPLETELY OUTSIDE FORM)                       */}
      {/* ========================================================================= */}
      {showDocUploadModal && (
        <DocumentUploadModal
          isOpen={showDocUploadModal}
          onClose={() => setShowDocUploadModal(false)}
          patientId={patientId}
          patientName={patient?.name}
          onUploaded={() => setDocsRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
