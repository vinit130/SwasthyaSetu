import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Search, Filter, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { followupAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function DoctorFollowups() {
  const { t } = useLanguage();
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await followupAPI.getFollowups(params);
      if (res.data.success) {
        setFollowups(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load followups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, [statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('followups')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor follow-up completion, frontline worker home visit reports, and patient recovery.
        </p>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, village, or instructions..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-teal-100"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 py-2 px-3 text-sm rounded-xl border border-slate-300 bg-white focus:border-teal-600"
            >
              <option value="">{t('all')}</option>
              <option value="PENDING">{t('statusPending')}</option>
              <option value="COMPLETED">{t('statusDone')}</option>
              <option value="MISSED">{t('statusMissed')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <SkeletonLoader count={3} />
      ) : followups.length === 0 ? (
        <EmptyState
          title={t('emptyStateFollowups')}
          description="There are currently no follow-ups matching your criteria."
        />
      ) : (
        <div className="space-y-3.5">
          {followups.map((f) => (
            <Card key={f._id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">
                      {f.patientId?.name || 'Patient'}
                    </span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {f.patientId?.patientId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Village: {f.patientId?.village} • Age: {f.patientId?.age} • Phone: {f.patientId?.phone}
                  </p>
                </div>

                <Badge type="followup" value={f.status} size="md" />
              </div>

              <div className="py-3 text-xs sm:text-sm text-slate-700 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 font-semibold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Scheduled Date: {formatDate(f.date)}</span>
                </div>
                <p>
                  <strong className="text-slate-900">Clinical Instructions:</strong> {f.instructions}
                </p>
                {f.notes && (
                  <p className="text-slate-700 text-xs bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                    <strong className="text-emerald-900">Frontline Visit Notes:</strong> {f.notes}
                    {f.completedBy && (
                      <span className="block text-[11px] text-emerald-800 mt-0.5">
                        Verified by: {f.completedBy?.name} on {formatDate(f.completedAt)}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <Link to={`/doctor/patients/${f.patientId?._id}`}>
                  <Button size="sm" variant="secondary">
                    <span>Patient Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
