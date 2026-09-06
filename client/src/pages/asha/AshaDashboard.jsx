import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Share2,
  CalendarCheck,
  ArrowRight,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { dashboardAPI, followupAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function AshaDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    metrics: {
      totalPatients: 0,
      pendingReferrals: 0,
      upcomingFollowups: 0,
      recentlyRegistered: 0,
    },
    recentPatients: [],
    pendingFollowups: [],
    pendingReferrals: [],
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getAshaDashboard();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load ASHA dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const handleSynced = () => fetchDashboardData();
    window.addEventListener('swasthyasetu:synced', handleSynced);
    return () => window.removeEventListener('swasthyasetu:synced', handleSynced);
  }, []);

  const handleMarkFollowupComplete = async (followupId) => {
    try {
      await followupAPI.updateFollowup(followupId, {
        status: 'COMPLETED',
        notes: 'Follow-up marked completed by ASHA frontline worker',
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error completing follow-up:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('goodMorning')}, {user?.name || 'ASHA Worker'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('ashaHubSubtitle')}
          </p>
        </div>

        <Link to="/asha/register">
          <Button size="md" className="shadow-sm shadow-teal-700/20 w-full sm:w-auto">
            <UserPlus className="w-4 h-4 mr-2" />
            <span>{t('registerPatient')}</span>
          </Button>
        </Link>
      </div>

      {/* Summary Statistics */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonLoader count={4} />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-linear-to-br from-white via-white to-teal-50/40 border-slate-200/90 border-t-4 border-t-teal-600 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('totalPatients')}</span>
              <div className="w-8 h-8 rounded-xl bg-teal-100/70 text-teal-800 flex items-center justify-center shadow-xs">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{data.metrics.totalPatients}</div>
            <p className="text-[11px] text-teal-700 font-medium mt-1">Enrolled in village registry</p>
          </Card>

          <Card className="p-4 bg-linear-to-br from-white via-white to-purple-50/40 border-slate-200/90 border-t-4 border-t-purple-600 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('pendingReferrals')}</span>
              <div className="w-8 h-8 rounded-xl bg-purple-100/70 text-purple-800 flex items-center justify-center shadow-xs">
                <Share2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{data.metrics.pendingReferrals}</div>
            <p className="text-[11px] text-purple-700 font-medium mt-1">Hospital visits to coordinate</p>
          </Card>

          <Card className="p-4 bg-linear-to-br from-white via-white to-amber-50/40 border-slate-200/90 border-t-4 border-t-amber-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('upcomingFollowups')}</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shadow-xs">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{data.metrics.upcomingFollowups}</div>
            <p className="text-[11px] text-amber-700 font-medium mt-1">Due for wellness check</p>
          </Card>

          <Card className="p-4 bg-linear-to-br from-white via-white to-sky-50/40 border-slate-200/90 border-t-4 border-t-sky-600 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('recentlyRegistered')}</span>
              <div className="w-8 h-8 rounded-xl bg-sky-100/70 text-sky-800 flex items-center justify-center shadow-xs">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{data.metrics.recentlyRegistered}</div>
            <p className="text-[11px] text-sky-700 font-medium mt-1">Added in last 30 days</p>
          </Card>
        </div>
      )}

      {/* Main Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/asha/register">
          <button className="w-full p-3.5 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/60 transition-colors text-left flex items-center justify-between group">
            <div>
              <span className="font-semibold text-teal-900 text-xs sm:text-sm block">
                {t('registerPatient')}
              </span>
              <span className="text-[11px] text-teal-700">New household intake</span>
            </div>
            <UserPlus className="w-4 h-4 text-teal-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </Link>

        <Link to="/asha/patients">
          <button className="w-full p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left flex items-center justify-between group">
            <div>
              <span className="font-semibold text-slate-800 text-xs sm:text-sm block">
                {t('patients')}
              </span>
              <span className="text-[11px] text-slate-500">Search full registry</span>
            </div>
            <Users className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </Link>

        <Link to="/asha/referrals">
          <button className="w-full p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left flex items-center justify-between group">
            <div>
              <span className="font-semibold text-slate-800 text-xs sm:text-sm block">
                {t('referrals')}
              </span>
              <span className="text-[11px] text-slate-500">Track hospital transfer</span>
            </div>
            <Share2 className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </Link>

        <Link to="/asha/followups">
          <button className="w-full p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left flex items-center justify-between group">
            <div>
              <span className="font-semibold text-slate-800 text-xs sm:text-sm block">
                {t('followups')}
              </span>
              <span className="text-[11px] text-slate-500">Home visit schedule</span>
            </div>
            <CalendarCheck className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </Link>
      </div>

      {/* Grid: Pending Follow-ups & Active Referrals */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Follow-ups */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-amber-600" />
              <h2 className="font-semibold text-slate-900 text-sm">{t('upcomingFollowups')}</h2>
            </div>
            <Link to="/asha/followups" className="text-xs text-teal-700 hover:underline font-medium">
              View All
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader count={2} />
          ) : data.pendingFollowups.length === 0 ? (
            <EmptyState
              title={t('emptyStateFollowups')}
              description="No home follow-up visits pending for today."
            />
          ) : (
            <div className="space-y-2.5">
              {data.pendingFollowups.map((item) => (
                <div
                  key={item._id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                        {item.patientId?.name || 'Patient'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.patientId?.village}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{item.instructions}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-amber-800">
                      <Clock className="w-3 h-3" />
                      <span>Due: {formatDate(item.date)}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkFollowupComplete(item._id)}
                    className="shrink-0 text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-teal-600" />
                    <span>{t('markCompleted')}</span>
                  </Button>
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
              <h2 className="font-semibold text-slate-900 text-sm">{t('pendingReferrals')}</h2>
            </div>
            <Link to="/asha/referrals" className="text-xs text-teal-700 hover:underline font-medium">
              View All
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader count={2} />
          ) : data.pendingReferrals.length === 0 ? (
            <EmptyState
              title={t('emptyStateReferrals')}
              description="All patient referrals have completed their hospital cycle."
            />
          ) : (
            <div className="space-y-2.5">
              {data.pendingReferrals.map((ref) => (
                <div
                  key={ref._id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                        {ref.patientId?.name || 'Patient'}
                      </span>
                      <Badge type="referral" value={ref.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium text-purple-900">
                      {ref.facility} • {ref.department}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{ref.reason}</p>
                  </div>

                  <Link to={`/asha/referrals`}>
                    <Button size="sm" variant="ghost">
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Patients Table / List */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-900 text-sm sm:text-base">
              {t('recentPatients')}
            </h2>
            <p className="text-xs text-slate-500">Patients registered or screened in your village</p>
          </div>
          <Link to="/asha/patients" className="text-xs text-teal-700 hover:underline font-medium">
            View All Patients
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={3} type="table" />
        ) : data.recentPatients.length === 0 ? (
          <EmptyState
            title="No patients registered yet"
            description="Start by registering your first village patient."
            actionLabel={t('registerPatient')}
            onAction={() => (window.location.href = '/asha/register')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[11px] font-semibold">
                  <th className="pb-3 pr-4">Patient Name & ID</th>
                  <th className="pb-3 px-4">Demographics</th>
                  <th className="pb-3 px-4">Village</th>
                  <th className="pb-3 px-4">Last Visit</th>
                  <th className="pb-3 px-4">Risk Status</th>
                  <th className="pb-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentPatients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {p.name ? p.name[0]?.toUpperCase() : 'P'}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors block">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{p.patientId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {p.age} yrs • {p.gender}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{p.village}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {p.lastVisit?.visitDate ? formatDate(p.lastVisit.visitDate) : 'No visits'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge type="risk" value={p.currentRisk || 'PENDING_REVIEW'} size="sm" />
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <Link to={`/asha/patients/${p._id}`}>
                        <Button size="sm" variant="secondary" className="shadow-xs hover:border-teal-300">
                          {t('viewProfile')}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
