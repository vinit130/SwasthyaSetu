import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Clock,
  Share2,
  CalendarCheck,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Activity,
  User,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { dashboardAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    metrics: {
      patientsAwaitingReview: 0,
      todayConsultations: 0,
      pendingReferrals: 0,
      upcomingFollowups: 0,
    },
    patientsRequiringReview: [],
    recentConsultations: [],
    pendingReferrals: [],
    upcomingFollowups: [],
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await dashboardAPI.getDoctorDashboard();
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load doctor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('goodMorning')}, {user?.name || 'Doctor'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('doctorHubSubtitle')}
          </p>
        </div>

        <Link to="/doctor/reviews">
          <Button size="md" className="shadow-sm shadow-teal-700/20">
            <Clock className="w-4 h-4 mr-2" />
            <span>{t('reviewQueue')} ({data.metrics.patientsAwaitingReview})</span>
          </Button>
        </Link>
      </div>

      {/* Metric Counters */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonLoader count={4} />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-linear-to-br from-white via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 border-slate-200/90 dark:border-slate-800 border-t-4 border-t-amber-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('patientsAwaitingReview')}</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100/70 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {data.metrics.patientsAwaitingReview}
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-1">Frontline triage queue</p>
          </Card>

          <Card className="p-4 bg-linear-to-br from-white via-white to-teal-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/20 border-slate-200/90 dark:border-slate-800 border-t-4 border-t-teal-600 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('todayConsultations')}</span>
              <div className="w-8 h-8 rounded-xl bg-teal-100/70 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 flex items-center justify-center shadow-xs">
                <Stethoscope className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {data.metrics.todayConsultations}
            </div>
            <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium mt-1">Confirmed reviews</p>
          </Card>

          <Card className="p-4 bg-linear-to-br from-white via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 border-slate-200/90 dark:border-slate-800 border-t-4 border-t-indigo-600 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('activeReferrals')}</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100/70 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 flex items-center justify-center shadow-xs">
                <Share2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {data.metrics.activeReferrals}
            </div>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium mt-1">Active transfers</p>
          </Card>

          <Card className="p-4 bg-linear-to-br from-white via-white to-sky-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-sky-950/20 border-slate-200/90 dark:border-slate-800 border-t-4 border-t-sky-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('upcomingFollowups')}</span>
              <div className="w-8 h-8 rounded-xl bg-sky-100/70 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 flex items-center justify-center shadow-xs">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {data.metrics.upcomingFollowups}
            </div>
            <p className="text-[11px] text-sky-700 dark:text-sky-400 font-medium mt-1">Scheduled checks</p>
          </Card>
        </div>
      )}

      {/* Main Section: Patients Requiring Review */}
      <Card className="p-6 border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {t('reviewQueue')}
            </h2>
            <p className="text-xs text-slate-500">
              Cases screened by ASHA/ANM workers prioritized by physiological risk level.
            </p>
          </div>
          <Link to="/doctor/reviews" className="text-xs text-teal-700 hover:underline font-medium">
            {t('all')} ({data.metrics.patientsAwaitingReview})
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={3} />
        ) : data.patientsRequiringReview.length === 0 ? (
          <EmptyState
            title="All patient reviews up to date"
            description="There are currently no unreviewed frontline screening cases."
          />
        ) : (
          <div className="space-y-3.5">
            {data.patientsRequiringReview.map((visit) => {
              const p = visit.patientId;
              const isRed = visit.riskLevel === 'RED';
              const isYellow = visit.riskLevel === 'YELLOW';
              return (
                <div
                  key={visit._id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isRed
                      ? 'bg-red-50/50 border-red-300 border-l-4 border-l-red-500 shadow-xs'
                      : isYellow
                      ? 'bg-amber-50/30 border-slate-200 border-l-4 border-l-amber-500 hover:border-amber-300'
                      : 'bg-white border-slate-200 border-l-4 border-l-emerald-500 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                        isRed ? 'bg-red-200 text-red-900' : isYellow ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {p?.name ? p.name[0]?.toUpperCase() : 'P'}
                      </div>
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
                        {p?.name || 'Patient'}
                      </span>
                      <span className="font-mono text-xs text-slate-500 bg-white/80 border border-slate-200 px-2 py-0.5 rounded">
                        {p?.patientId}
                      </span>
                      <Badge type="risk" value={visit.riskLevel} size="sm" />
                      {isRed && (
                        <span className="text-[10px] uppercase font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded animate-pulse">
                          Immediate Attention
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 pl-11">
                      {p?.age} yrs • {p?.gender} • Village: <span className="font-medium">{p?.village}</span>
                    </p>

                    {/* Symptoms summary */}
                    <div className="flex flex-wrap gap-1.5 pt-1 pl-11">
                      {visit.symptoms?.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium text-slate-700"
                        >
                          {s.name} ({s.severity})
                        </span>
                      ))}
                    </div>

                    {/* Reasons list */}
                    {visit.riskReasons?.length > 0 && (
                      <p className="text-[11px] text-slate-500 italic pl-11">
                        Triggers: {visit.riskReasons.join('; ')}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-2">
                    <Link to={`/doctor/patients/${p?._id}/review`}>
                      <Button size="md" variant={isRed ? 'danger' : 'primary'} className="shadow-xs">
                        <span>{t('reviewPatient')}</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Grid: Recent Consultations & Active Referrals */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Consultations */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <h2 className="font-semibold text-slate-900 text-sm">Recent Consultations</h2>
            </div>
            <Link to="/doctor/consultations" className="text-xs text-teal-700 hover:underline font-medium">
              View All
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader count={2} />
          ) : data.recentConsultations.length === 0 ? (
            <EmptyState
              title="No consultations yet"
              description="Record your first consultation from the review queue."
            />
          ) : (
            <div className="space-y-2.5">
              {data.recentConsultations.map((c) => (
                <div
                  key={c._id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-semibold text-slate-900 text-xs sm:text-sm block">
                      {c.patientId?.name || 'Patient'} ({c.patientId?.patientId})
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                      <strong>Impression:</strong> {c.assessment}
                    </p>
                    <span className="text-[10px] text-slate-400">{formatDate(c.createdAt)}</span>
                  </div>

                  <Link to={`/doctor/patients/${c.patientId?._id}`}>
                    <Button size="sm" variant="secondary">
                      Profile
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Referrals */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-600" />
              <h2 className="font-semibold text-slate-900 text-sm">Active Referrals</h2>
            </div>
            <Link to="/doctor/referrals" className="text-xs text-teal-700 hover:underline font-medium">
              View All
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader count={2} />
          ) : data.pendingReferrals.length === 0 ? (
            <EmptyState
              title="No active referrals"
              description="No pending patient hospital referrals."
            />
          ) : (
            <div className="space-y-2.5">
              {data.pendingReferrals.map((r) => (
                <div
                  key={r._id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                        {r.patientId?.name || 'Patient'}
                      </span>
                      <Badge type="referral" value={r.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium text-purple-900">
                      {r.facility} ({r.department})
                    </p>
                    <span className="text-[10px] text-slate-400">{formatDate(r.createdAt)}</span>
                  </div>

                  <Link to="/doctor/referrals">
                    <Button size="sm" variant="secondary">
                      Track
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
