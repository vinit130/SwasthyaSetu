import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  Thermometer,
  Heart,
  Wind,
  Scale,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  Send,
  Info,
} from 'lucide-react';
import { patientAPI, visitAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useOffline } from '../../context/OfflineContext';
import { calculateClientRisk } from '../../utils/riskRules';
import { validateVitals } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const AVAILABLE_SYMPTOMS = [
  'Fever',
  'Cough',
  'Cold',
  'Headache',
  'Body pain',
  'Breathing difficulty',
  'Vomiting',
  'Diarrhea',
  'Chest discomfort',
  'Other',
];

export default function SymptomsVitals() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isOnline, saveOfflineAction } = useOffline();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  // Form State
  const [selectedSymptoms, setSelectedSymptoms] = useState({});
  const [otherSymptomName, setOtherSymptomName] = useState('');
  const [vitals, setVitals] = useState({
    temperature: '',
    systolic: '',
    diastolic: '',
    heartRate: '',
    spO2: '',
    respiratoryRate: '',
    weight: '',
  });
  const [notes, setNotes] = useState('');
  const [vitalsErrors, setVitalsErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live Risk Calculation Preview
  const [liveRisk, setLiveRisk] = useState({
    level: 'GREEN',
    label: 'Routine',
    disclaimer: 'Vitals and reported signs are within routine monitoring thresholds.',
    reasons: ['Normal physiological vitals recorded', 'No high-risk emergency symptoms detected'],
  });

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoadingPatient(true);
        const res = await patientAPI.getPatientById(id);
        if (res.data.success) {
          setPatient(res.data.data.patient);
        }
      } catch (err) {
        console.error('Failed to load patient:', err);
      } finally {
        setLoadingPatient(false);
      }
    };
    fetchPatient();
  }, [id]);

  // Recalculate risk on any change to symptoms or vitals
  useEffect(() => {
    const formattedSymptoms = Object.entries(selectedSymptoms)
      .filter(([_, active]) => active)
      .map(([name, data]) => ({
        name: name === 'Other' && otherSymptomName ? otherSymptomName : name,
        severity: data.severity || 'Mild',
        duration: data.duration || '1-2 days',
        notes: data.notes || '',
      }));

    const formattedVitals = {
      temperature: vitals.temperature,
      bloodPressure: {
        systolic: vitals.systolic,
        diastolic: vitals.diastolic,
      },
      heartRate: vitals.heartRate,
      spO2: vitals.spO2,
      respiratoryRate: vitals.respiratoryRate,
      weight: vitals.weight,
    };

    const calculated = calculateClientRisk({
      symptoms: formattedSymptoms,
      vitals: formattedVitals,
    });
    setLiveRisk(calculated);
  }, [selectedSymptoms, otherSymptomName, vitals]);

  const getTemperatureStatus = () => {
    if (!vitals.temperature) return null;
    const temp = parseFloat(vitals.temperature);
    if (temp >= 38.9) return { label: 'High Fever (≥38.9°C)', type: 'red' };
    if (temp >= 38.0) return { label: 'Mild Fever (38.0-38.8°C)', type: 'amber' };
    if (temp < 35.5) return { label: 'Hypothermia (<35.5°C)', type: 'red' };
    if (temp >= 36.5 && temp <= 37.5) return { label: 'Normal Range (36.5-37.5°C)', type: 'green' };
    return null;
  };

  const getBPStatus = () => {
    if (!vitals.systolic && !vitals.diastolic) return null;
    const sys = parseInt(vitals.systolic, 10);
    const dia = parseInt(vitals.diastolic, 10);
    if (sys >= 160 || dia >= 100) return { label: 'Severe High BP (Stage 2)', type: 'red' };
    if (sys >= 140 || dia >= 90) return { label: 'Elevated BP (Stage 1)', type: 'amber' };
    if (sys < 90 || dia < 60) return { label: 'Low Blood Pressure', type: 'amber' };
    if (sys && dia && sys <= 120 && dia <= 80) return { label: 'Optimal Blood Pressure', type: 'green' };
    return null;
  };

  const getSpO2Status = () => {
    if (!vitals.spO2) return null;
    const spo2 = parseInt(vitals.spO2, 10);
    if (spo2 < 92) return { label: 'Critical: Low SpO2 (<92%)', type: 'red' };
    if (spo2 < 95) return { label: 'Borderline SpO2 (92-94%)', type: 'amber' };
    if (spo2 >= 95) return { label: 'Normal SpO2 (≥95%)', type: 'green' };
    return null;
  };

  const getHRStatus = () => {
    if (!vitals.heartRate) return null;
    const hr = parseInt(vitals.heartRate, 10);
    if (hr > 120 || hr < 50) return { label: 'Critical Pulse (<50 or >120 bpm)', type: 'red' };
    if (hr > 100) return { label: 'Tachycardia (>100 bpm)', type: 'amber' };
    if (hr >= 60 && hr <= 100) return { label: 'Normal Pulse Rate', type: 'green' };
    return null;
  };

  const getRespStatus = () => {
    if (!vitals.respiratoryRate) return null;
    const rr = parseInt(vitals.respiratoryRate, 10);
    if (rr > 30 || rr < 10) return { label: 'Critical Respiratory Rate', type: 'red' };
    if (rr > 24 || rr < 12) return { label: 'Abnormal Rate (12-20 normal)', type: 'amber' };
    if (rr >= 12 && rr <= 20) return { label: 'Normal Respiratory Rate', type: 'green' };
    return null;
  };

  const renderStatusBadge = (status) => {
    if (!status) return null;
    const colorMap = {
      red: 'bg-red-50 text-red-700 border-red-200 animate-pulse',
      amber: 'bg-amber-50 text-amber-800 border-amber-200',
      green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-md text-[10px] font-semibold border ${colorMap[status.type]}`}>
        <span>{status.type === 'red' ? '⚠️' : status.type === 'amber' ? '⚡' : '✓'}</span>
        <span>{status.label}</span>
      </div>
    );
  };

  const toggleSymptom = (sym) => {
    setSelectedSymptoms((prev) => {
      const current = prev[sym];
      if (current) {
        const copy = { ...prev };
        delete copy[sym];
        return copy;
      } else {
        return {
          ...prev,
          [sym]: { severity: 'Mild', duration: '1-2 days', notes: '' },
        };
      }
    });
  };

  const handleSymptomDetailChange = (sym, field, value) => {
    setSelectedSymptoms((prev) => ({
      ...prev,
      [sym]: {
        ...prev[sym],
        [field]: value,
      },
    }));
  };

  const handleVitalChange = (field, value) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
    // Clear validation error on vital edit
    if (vitalsErrors[field]) {
      setVitalsErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate vitals
    const errors = validateVitals({
      temperature: vitals.temperature,
      bloodPressure: { systolic: vitals.systolic, diastolic: vitals.diastolic },
      heartRate: vitals.heartRate,
      spO2: vitals.spO2,
      respiratoryRate: vitals.respiratoryRate,
    });

    if (Object.keys(errors).length > 0) {
      setVitalsErrors(errors);
      return;
    }

    setSubmitting(true);

    const formattedSymptoms = Object.entries(selectedSymptoms).map(([name, data]) => ({
      name: name === 'Other' && otherSymptomName ? otherSymptomName : name,
      severity: data.severity,
      duration: data.duration,
      notes: data.notes,
    }));

    const payload = {
      symptoms: formattedSymptoms,
      vitals: {
        temperature: vitals.temperature ? Number(vitals.temperature) : undefined,
        bloodPressure: {
          systolic: vitals.systolic ? Number(vitals.systolic) : undefined,
          diastolic: vitals.diastolic ? Number(vitals.diastolic) : undefined,
        },
        heartRate: vitals.heartRate ? Number(vitals.heartRate) : undefined,
        spO2: vitals.spO2 ? Number(vitals.spO2) : undefined,
        respiratoryRate: vitals.respiratoryRate ? Number(vitals.respiratoryRate) : undefined,
        weight: vitals.weight ? Number(vitals.weight) : undefined,
      },
      notes,
    };

    if (!isOnline) {
      saveOfflineAction({
        type: 'CREATE_VISIT',
        patientId: id,
        payload,
      });
      setSavedSuccess(true);
      setSubmitting(false);
      return;
    }

    try {
      const res = await visitAPI.createVisit(id, payload);
      if (res.data.success) {
        setSavedSuccess(true);
      }
    } catch (err) {
      console.error('Failed to save symptoms and vitals:', err);
      alert(err.response?.data?.message || 'Failed to save visit record.');
    } finally {
      setSubmitting(false);
    }
  };

  if (savedSuccess) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <Card className="p-8 text-center bg-white border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">{t('symptomsAndVitals')}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('frontlineAdvisoryNotice')}
          </p>

          <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{t('clinicalDecisionSupport')}:</span>
              <Badge type="risk" value={liveRisk.level} />
            </div>
            <div className="text-xs text-slate-600">
              <span className="font-semibold block mb-0.5">{t('riskFactorsTitle')}:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                {liveRisk.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Link to={`/asha/patients/${id}`}>
              <Button variant="secondary" size="md">
                {t('viewProfile')}
              </Button>
            </Link>
            <Link to="/asha/dashboard">
              <Button size="md">{t('dashboard')}</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to={`/asha/patients/${id}`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t('back')}</span>
      </Link>

      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t('symptomsAndVitals')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {patient ? (
            <span>
              {t('symptomsVitalsSubtitle')} — <strong>{patient.name}</strong> ({patient.patientId} • {patient.age} yrs • {patient.gender})
            </span>
          ) : (
            t('loading')
          )}
        </p>
      </div>

      {/* Clinical Disclaimer Notice */}
      <div className="p-3.5 bg-slate-100/80 rounded-2xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <span>
          <strong>{t('clinicalDecisionSupport')}:</strong> {t('disclaimer')}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Symptoms Checklist */}
        <Card className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">{t('selectSymptoms')}</h2>
            <p className="text-xs text-slate-500">
              {t('symptomsPrompt')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {AVAILABLE_SYMPTOMS.map((sym) => {
              const isSelected = !!selectedSymptoms[sym];
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => toggleSymptom(sym)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{sym}</span>
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isSelected ? 'bg-teal-600 text-white' : 'border border-slate-300'
                    }`}
                  >
                    {isSelected && '✓'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Details for each selected symptom */}
          {Object.keys(selectedSymptoms).length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t('severity')} & {t('duration')}
              </h3>

              {Object.keys(selectedSymptoms).map((sym) => (
                <div
                  key={sym}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-xs">{sym}</span>
                    {sym === 'Other' && (
                      <input
                        type="text"
                        value={otherSymptomName}
                        onChange={(e) => setOtherSymptomName(e.target.value)}
                        placeholder="Specify other symptom..."
                        className="text-xs px-2 py-1 border rounded bg-white"
                        required
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">{t('severity')}</label>
                      <select
                        value={selectedSymptoms[sym].severity}
                        onChange={(e) =>
                          handleSymptomDetailChange(sym, 'severity', e.target.value)
                        }
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Mild">{t('mild')}</option>
                        <option value="Moderate">{t('moderate')}</option>
                        <option value="Severe">{t('severe')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">{t('duration')}</label>
                      <select
                        value={selectedSymptoms[sym].duration}
                        onChange={(e) =>
                          handleSymptomDetailChange(sym, 'duration', e.target.value)
                        }
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="< 24 hours">&lt; 24 hours</option>
                        <option value="1-2 days">1-2 days</option>
                        <option value="3-5 days">3-5 days</option>
                        <option value="> 1 week">&gt; 1 week</option>
                        <option value="Chronic / Ongoing">Chronic / Ongoing</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Step 2: Physiological Vitals */}
        <Card className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">{t('vitalsSection')}</h2>
            <p className="text-xs text-slate-500">
              Input measured patient physiological readings with instant range validation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Input
                label={t('temperature')}
                type="number"
                step="0.1"
                value={vitals.temperature}
                onChange={(e) => handleVitalChange('temperature', e.target.value)}
                placeholder="e.g. 37.2"
                icon={Thermometer}
                error={vitalsErrors.temperature}
                helperText="Normal: 36.5 - 37.5°C"
              />
              {renderStatusBadge(getTemperatureStatus())}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">
                {t('bloodPressure')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={vitals.systolic}
                  onChange={(e) => handleVitalChange('systolic', e.target.value)}
                  placeholder="Sys 120"
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:ring-1 focus:ring-teal-500"
                />
                <input
                  type="number"
                  value={vitals.diastolic}
                  onChange={(e) => handleVitalChange('diastolic', e.target.value)}
                  placeholder="Dia 80"
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <span className="text-[11px] text-slate-400">Normal: &lt; 120/80 mmHg</span>
              {(vitalsErrors.systolic || vitalsErrors.diastolic) && (
                <p className="text-xs text-red-600">
                  {vitalsErrors.systolic || vitalsErrors.diastolic}
                </p>
              )}
              {renderStatusBadge(getBPStatus())}
            </div>

            <div>
              <Input
                label={t('spO2')}
                type="number"
                value={vitals.spO2}
                onChange={(e) => handleVitalChange('spO2', e.target.value)}
                placeholder="e.g. 98"
                icon={Activity}
                error={vitalsErrors.spO2}
                helperText="Normal: ≥ 95%"
              />
              {renderStatusBadge(getSpO2Status())}
            </div>

            <div>
              <Input
                label={t('heartRate')}
                type="number"
                value={vitals.heartRate}
                onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                placeholder="e.g. 78"
                icon={Heart}
                error={vitalsErrors.heartRate}
                helperText="Normal: 60 - 100 bpm"
              />
              {renderStatusBadge(getHRStatus())}
            </div>

            <div>
              <Input
                label={t('respiratoryRate')}
                type="number"
                value={vitals.respiratoryRate}
                onChange={(e) => handleVitalChange('respiratoryRate', e.target.value)}
                placeholder="e.g. 16"
                icon={Wind}
                error={vitalsErrors.respiratoryRate}
                helperText="Normal: 12 - 20 /min"
              />
              {renderStatusBadge(getRespStatus())}
            </div>

            <Input
              label={t('weight')}
              type="number"
              step="0.5"
              value={vitals.weight}
              onChange={(e) => handleVitalChange('weight', e.target.value)}
              placeholder="e.g. 62"
              icon={Scale}
              helperText="Optional (kg)"
            />
          </div>

          <div className="pt-2">
            <label className="text-sm font-medium text-slate-700 block mb-1">
              {t('fieldNotes')}
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('fieldNotesPlaceholder')}
              className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-teal-600 focus:ring-1 focus:ring-teal-500"
            ></textarea>
          </div>
        </Card>

        {/* Live Rule-Based Risk Preview Card */}
        <Card
          className={`p-5 transition-all border-2 shadow-xs ${
            liveRisk.level === 'RED'
              ? 'bg-red-50/70 border-red-400 text-red-950'
              : liveRisk.level === 'YELLOW'
              ? 'bg-amber-50/70 border-amber-300 text-amber-950'
              : 'bg-emerald-50/50 border-emerald-300 text-emerald-950'
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-black/5">
            <div className="flex items-center gap-2">
              {liveRisk.level === 'RED' ? (
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 animate-bounce" />
              ) : liveRisk.level === 'YELLOW' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <div>
                <h3 className="font-bold text-sm sm:text-base">
                  {t('clinicalDecisionSupport')}: {liveRisk.label}
                </h3>
                <span className="text-[10px] text-slate-500 font-medium">{t('frontlineAdvisoryNotice')}</span>
              </div>
            </div>
            <Badge type="risk" value={liveRisk.level} size="sm" />
          </div>

          <p className="text-xs font-medium mb-3">{liveRisk.disclaimer}</p>

          <div className="text-xs space-y-1">
            <span className="font-semibold block">{t('riskFactorsTitle')}:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              {liveRisk.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/asha/patients/${id}`)}
            disabled={submitting}
          >
            {t('cancel')}
          </Button>

          <Button type="submit" loading={submitting} size="lg" className="shadow-md">
            <Send className="w-4 h-4 mr-2" />
            <span>{t('saveAndAssess')}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
