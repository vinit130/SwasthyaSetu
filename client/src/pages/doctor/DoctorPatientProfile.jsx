import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Activity,
  Stethoscope,
  Share2,
  CalendarCheck,
  MapPin,
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
  Plus,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { patientAPI, referralAPI, followupAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import PatientTimeline from '../../components/patient/PatientTimeline';
import VitalsDisplay from '../../components/patient/VitalsDisplay';
import MedicalDocumentsCard from '../../components/documents/MedicalDocumentsCard';
import DocumentUploadModal from '../../components/documents/DocumentUploadModal';
import { formatDate } from '../../utils/formatters';

const REFERRAL_HOSPITALS = [
  'District Hospital, Aundh, Pune',
  'Sub-Divisional Hospital, Shirur',
  'Sassoon General Hospital & BJ Medical College, Pune',
  'Other / Custom Facility',
];

const REFERRAL_SPECIALTIES = [
  'General Medicine',
  'Obstetrics & Gynecology',
  'Pediatrics',
  'Cardiology',
  'Orthopedics',
  'General Surgery',
  'ENT',
  'Ophthalmology',
  'Pulmonary Medicine',
];

const COMMON_REFERRAL_REASONS = [
  'Persistent High Fever',
  'Suspected Acute Abdomen',
  'Severe Anemia in Pregnancy',
  'Uncontrolled Hypertension',
  'Chest Pain / Suspected Cardiac Event',
  'Respiratory Distress',
  'Fracture / Trauma Stabilization',
  'Post-Operative Complication',
];

export default function DoctorPatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');

  // Modals for Actions
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Referral form state
  const [referralForm, setReferralForm] = useState({
    facility: REFERRAL_HOSPITALS[0],
    customFacilityName: '',
    department: REFERRAL_SPECIALTIES[0],
    priority: 'ROUTINE',
    reason: '',
    instructions: '',
  });
  const [submittingReferral, setSubmittingReferral] = useState(false);
  const [createdReferralToken, setCreatedReferralToken] = useState('');
  const [referralCopied, setReferralCopied] = useState(false);

  const closeReferralModal = () => {
    setShowReferralModal(false);
    setCreatedReferralToken('');
    setReferralCopied(false);
    setReferralForm({
      facility: REFERRAL_HOSPITALS[0],
      customFacilityName: '',
      department: REFERRAL_SPECIALTIES[0],
      priority: 'ROUTINE',
      reason: '',
      instructions: '',
    });
  };

  // Follow-up form state
  const [followupForm, setFollowupForm] = useState({
    date: '',
    instructions: 'Review vital signs and progress of recovery',
    notes: '',
  });
  const [submittingFollowup, setSubmittingFollowup] = useState(false);

  // Doctor Clinical Risk Assessment State
  const [selectedRisk, setSelectedRisk] = useState('');
  const [riskReason, setRiskReason] = useState('');
  const [submittingRisk, setSubmittingRisk] = useState(false);
  const [riskSuccessMsg, setRiskSuccessMsg] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await patientAPI.getPatientById(id);
      if (res.data.success) {
        setData(res.data.data);
        const p = res.data.data.patient;
        const latestV = res.data.data.latestVisit;
        setSelectedRisk(p.currentRisk !== 'PENDING_REVIEW' ? p.currentRisk : latestV?.suggestedRisk || 'GREEN');
        setRiskReason(p.riskNote || '');
      }
    } catch (err) {
      console.error('Failed to load doctor patient profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRisk = async (e) => {
    e.preventDefault();
    if (!selectedRisk) return;
    try {
      setSubmittingRisk(true);
      const res = await patientAPI.assessDoctorRisk(id, {
        riskLevel: selectedRisk,
        reason: riskReason,
        visitId: data?.latestVisit?._id,
      });
      if (res.data.success) {
        setRiskSuccessMsg('Doctor risk assessment confirmed successfully!');
        setTimeout(() => setRiskSuccessMsg(''), 4000);
        fetchProfile();
      }
    } catch (err) {
      console.error('Failed to confirm risk:', err);
      alert(err.response?.data?.message || 'Failed to confirm risk level.');
    } finally {
      setSubmittingRisk(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReferral(true);
      const targetFacility = referralForm.facility === 'Other / Custom Facility'
        ? (referralForm.customFacilityName?.trim() || 'Other Hospital')
        : referralForm.facility;

      const res = await referralAPI.createReferral({
        patientId: id,
        facility: targetFacility,
        department: referralForm.department,
        priority: referralForm.priority,
        reason: referralForm.reason,
        instructions: referralForm.instructions,
      });

      if (res.data?.success && res.data?.data?.referralToken) {
        setCreatedReferralToken(res.data.data.referralToken);
      } else {
        closeReferralModal();
      }
      fetchProfile();
    } catch (err) {
      console.error('Failed to create referral:', err);
      alert(err.response?.data?.message || 'Failed to create referral.');
    } finally {
      setSubmittingReferral(false);
    }
  };

  const handleCreateFollowup = async (e) => {
    e.preventDefault();
    try {
      setSubmittingFollowup(true);
      await followupAPI.createFollowup({
        patientId: id,
        ...followupForm,
      });
      setShowFollowupModal(false);
      setFollowupForm({
        date: '',
        instructions: 'Review vital signs and progress of recovery',
        notes: '',
      });
      fetchProfile();
    } catch (err) {
      console.error('Failed to schedule follow-up:', err);
      alert(err.response?.data?.message || 'Failed to schedule follow-up.');
    } finally {
      setSubmittingFollowup(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <SkeletonLoader count={3} />
      </div>
    );
  }

  if (!data || !data.patient) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Patient not found.</p>
        <Link to="/doctor/patients" className="mt-2 inline-block text-xs text-teal-600 underline">
          Back to patient registry
        </Link>
      </div>
    );
  }

  const { patient, currentRisk, latestVisit, visits, consultations, referrals, followups, timeline } =
    data;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/doctor/patients"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Patient Registry</span>
      </Link>

      {/* Patient Summary Header */}
      <Card className="p-6 bg-white border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm shadow-indigo-700/20">
              {patient.name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{patient.name}</h1>
                <Badge type="risk" value={currentRisk || 'GREEN'} />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5 font-medium">
                <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {patient.patientId}
                </span>
                <span>•</span>
                <span>
                  {patient.age} yrs • {patient.gender} • Blood: {patient.bloodGroup || 'Unknown'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {patient.village}, {patient.district}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Doctor Clinical Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link to={`/doctor/consultations/new?patientId=${patient._id}`}>
              <Button size="md" className="shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                <Stethoscope className="w-4 h-4 mr-1.5" />
                <span>{t('startConsultation')}</span>
              </Button>
            </Link>

            <Button
              size="md"
              variant="outline"
              onClick={() => setShowReferralModal(true)}
            >
              <Share2 className="w-4 h-4 mr-1.5 text-purple-600" />
              <span>{t('createReferral')}</span>
            </Button>

            <Button
              size="md"
              variant="outline"
              onClick={() => setShowDocumentModal(true)}
              className="border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              <FileText className="w-4 h-4 mr-1.5 text-teal-600" />
              <span>Attach Document</span>
            </Button>

            <Button
              size="md"
              variant="secondary"
              onClick={() => setShowFollowupModal(true)}
            >
              <CalendarCheck className="w-4 h-4 mr-1.5 text-amber-600" />
              <span>{t('scheduleFollowup')}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Doctor Clinical Risk Assessment Panel (Authoritative Single Source of Truth) */}
      <Card className="p-5 bg-white border-2 border-indigo-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {t('doctorRiskTitle')}
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {t('singleSourceOfTruth')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t('doctorRiskSubtitle')}
              </p>
            </div>
          </div>

          {latestVisit?.suggestedRisk && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs shrink-0">
              <span className="text-slate-500 font-medium">{t('clinicalDecisionSupport')}:</span>
              <Badge type="risk" value={latestVisit.suggestedRisk} size="sm" />
            </div>
          )}
        </div>

        {/* Triggers from frontline screening */}
        {latestVisit && (latestVisit.suggestedRiskReasons?.length > 0 || latestVisit.riskReasons?.length > 0) && (
          <div className="text-xs bg-slate-50 p-2.5 rounded-xl text-slate-600 border border-slate-100">
            <strong>{t('riskFactorsTitle')}:</strong> {(latestVisit.suggestedRiskReasons || latestVisit.riskReasons || []).join('; ')}
            <span className="text-slate-400 ml-2">
              (Recorded {formatDate(latestVisit.visitDate)} by {latestVisit.recordedBy?.name || 'ASHA Worker'})
            </span>
          </div>
        )}

        <form onSubmit={handleConfirmRisk} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
              {t('confirmAuthoritativeRisk')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedRisk('GREEN')}
                className={`p-3 rounded-xl border text-left font-semibold text-xs transition-all flex items-center justify-between cursor-pointer ${
                  selectedRisk === 'GREEN'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300'
                    : 'bg-emerald-50/60 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70'
                }`}
              >
                <span>{t('riskGreen')}</span>
                {selectedRisk === 'GREEN' && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedRisk('YELLOW')}
                className={`p-3 rounded-xl border text-left font-semibold text-xs transition-all flex items-center justify-between cursor-pointer ${
                  selectedRisk === 'YELLOW'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm ring-2 ring-amber-300'
                    : 'bg-amber-50/60 text-amber-900 border-amber-200 hover:bg-amber-100/70'
                }`}
              >
                <span>{t('riskYellow')}</span>
                {selectedRisk === 'YELLOW' && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedRisk('RED')}
                className={`p-3 rounded-xl border text-left font-semibold text-xs transition-all flex items-center justify-between cursor-pointer ${
                  selectedRisk === 'RED'
                    ? 'bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-300'
                    : 'bg-red-50/60 text-red-800 border-red-200 hover:bg-red-100/70'
                }`}
              >
                <span>{t('riskRed')}</span>
                {selectedRisk === 'RED' && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t('clinicalRationale')}
            </label>
            <input
              type="text"
              value={riskReason}
              onChange={(e) => setRiskReason(e.target.value)}
              placeholder={t('clinicalRationalePlaceholder')}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-500">
              {patient.riskAssessedBy ? (
                <span>
                  {t('doctorConfirmedRisk')}: <strong>{patient.currentRisk}</strong> (Assessed by {patient.riskAssessedBy.name || 'Doctor'} on {formatDate(patient.riskAssessedAt)})
                </span>
              ) : (
                <span className="text-amber-700 font-medium">
                  {t('riskPending')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {riskSuccessMsg && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('riskConfirmedSuccess')}
                </span>
              )}
              <Button
                type="submit"
                size="sm"
                loading={submittingRisk}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
              >
                {t('confirmRiskBtn')}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Care Journey Timeline ({timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'vitals'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Vitals & Screening ({visits.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Medical Documents & Scans
          </button>
          <button
            onClick={() => setActiveTab('consultations')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'consultations'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Doctor Consultations ({consultations.length})
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'referrals'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Referrals ({referrals.length})
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Patient History & Background
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      {activeTab === 'timeline' && (
        <Card className="p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">{t('patientJourney')}</h2>
            <p className="text-xs text-slate-500">
              Longitudinal continuum of care from frontline intake to physician consultations and follow-up.
            </p>
          </div>
          <PatientTimeline events={timeline} />
        </Card>
      )}

      {activeTab === 'vitals' && (
        <div className="space-y-4">
          {visits.map((v) => (
            <Card key={v._id} className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs text-slate-500">Screening Date: {formatDate(v.visitDate)}</span>
                  <p className="text-xs text-slate-400">Frontline Worker: {v.recordedBy?.name || 'ASHA Worker'}</p>
                </div>
                <Badge type="risk" value={v.riskLevel} />
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Reported Symptoms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {v.symptoms?.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium"
                    >
                      {s.name} ({s.severity || 'Reported'} - {s.duration || 'recent'})
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Physiological Vitals
                </h3>
                <VitalsDisplay vitals={v.vitals} />
              </div>

              {v.notes && (
                <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600">
                  <strong>Frontline Field Notes:</strong> {v.notes}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'documents' && (
        <MedicalDocumentsCard
          patientId={id}
          patientName={patient.name}
          onDocumentAdded={() => fetchProfile()}
        />
      )}

      {activeTab === 'consultations' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link to={`/doctor/consultations/new?patientId=${patient._id}`}>
              <Button size="sm">
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>New Consultation</span>
              </Button>
            </Link>
          </div>

          {consultations.length === 0 ? (
            <Card className="p-8 text-center text-slate-500 text-sm">
              No previous doctor consultations recorded.
            </Card>
          ) : (
            consultations.map((c) => (
              <Card key={c._id} className="p-5 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-slate-900 text-sm">
                      Dr. {c.doctorId?.name}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                </div>

                <div className="text-xs space-y-2">
                  <div>
                    <strong className="text-slate-700 block">Assessment:</strong>
                    <p className="text-slate-600">{c.assessment}</p>
                  </div>
                  <div>
                    <strong className="text-slate-700 block">Observations:</strong>
                    <p className="text-slate-600">{c.observations}</p>
                  </div>
                  {c.advice && (
                    <div>
                      <strong className="text-slate-700 block">Advice:</strong>
                      <p className="text-slate-600">{c.advice}</p>
                    </div>
                  )}
                  {c.treatmentInstructions && (
                    <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 text-indigo-950">
                      <strong className="block mb-0.5">Rx / Treatment Instructions:</strong>
                      <p>{c.treatmentInstructions}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'referrals' && (
        <div className="space-y-4">
          {referrals.map((r) => (
            <Card key={r._id} className="p-5 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div>
                  <span className="font-semibold text-slate-900 text-sm">{r.facility}</span>
                  <span className="text-xs text-slate-500 block">Dept: {r.department}</span>
                </div>
                <Badge type="referral" value={r.status} />
              </div>

              <div className="text-xs space-y-1.5">
                <p>
                  <strong className="text-slate-700">Reason:</strong> {r.reason}
                </p>
                <p>
                  <strong className="text-slate-700">Priority:</strong> {r.priority}
                </p>
                {r.instructions && (
                  <p>
                    <strong className="text-slate-700">Instructions:</strong> {r.instructions}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'info' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Patient Demographics & Village Location
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Phone</span>
              <span className="font-semibold text-slate-800">{patient.phone || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Emergency Contact</span>
              <span className="font-semibold text-slate-800">{patient.emergencyContact || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Village & District</span>
              <span className="font-semibold text-slate-800">
                {patient.village}, {patient.district}, {patient.state}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Address</span>
              <span className="font-semibold text-slate-800">{patient.address || '-'}</span>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 pt-4">
            Clinical History
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Blood Group</span>
              <span className="font-semibold text-slate-800">{patient.bloodGroup || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Known Allergies</span>
              <span className="font-semibold text-slate-800">
                {patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'None documented'}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block">Pre-Existing Diagnosed Conditions</span>
              <span className="font-semibold text-slate-800">
                {patient.existingConditions?.length > 0
                  ? patient.existingConditions.join(', ')
                  : 'None documented'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Modal: Create Referral */}
      <Modal
        isOpen={showReferralModal}
        onClose={closeReferralModal}
        title={createdReferralToken ? 'Hospital Referral Generated' : 'Initiate Hospital Referral'}
      >
        {createdReferralToken ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-emerald-950">Referral Successfully Registered</h4>
              <p className="text-xs text-emerald-800">
                Referral token generated and linked. Patient or ASHA can use this token for direct admission at the hospital.
              </p>
              
              <div className="my-3 p-3 bg-white rounded-lg border border-emerald-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Referral Token</span>
                  <span className="text-lg font-mono font-bold text-teal-800 tracking-wider">
                    {createdReferralToken}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(createdReferralToken);
                    setReferralCopied(true);
                    setTimeout(() => setReferralCopied(false), 2500);
                  }}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {referralCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Token</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-left text-xs bg-emerald-100/50 p-2.5 rounded-lg text-emerald-900 space-y-1">
                <div><strong>Facility:</strong> {referralForm.facility === 'Other / Custom Facility' ? referralForm.customFacilityName : referralForm.facility}</div>
                <div><strong>Specialty:</strong> {referralForm.department}</div>
                <div><strong>Priority:</strong> {referralForm.priority}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={closeReferralModal}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateReferral} className="space-y-4">
            {/* Target Facility Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Destination Facility / Hospital *
              </label>
              <select
                value={referralForm.facility}
                onChange={(e) => setReferralForm({ ...referralForm, facility: e.target.value })}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-teal-500"
                required
              >
                {REFERRAL_HOSPITALS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>

              {referralForm.facility === 'Other / Custom Facility' && (
                <input
                  type="text"
                  placeholder="Enter custom hospital / facility name..."
                  value={referralForm.customFacilityName}
                  onChange={(e) => setReferralForm({ ...referralForm, customFacilityName: e.target.value })}
                  className="mt-2 w-full p-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-teal-500"
                  required
                />
              )}
            </div>

            {/* Department / Clinical Specialty */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Department / Clinical Specialty *
              </label>
              <select
                value={referralForm.department}
                onChange={(e) => setReferralForm({ ...referralForm, department: e.target.value })}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-teal-500"
                required
              >
                {REFERRAL_SPECIALTIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Priority Selection with Color Badges */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Priority Level *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReferralForm({ ...referralForm, priority: 'ROUTINE' })}
                  className={`p-2 rounded-lg border text-xs font-semibold transition-all text-center ${
                    referralForm.priority === 'ROUTINE'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-300'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  Routine (Green)
                </button>
                <button
                  type="button"
                  onClick={() => setReferralForm({ ...referralForm, priority: 'URGENT' })}
                  className={`p-2 rounded-lg border text-xs font-semibold transition-all text-center ${
                    referralForm.priority === 'URGENT'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs ring-2 ring-amber-300'
                      : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  Urgent (Amber)
                </button>
                <button
                  type="button"
                  onClick={() => setReferralForm({ ...referralForm, priority: 'EMERGENCY' })}
                  className={`p-2 rounded-lg border text-xs font-semibold transition-all text-center ${
                    referralForm.priority === 'EMERGENCY'
                      ? 'bg-red-600 text-white border-red-600 shadow-xs ring-2 ring-red-300'
                      : 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100'
                  }`}
                >
                  Emergency (Red)
                </button>
              </div>
            </div>

            {/* Common Referral Reason Chips */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Common Referral Reasons (Click to auto-populate)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_REFERRAL_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReferralForm({ ...referralForm, reason: r })}
                    className={`px-2 py-1 text-[11px] rounded-lg border transition-all ${
                      referralForm.reason === r
                        ? 'bg-teal-600 text-white border-teal-600 font-semibold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50 hover:border-teal-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <textarea
                rows="2"
                value={referralForm.reason}
                onChange={(e) => setReferralForm({ ...referralForm, reason: e.target.value })}
                placeholder="Clinical indication for tertiary hospital transfer..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Transport & Instructions */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Transport & Clinical Instructions (Optional)
              </label>
              <textarea
                rows="2"
                value={referralForm.instructions}
                onChange={(e) => setReferralForm({ ...referralForm, instructions: e.target.value })}
                placeholder="e.g. Fasting state for blood work, accompanied by ASHA..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={closeReferralModal}>
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={submittingReferral}>
                Submit Referral
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Schedule Follow-up */}
      <Modal
        isOpen={showFollowupModal}
        onClose={() => setShowFollowupModal(false)}
        title="Schedule Patient Follow-up"
      >
        <form onSubmit={handleCreateFollowup} className="space-y-4">
          <Input
            label="Follow-up Due Date"
            type="date"
            value={followupForm.date}
            onChange={(e) => setFollowupForm({ ...followupForm, date: e.target.value })}
            required
          />

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Clinical Instructions for ASHA Worker *
            </label>
            <textarea
              rows="3"
              value={followupForm.instructions}
              onChange={(e) => setFollowupForm({ ...followupForm, instructions: e.target.value })}
              placeholder="What should the frontline worker check during home visit (e.g. temperature, medication adherence)..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
              required
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowFollowupModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submittingFollowup}>
              Schedule Follow-up
            </Button>
          </div>
        </form>
      </Modal>

      {/* Document Upload Modal */}
      {showDocumentModal && (
        <DocumentUploadModal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          patientId={id}
          patientName={patient.name}
          onUploaded={() => fetchProfile()}
        />
      )}
    </div>
  );
}
