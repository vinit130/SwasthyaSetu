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
import { formatDate } from '../../utils/formatters';

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

  // Referral form state
  const [referralForm, setReferralForm] = useState({
    facility: 'District Hospital',
    department: 'General Medicine',
    priority: 'ROUTINE',
    reason: '',
    instructions: '',
  });
  const [submittingReferral, setSubmittingReferral] = useState(false);

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
      await referralAPI.createReferral({
        patientId: id,
        ...referralForm,
      });
      setShowReferralModal(false);
      setReferralForm({
        facility: 'District Hospital',
        department: 'General Medicine',
        priority: 'ROUTINE',
        reason: '',
        instructions: '',
      });
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
        onClose={() => setShowReferralModal(false)}
        title="Initiate Hospital Referral"
      >
        <form onSubmit={handleCreateReferral} className="space-y-4">
          <Input
            label="Destination Facility / Hospital"
            value={referralForm.facility}
            onChange={(e) => setReferralForm({ ...referralForm, facility: e.target.value })}
            placeholder="e.g. District Hospital / Sub-Divisional Hospital"
            required
          />

          <Input
            label="Department / Clinical Specialty"
            value={referralForm.department}
            onChange={(e) => setReferralForm({ ...referralForm, department: e.target.value })}
            placeholder="e.g. Cardiology, Pathology, General Surgery"
            required
          />

          <Select
            label="Priority Level"
            value={referralForm.priority}
            onChange={(e) => setReferralForm({ ...referralForm, priority: e.target.value })}
            options={[
              { value: 'ROUTINE', label: 'Routine (Elective / Outpatient)' },
              { value: 'URGENT', label: 'Urgent (Within 24-48 Hours)' },
              { value: 'EMERGENCY', label: 'Emergency (Immediate Transfer)' },
            ]}
          />

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Referral Reason / Working Diagnosis *
            </label>
            <textarea
              rows="3"
              value={referralForm.reason}
              onChange={(e) => setReferralForm({ ...referralForm, reason: e.target.value })}
              placeholder="Clinical indication for tertiary hospital transfer..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
              required
            ></textarea>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Transport & Clinical Instructions
            </label>
            <textarea
              rows="2"
              value={referralForm.instructions}
              onChange={(e) => setReferralForm({ ...referralForm, instructions: e.target.value })}
              placeholder="e.g. Fasting state for blood work, accompanied by ASHA..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowReferralModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submittingReferral}>
              Submit Referral
            </Button>
          </div>
        </form>
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
    </div>
  );
}
