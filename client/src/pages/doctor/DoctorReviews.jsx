import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Filter, AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight, User } from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function DoctorReviews() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [filterRisk, setFilterRisk] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getDoctorDashboard();
      if (res.data.success) {
        setReviews(res.data.data.patientsRequiringReview || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const redCount = reviews.filter((v) => v.riskLevel === 'RED').length;
  const yellowCount = reviews.filter((v) => v.riskLevel === 'YELLOW').length;
  const greenCount = reviews.filter((v) => v.riskLevel === 'GREEN').length;

  const filteredReviews = reviews.filter((v) => {
    if (!filterRisk) return true;
    return v.riskLevel === filterRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('pendingReviews')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Frontline ASHA screenings awaiting physician assessment, prioritized by clinical urgency.
        </p>
      </div>

      {/* Filter */}
      <Card className="p-4 flex items-center justify-between flex-wrap gap-3 bg-white border-slate-200">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span>{t('filter')}:</span>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setFilterRisk('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterRisk === '' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('allCases')} ({reviews.length})
          </button>
          <button
            onClick={() => setFilterRisk('RED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterRisk === 'RED' ? 'bg-red-600 text-white shadow-xs' : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <span>{t('riskRed')}</span>
            <span className="text-[11px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold">{redCount}</span>
          </button>
          <button
            onClick={() => setFilterRisk('YELLOW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterRisk === 'YELLOW' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <span>{t('riskYellow')}</span>
            <span className="text-[11px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold">{yellowCount}</span>
          </button>
          {greenCount > 0 && (
            <button
              onClick={() => setFilterRisk('GREEN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterRisk === 'GREEN' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <span>{t('riskGreen')}</span>
              <span className="text-[11px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold">{greenCount}</span>
            </button>
          )}
        </div>
      </Card>

      {/* Queue List */}
      {loading ? (
        <SkeletonLoader count={3} />
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          title={t('emptyStateReviews')}
          description="All patient screening cases have been evaluated."
        />
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((visit) => {
            const p = visit.patientId;
            const isRed = visit.riskLevel === 'RED';
            const isYellow = visit.riskLevel === 'YELLOW';
            return (
              <Card
                key={visit._id}
                className={`p-5 transition-all border ${
                  isRed
                    ? 'bg-red-50/50 border-red-300 border-l-4 border-l-red-500 shadow-xs'
                    : isYellow
                    ? 'bg-amber-50/25 border-slate-200 border-l-4 border-l-amber-500 hover:border-amber-300'
                    : 'bg-white border-slate-200 border-l-4 border-l-emerald-500 hover:border-emerald-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                        isRed ? 'bg-red-200 text-red-900' : isYellow ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {p?.name ? p.name[0]?.toUpperCase() : 'P'}
                      </div>
                      <span className="font-bold text-slate-900 text-base">{p?.name}</span>
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {p?.patientId}
                      </span>
                      <Badge type="risk" value={visit.riskLevel} size="sm" />
                      {isRed && (
                        <span className="text-[10px] uppercase font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded animate-pulse">
                          Immediate Attention
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 pl-11">
                      {p?.age} yrs • {p?.gender} • Village: <span className="font-medium text-slate-700">{p?.village}</span>, {p?.district} • Phone: {p?.phone}
                    </p>
                  </div>

                  <span className="text-xs text-slate-400">
                    Screened: {formatDate(visit.visitDate)} by {visit.recordedBy?.name || 'ASHA'}
                  </span>
                </div>

                <div className="py-3 text-xs space-y-2">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Reported Symptoms:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {visit.symptoms?.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-medium text-slate-800"
                        >
                          {s.name} ({s.severity} - {s.duration})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Vitals summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-700">
                    {visit.vitals?.temperature && (
                      <div className={`p-2 rounded-lg border ${
                        parseFloat(visit.vitals.temperature) >= 38.0
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-slate-50 border-slate-100'
                      }`}>
                        <span className="text-[10px] text-slate-400 block">Temperature</span>
                        <span className="font-semibold">{visit.vitals.temperature}°C</span>
                      </div>
                    )}
                    {visit.vitals?.bloodPressure?.systolic && (
                      <div className={`p-2 rounded-lg border ${
                        visit.vitals.bloodPressure.systolic >= 140 || visit.vitals.bloodPressure.diastolic >= 90
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-slate-50 border-slate-100'
                      }`}>
                        <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                        <span className="font-semibold">
                          {visit.vitals.bloodPressure.systolic}/{visit.vitals.bloodPressure.diastolic}
                        </span>
                      </div>
                    )}
                    {visit.vitals?.spO2 && (
                      <div className={`p-2 rounded-lg border ${
                        visit.vitals.spO2 < 92
                          ? 'bg-red-50 border-red-300 text-red-900 font-bold'
                          : visit.vitals.spO2 < 95
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-slate-50 border-slate-100'
                      }`}>
                        <span className="text-[10px] text-slate-400 block">SpO2 Oxygen</span>
                        <span className="font-semibold">{visit.vitals.spO2}%</span>
                      </div>
                    )}
                    {visit.vitals?.heartRate && (
                      <div className={`p-2 rounded-lg border ${
                        visit.vitals.heartRate > 100 || visit.vitals.heartRate < 50
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-slate-50 border-slate-100'
                      }`}>
                        <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                        <span className="font-semibold">{visit.vitals.heartRate} bpm</span>
                      </div>
                    )}
                  </div>

                  {visit.riskReasons?.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
                      <strong>Clinical Triggers:</strong> {visit.riskReasons.join('; ')}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <Link to={`/doctor/patients/${p?._id}`}>
                    <Button variant="secondary" size="sm">
                      View Clinical Chart
                    </Button>
                  </Link>
                  <Link to={`/doctor/patients/${p?._id}/review`}>
                    <Button variant="outline" size="sm">
                      {t('reviewPatient')}
                    </Button>
                  </Link>
                  <Link to={`/doctor/consultations/new?patientId=${p?._id}`}>
                    <Button size="sm" variant={isRed ? 'danger' : 'primary'}>
                      <span>{t('startConsultation')}</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
