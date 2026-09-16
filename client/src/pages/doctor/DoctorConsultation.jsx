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
  Paperclip,
  UploadCloud,
} from 'lucide-react';
import { patientAPI, consultationAPI, documentAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import VitalsDisplay from '../../components/patient/VitalsDisplay';
import MedicalDocumentsCard from '../../components/documents/MedicalDocumentsCard';
import DocumentUploadModal from '../../components/documents/DocumentUploadModal';

const COMMON_OBSERVATIONS = [
  'Normal chest sounds',
  'Bilateral wheezing',
  'Throat congestion',
  'Pallor present',
  'Pedal edema',
  'Febrile (warm to touch)',
  'Abdomen soft & non-tender',
  'Clear breath sounds',
  'Mild dehydration',
];

const COMMON_ASSESSMENTS = [
  'Acute Bronchitis',
  'Viral Upper Respiratory Infection',
  'Acute Gastroenteritis',
  'Essential Hypertension',
  'Type 2 Diabetes Review',
  'Microcytic Anemia',
  'Bronchial Asthma Flare',
  'Routine Health Checkup',
];

const COMMON_ADVICE = [
  'Adequate oral hydration & rest for 3-5 days',
  'Warm salt water gargle TDS',
  'Low salt, low oil, bland diet',
  'Avoid strenuous physical exertion and dust exposure',
  'Return immediately if fever > 102°F or severe breathlessness occurs',
];

const COMMON_PRESCRIPTIONS = [
  'Tab Paracetamol 500mg (1-0-1 after meals x 3 days)',
  'Tab Cetirizine 10mg (0-0-1 at night x 5 days)',
  'Tab Amoxicillin 500mg (1-1-1 after meals x 5 days)',
  'ORS sachet dissolved in 1L boiled water as needed',
  'Syrup Cough 5ml TDS x 5 days',
  'Tab Pantoprazole 40mg (1-0-0 empty stomach x 5 days)',
];

export default function DoctorConsultation() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [patientData, setPatientData] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  // Consultation fields
  const [observations, setObservations] = useState('');
  const [assessment, setAssessment] = useState('');
  const [advice, setAdvice] = useState('');
  const [treatmentInstructions, setTreatmentInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Document Upload Modal state
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [consultationDocsCount, setConsultationDocsCount] = useState(0);

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
          setPatientData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load patient for consultation:', err);
      } finally {
        setLoadingPatient(false);
      }
    };

    fetchPatient();
  }, [patientId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!observations.trim() || !assessment.trim()) {
      setError('Please provide both clinical observations and doctor assessment.');
      return;
    }

    try {
      setSaving(true);
      const res = await consultationAPI.createConsultation(patientId, {
        visitId: patientData?.latestVisit?._id,
        observations,
        assessment,
        advice,
        treatmentInstructions,
        followUpDate: followUpDate || undefined,
      });

      if (res.data.success) {
        navigate(`/doctor/patients/${patientId}`);
      }
    } catch (err) {
      console.error('Failed to save consultation:', err);
      setError(err.response?.data?.message || 'Failed to save consultation record.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingPatient) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <p className="text-sm text-slate-500">Loading patient clinical chart...</p>
      </div>
    );
  }

  const patient = patientData?.patient;
  const latestVisit = patientData?.latestVisit;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to={`/doctor/patients/${patientId}`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Patient Chart</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('consultationTitle')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Direct physician examination, clinical impression, prescription directives, and investigation uploads.
          </p>
        </div>

        <Button
          type="button"
          size="md"
          variant="outline"
          onClick={() => setShowDocUploadModal(true)}
          className="border-teal-300 text-teal-700 hover:bg-teal-50 shrink-0"
        >
          <UploadCloud className="w-4 h-4 mr-1.5 text-teal-600" />
          <span>Attach Investigation / Prescription</span>
        </Button>
      </div>

      {/* Patient Summary Bar */}
      <Card className="p-5 bg-indigo-50/40 border-indigo-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">{patient?.name}</span>
              <span className="font-mono text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                {patient?.patientId}
              </span>
              <Badge type="risk" value={patientData?.currentRisk || 'GREEN'} size="sm" />
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {patient?.age} yrs • {patient?.gender} • Blood Group: {patient?.bloodGroup || 'Unknown'} • Village: {patient?.village}
            </p>
          </div>

          {patient?.allergies?.length > 0 && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
              <strong>Allergies:</strong> {patient.allergies.join(', ')}
            </div>
          )}
        </div>
      </Card>

      {/* Frontline Reported Screening & Vitals */}
      {latestVisit && (
        <Card className="p-5 space-y-3 bg-white border-slate-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Frontline Screening Data</span>
            </h2>
            <Badge type="risk" value={latestVisit.riskLevel} size="sm" />
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1.5">Reported Symptoms:</span>
            <div className="flex flex-wrap gap-2">
              {latestVisit.symptoms?.map((s, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-100 font-medium text-slate-800"
                >
                  {s.name} ({s.severity || 'Mild'} - {s.duration || 'recent'})
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1.5">Recorded Vitals:</span>
            <VitalsDisplay vitals={latestVisit.vitals} />
          </div>

          {latestVisit.riskReasons?.length > 0 && (
            <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600">
              <strong>Decision Support Factors:</strong> {latestVisit.riskReasons.join('; ')}
            </div>
          )}
        </Card>
      )}

      {/* Non-AI Medical Standard Disclaimer */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
        <span>
          <strong>Clinical Responsibility:</strong> Enter verified physical examination findings and clinical directives. SwasthyaSetu does not provide automated machine diagnosis.
        </span>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Doctor Consultation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-5 bg-white border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Physician Examination & Directives
          </h2>

          {/* 1. Clinical Observations */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {t('clinicalObservations')} *
              </label>
              <span className="text-[11px] text-slate-400">Click quick chips to auto-fill</span>
            </div>

            {/* Quick Observation Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_OBSERVATIONS.map((obs) => (
                <button
                  key={obs}
                  type="button"
                  onClick={() => appendPhrase(setObservations, observations, obs)}
                  className="px-2 py-1 text-[11px] font-medium rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 border border-slate-200 transition-colors"
                >
                  + {obs}
                </button>
              ))}
            </div>

            <textarea
              rows="3"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder={t('clinicalObservationsPlaceholder')}
              className="w-full p-3 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-500"
              required
            ></textarea>
          </div>

          {/* 2. Doctor Assessment / Diagnosis */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {t('doctorAssessment')} *
              </label>
              <span className="text-[11px] text-slate-400">Click to select primary/differential diagnosis</span>
            </div>

            {/* Quick Assessment Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_ASSESSMENTS.map((asmt) => (
                <button
                  key={asmt}
                  type="button"
                  onClick={() => appendPhrase(setAssessment, assessment, asmt)}
                  className="px-2 py-1 text-[11px] font-medium rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                >
                  + {asmt}
                </button>
              ))}
            </div>

            <textarea
              rows="2"
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder={t('doctorAssessmentPlaceholder')}
              className="w-full p-3 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-500"
              required
            ></textarea>
          </div>

          {/* 3. Doctor Advice */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {t('doctorAdvice')}
              </label>
              <span className="text-[11px] text-slate-400">Click to add clinical lifestyle directives</span>
            </div>

            {/* Quick Advice Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_ADVICE.map((adv) => (
                <button
                  key={adv}
                  type="button"
                  onClick={() => appendLine(setAdvice, advice, adv)}
                  className="px-2 py-1 text-[11px] font-medium rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                >
                  + {adv.slice(0, 32)}...
                </button>
              ))}
            </div>

            <textarea
              rows="2"
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder={t('doctorAdvicePlaceholder')}
              className="w-full p-3 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-500"
            ></textarea>
          </div>

          {/* 4. Treatment Instructions (Prescription) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {t('treatmentInstructions')} (Prescription)
              </label>
              <span className="text-[11px] text-slate-400">Click to add standard formulations</span>
            </div>

            {/* Quick Prescription Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_PRESCRIPTIONS.map((rx) => (
                <button
                  key={rx}
                  type="button"
                  onClick={() => appendLine(setTreatmentInstructions, treatmentInstructions, rx)}
                  className="px-2 py-1 text-[11px] font-medium rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                >
                  + {rx}
                </button>
              ))}
            </div>

            <textarea
              rows="3"
              value={treatmentInstructions}
              onChange={(e) => setTreatmentInstructions(e.target.value)}
              placeholder={t('treatmentPlaceholder')}
              className="w-full p-3 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-500"
            ></textarea>
          </div>

          {/* 5. Schedule Follow-up */}
          <div>
            <Input
              label="Schedule Follow-up Recommendation (Optional Date)"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              helperText="If chosen, automatically generates an active follow-up reminder for the village frontline worker."
            />
          </div>
        </Card>

        {/* Embedded Patient Medical Records Section */}
        <MedicalDocumentsCard
          patientId={patientId}
          patientName={patient?.name}
          onDocumentAdded={() => setConsultationDocsCount((prev) => prev + 1)}
        />

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/doctor/patients/${patientId}`)}
            disabled={saving}
          >
            {t('cancel')}
          </Button>

          <Button type="submit" loading={saving} size="lg" className="shadow-md bg-teal-600 hover:bg-teal-700 text-white">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            <span>{t('saveConsultation')}</span>
          </Button>
        </div>
      </form>

      {/* Document Upload Modal */}
      {showDocUploadModal && (
        <DocumentUploadModal
          isOpen={showDocUploadModal}
          onClose={() => setShowDocUploadModal(false)}
          patientId={patientId}
          patientName={patient?.name}
          onUploaded={() => setConsultationDocsCount((prev) => prev + 1)}
        />
      )}
    </div>
  );
}
