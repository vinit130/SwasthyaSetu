import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Activity,
  Stethoscope,
  Share2,
  CalendarCheck,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  FileText,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { patientAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import PatientTimeline from '../../components/patient/PatientTimeline';
import VitalsDisplay from '../../components/patient/VitalsDisplay';
import { formatDate } from '../../utils/formatters';

export default function AshaPatientProfile() {
  const { id } = useParams();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await patientAPI.getPatientById(id);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load patient profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

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
        <Link to="/asha/patients" className="mt-2 inline-block text-xs text-teal-600 underline">
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
        to="/asha/patients"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Patients</span>
      </Link>

      {/* Patient Header Card */}
      <Card className="p-6 bg-white border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm shadow-teal-700/20">
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
                  {patient.age} yrs • {patient.gender}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {patient.village}, {patient.district}
                </span>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/asha/patients/${patient._id}/symptoms`}>
              <Button size="md" className="shadow-xs">
                <Activity className="w-4 h-4 mr-1.5" />
                <span>{t('addSymptomsVitals')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Care Journey Timeline ({timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'vitals'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Vitals & Screening ({visits.length})
          </button>
          <button
            onClick={() => setActiveTab('consultations')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'consultations'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Doctor Consultations ({consultations.length})
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'referrals'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Hospital Referrals ({referrals.length})
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Patient Info & Medical History
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      {activeTab === 'timeline' && (
        <Card className="p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">{t('patientJourney')}</h2>
            <p className="text-xs text-slate-500">
              Chronological flow from village intake, vitals, risk assessment to doctor consultations and follow-up.
            </p>
          </div>
          <PatientTimeline events={timeline} />
        </Card>
      )}

      {activeTab === 'vitals' && (
        <div className="space-y-4">
          {visits.length === 0 ? (
            <Card className="p-8 text-center text-slate-500 text-sm">
              No visits or vitals recorded yet.
              <div className="mt-3">
                <Link to={`/asha/patients/${patient._id}/symptoms`}>
                  <Button size="sm">{t('addSymptomsVitals')}</Button>
                </Link>
              </div>
            </Card>
          ) : (
            visits.map((v) => (
              <Card key={v._id} className="p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs text-slate-500">Visit Date: {formatDate(v.visitDate)}</span>
                    <p className="text-xs text-slate-400">Recorded by: {v.recordedBy?.name || 'ASHA Worker'}</p>
                  </div>
                  <Badge type="risk" value={v.riskLevel} />
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Reported Symptoms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {v.symptoms?.length > 0 ? (
                      v.symptoms.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium"
                        >
                          {s.name} ({s.severity || 'Reported'} - {s.duration || 'recent'})
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No active symptoms recorded</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Physiological Vitals
                  </h3>
                  <VitalsDisplay vitals={v.vitals} />
                </div>

                {v.riskReasons?.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700">
                    <span className="font-semibold block mb-1">Decision Support Factors:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                      {v.riskReasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'consultations' && (
        <div className="space-y-4">
          {consultations.length === 0 ? (
            <Card className="p-8 text-center text-slate-500 text-sm">
              No doctor consultations recorded yet. Case awaits physician review.
            </Card>
          ) : (
            consultations.map((c) => (
              <Card key={c._id} className="p-5 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span className="font-semibold text-slate-900 text-sm">
                      Dr. {c.doctorId?.name || 'Medical Officer'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                </div>

                <div className="text-xs space-y-2">
                  <div>
                    <strong className="text-slate-700 block">Clinical Assessment:</strong>
                    <p className="text-slate-600">{c.assessment}</p>
                  </div>
                  <div>
                    <strong className="text-slate-700 block">Observations:</strong>
                    <p className="text-slate-600">{c.observations}</p>
                  </div>
                  {c.advice && (
                    <div>
                      <strong className="text-slate-700 block">Doctor Advice:</strong>
                      <p className="text-slate-600">{c.advice}</p>
                    </div>
                  )}
                  {c.treatmentInstructions && (
                    <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-100 text-teal-900">
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
          {referrals.length === 0 ? (
            <Card className="p-8 text-center text-slate-500 text-sm">
              No hospital referrals created for this patient.
            </Card>
          ) : (
            referrals.map((r) => (
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
            ))
          )}
        </div>
      )}

      {activeTab === 'info' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Demographic & Contact Details
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
            Medical History
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
              <span className="text-slate-400 block">Pre-Existing Conditions</span>
              <span className="font-semibold text-slate-800">
                {patient.existingConditions?.length > 0
                  ? patient.existingConditions.join(', ')
                  : 'None documented'}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
