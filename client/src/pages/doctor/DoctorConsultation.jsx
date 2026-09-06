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
} from 'lucide-react';
import { patientAPI, consultationAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import VitalsDisplay from '../../components/patient/VitalsDisplay';

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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('consultationTitle')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Direct physician examination, clinical impression, prescription instructions, and follow-up.
        </p>
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
              {patient?.age} yrs • {patient?.gender} • Village: {patient?.village}
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
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Physician Clinical Notes
          </h2>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t('clinicalObservations')} *
            </label>
            <textarea
              rows="3"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder={t('clinicalObservationsPlaceholder')}
              className="w-full p-3 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-teal-600"
              required
            ></textarea>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t('doctorAssessment')} *
            </label>
            <textarea
              rows="2"
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder={t('doctorAssessmentPlaceholder')}
              className="w-full p-3 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-teal-600"
              required
            ></textarea>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t('doctorAdvice')}
            </label>
            <textarea
              rows="2"
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder={t('doctorAdvicePlaceholder')}
              className="w-full p-3 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-teal-600"
            ></textarea>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t('treatmentInstructions')} (Prescription)
            </label>
            <textarea
              rows="3"
              value={treatmentInstructions}
              onChange={(e) => setTreatmentInstructions(e.target.value)}
              placeholder={t('treatmentPlaceholder')}
              className="w-full p-3 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-teal-600"
            ></textarea>
          </div>

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

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/doctor/patients/${patientId}`)}
            disabled={saving}
          >
            {t('cancel')}
          </Button>

          <Button type="submit" loading={saving} size="lg" className="shadow-md">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            <span>{t('saveConsultation')}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
