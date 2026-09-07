import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  User,
  Activity,
  Stethoscope,
  Share2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Pill,
  FileText,
  MapPin,
  Building,
  ShieldCheck,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { patientAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import DocumentList from '../../components/documents/DocumentList';
import NearbyFacilities from '../../components/common/NearbyFacilities';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('journey');

  const fetchJourney = async () => {
    try {
      setLoading(true);
      const res = await patientAPI.getPatientJourney();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch patient journey:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourney();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <SkeletonLoader count={4} />
      </div>
    );
  }

  if (!data || !data.patient) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-3">
        <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
          <HeartPulse className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">No Patient Record Linked</h2>
        <p className="text-xs text-slate-500">
          Your account is active, but your clinical record has not been linked yet. Please consult your village ASHA worker.
        </p>
      </div>
    );
  }

  const {
    patient,
    currentRisk,
    riskNote,
    riskAssessedBy,
    riskAssessedAt,
    latestVisit,
    visits,
    consultations,
    referrals,
    followups,
  } = data;

  // Derive 6-step Journey Statuses
  const steps = [
    {
      id: 1,
      title: t('step1Title'),
      subtext: `${t('step1Desc')} (${patient.village})`,
      date: patient.createdAt,
      completed: true,
      icon: User,
    },
    {
      id: 2,
      title: t('step2Title'),
      subtext: latestVisit
        ? `${latestVisit.symptoms?.length || 0} symptoms recorded`
        : t('step2Desc'),
      date: latestVisit?.visitDate,
      completed: !!latestVisit,
      icon: Activity,
    },
    {
      id: 3,
      title: t('step3Title'),
      subtext: riskAssessedBy
        ? `${t('doctorConfirmedRisk')}: ${currentRisk} (Dr. ${riskAssessedBy.name})`
        : t('step3Desc'),
      date: riskAssessedAt,
      completed: !!riskAssessedBy || currentRisk !== 'PENDING_REVIEW',
      icon: Stethoscope,
    },
    {
      id: 4,
      title: t('step4Title'),
      subtext: consultations?.length > 0
        ? `${consultations.length} consultation(s)`
        : t('step4Desc'),
      date: consultations?.[0]?.consultationDate,
      completed: consultations?.length > 0,
      icon: Pill,
    },
    {
      id: 5,
      title: t('step5Title'),
      subtext: referrals?.length > 0
        ? `${referrals[0].facility} (${referrals[0].status})`
        : t('step5Desc'),
      date: referrals?.[0]?.createdAt,
      completed: referrals?.length > 0,
      optional: true,
      icon: Building,
    },
    {
      id: 6,
      title: t('step6Title'),
      subtext: followups?.length > 0
        ? `${formatDate(followups[0].dueDate)} (${followups[0].status})`
        : t('step6Desc'),
      date: followups?.[0]?.dueDate,
      completed: followups?.some((f) => f.status === 'COMPLETED'),
      active: followups?.some((f) => f.status === 'PENDING'),
      icon: CalendarCheck,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Patient Welcome Header */}
      <Card className="p-6 bg-linear-to-r from-teal-700 to-emerald-800 text-white border-none shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-bold text-2xl text-white border border-white/20">
              {patient.name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold">{patient.name}</h1>
                <span className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full font-medium">
                  {patient.gender}, {patient.age} yrs
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-teal-100 mt-1.5">
                <span className="font-mono bg-black/20 px-2 py-0.5 rounded text-white font-semibold">
                  ID: {patient.patientId}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {patient.village}, {patient.district}
                </span>
                {patient.phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {patient.phone}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 text-right sm:text-right">
            <span className="text-[11px] text-teal-100 uppercase tracking-wider block font-semibold">
              {t('doctorConfirmedStatus')}
            </span>
            <div className="mt-1">
              <Badge type="risk" value={currentRisk || 'GREEN'} />
            </div>
          </div>
        </div>
      </Card>

      {/* Doctor Confirmed Risk & Advice Banner */}
      <Card className="p-5 bg-white border border-slate-200">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('careGuidanceTitle')}
              </h3>
              {riskAssessedAt && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {formatDate(riskAssessedAt)}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {riskNote ? (
                <span><strong>{t('clinicalRationale')}:</strong> {riskNote}</span>
              ) : (
                'Your vitals have been reviewed. Follow prescribed instructions and report to your ASHA worker if symptoms change.'
              )}
            </p>

            {riskAssessedBy && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                Evaluated by <strong>Dr. {riskAssessedBy.name}</strong> • SwasthyaSetu Rural Network
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-6 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setActiveTab('journey')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'journey'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t('myCareJourney')}
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'prescriptions'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t('prescriptionsTitle')} ({consultations?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'referrals'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t('referrals')} ({referrals?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('followups')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'followups'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t('followups')} ({followups?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'records'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            My Medical Records
          </button>
          <button
            onClick={() => setActiveTab('facilities')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'facilities'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Nearby Hospitals
          </button>
        </nav>
      </div>

      {/* TAB 1: 6-Step Care Journey Timeline */}
      {activeTab === 'journey' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              {t('patientHubSubtitle')}
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative flex items-start gap-4">
                  {/* Step indicator dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 w-6 sm:w-7 h-6 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      step.completed
                        ? 'bg-teal-600 text-white shadow-xs'
                        : step.active
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>

                  {/* Step Card */}
                  <Card className={`flex-1 p-4 transition-all ${
                    step.completed ? 'bg-white border-slate-200' : 'bg-slate-50/70 border-dashed border-slate-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${step.completed ? 'text-teal-600' : 'text-slate-400'}`} />
                        <h4 className="font-bold text-sm text-slate-900">{step.title}</h4>
                      </div>
                      {step.date && (
                        <span className="text-[11px] text-slate-400">
                          {formatDate(step.date)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{step.subtext}</p>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Doctor Consultations & Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {(!consultations || consultations.length === 0) ? (
            <EmptyState
              title={t('noPrescriptionsYet')}
              description="Your doctor has not recorded a formal consultation or medication plan yet."
            />
          ) : (
            consultations.map((c) => (
              <Card key={c._id} className="p-5 bg-white border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="font-bold text-sm text-slate-900">
                      Dr. {c.doctorId?.name || 'Medical Officer'}
                    </span>
                    <p className="text-xs text-slate-400">
                      Consultation on {formatDate(c.consultationDate)}
                    </p>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-semibold border border-indigo-200">
                    Clinical Visit
                  </span>
                </div>

                {c.assessment && (
                  <div className="text-xs">
                    <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                      Doctor's Clinical Assessment:
                    </span>
                    <p className="text-slate-800 font-medium mt-0.5">{c.assessment}</p>
                  </div>
                )}

                {c.advice && (
                  <div className="text-xs bg-teal-50/60 p-3 rounded-xl border border-teal-100 text-teal-900">
                    <strong className="block mb-0.5">Doctor Advice:</strong>
                    <p>{c.advice}</p>
                  </div>
                )}

                {c.prescriptions?.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-slate-800 block mb-2 flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-indigo-600" />
                      <span>Prescribed Medications:</span>
                    </span>
                    <div className="space-y-2">
                      {c.prescriptions.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{p.medication}</span>
                            <span className="text-slate-500 ml-2 font-medium">({p.dosage})</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-600 font-medium">
                            <span>{p.frequency}</span>
                            <span>•</span>
                            <span>{p.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Hospital Referrals */}
      {activeTab === 'referrals' && (
        <div className="space-y-4">
          {(!referrals || referrals.length === 0) ? (
            <EmptyState
              title="No Referrals"
              description="You do not have any active hospital referrals at this time."
            />
          ) : (
            referrals.map((r) => (
              <Card key={r._id} className="p-5 bg-white border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{r.facility}</h4>
                      <p className="text-xs text-slate-500">{r.department}</p>
                    </div>
                  </div>
                  <Badge type="referral" value={r.status} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Reason for Referral:
                    </span>
                    <span className="font-medium text-slate-800">{r.reason}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Priority Level:
                    </span>
                    <span className="font-semibold text-purple-700">{r.priority}</span>
                  </div>
                </div>

                {r.referralToken && (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-700 block">
                        Official Referral Token Slip:
                      </span>
                      <span className="font-mono font-black text-sm text-purple-950 tracking-wider">
                        {r.referralToken}
                      </span>
                    </div>
                    <span className="text-[10px] bg-purple-200 text-purple-900 px-2.5 py-1 rounded-md font-bold self-start sm:self-auto">
                      Show at Hospital Reception Desk
                    </span>
                  </div>
                )}

                {r.instructions && (
                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                    <strong>Instructions:</strong> {r.instructions}
                  </div>
                )}

                {/* Sequential Lifecycle Visualizer */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                    Referral Journey Progress
                  </span>
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-semibold">
                    {['CREATED', 'ACCEPTED', 'PATIENT ARRIVED', 'COMPLETED'].map((s, idx) => {
                      const stages = ['CREATED', 'ACCEPTED', 'PATIENT ARRIVED', 'COMPLETED'];
                      const currentIdx = stages.indexOf(r.status);
                      const isPastOrCurrent = idx <= currentIdx;
                      return (
                        <div
                          key={s}
                          className={`p-1.5 rounded-lg border ${
                            isPastOrCurrent
                              ? 'bg-purple-50 text-purple-800 border-purple-200 font-bold'
                              : 'bg-slate-50 text-slate-400 border-slate-100'
                          }`}
                        >
                          {s}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 4: Follow-ups */}
      {activeTab === 'followups' && (
        <div className="space-y-4">
          {(!followups || followups.length === 0) ? (
            <EmptyState
              title="No Follow-ups Scheduled"
              description="Your care team has not scheduled any routine check-ins."
            />
          ) : (
            followups.map((f) => (
              <Card key={f._id} className="p-5 bg-white border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Check-in: {formatDate(f.dueDate)}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Scheduled by Dr. {f.scheduledBy?.name || 'Doctor'}
                      </p>
                    </div>
                  </div>
                  <Badge type="followup" value={f.status} />
                </div>

                {f.instructions && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <strong>Instructions:</strong> {f.instructions}
                  </p>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 5: My Medical Documents */}
      {activeTab === 'records' && (
        <DocumentList
          patientId={patient._id || patient.id}
          patientName={patient.name}
          canUpload={false}
        />
      )}

      {/* TAB 6: Nearby Healthcare Facilities */}
      {activeTab === 'facilities' && (
        <NearbyFacilities
          currentDistrict={patient.district || 'Pune'}
          title="Nearby Healthcare Institutions & Bed Availability"
        />
      )}

      {/* Clinical Disclaimer in Patient Footer */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">
          {t('appName')} — {t('tagline')}
        </p>
        <p className="text-[11px] text-slate-400">
          {t('disclaimer')}
        </p>
      </div>
    </div>
  );
}
