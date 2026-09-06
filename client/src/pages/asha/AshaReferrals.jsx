import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Share2, Search, Filter, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { referralAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function AshaReferrals() {
  const { t } = useLanguage();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await referralAPI.getReferrals(params);
      if (res.data.success) {
        setReferrals(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [statusFilter, search]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await referralAPI.updateStatus(id, {
        status: newStatus,
        note: `Updated to ${newStatus} by ASHA worker`,
      });
      fetchReferrals();
    } catch (err) {
      console.error('Failed to update referral status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('referrals')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Coordinate and track village patient referrals to secondary and tertiary hospitals.
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, facility, or department..."
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
              <option value="CREATED">{t('statusCreated')}</option>
              <option value="ACCEPTED">{t('statusAccepted')}</option>
              <option value="PATIENT ARRIVED">{t('statusArrived')}</option>
              <option value="COMPLETED">{t('statusCompleted')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <SkeletonLoader count={3} />
      ) : referrals.length === 0 ? (
        <EmptyState
          title={t('emptyStateReferrals')}
          description="There are currently no referrals matching your filter criteria."
        />
      ) : (
        <div className="space-y-3.5">
          {referrals.map((r) => (
            <Card key={r._id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-900 text-base">
                      {r.patientId?.name || 'Patient'}
                    </span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {r.patientId?.patientId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        r.priority === 'EMERGENCY'
                          ? 'bg-red-100 text-red-800'
                          : r.priority === 'URGENT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {r.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Village: {r.patientId?.village} • Phone: {r.patientId?.phone}
                  </p>
                </div>

                <Badge type="referral" value={r.status} size="md" />
              </div>

              <div className="py-3 text-xs sm:text-sm text-slate-700 space-y-1.5">
                <p>
                  <strong className="text-slate-900">Destination Hospital:</strong> {r.facility} (
                  {r.department})
                </p>
                <p>
                  <strong className="text-slate-900">Clinical Reason:</strong> {r.reason}
                </p>
                {r.instructions && (
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-xs">
                    <strong>Instructions:</strong> {r.instructions}
                  </p>
                )}
              </div>

              {/* Status progression actions for ASHA */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Referred on: {formatDate(r.createdAt)} by Dr. {r.doctorId?.name}
                </span>

                <div className="flex items-center gap-2">
                  {r.status === 'ACCEPTED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={updatingId === r._id}
                      onClick={() => handleUpdateStatus(r._id, 'PATIENT ARRIVED')}
                    >
                      Mark Patient Arrived
                    </Button>
                  )}

                  {r.status === 'PATIENT ARRIVED' && (
                    <Button
                      size="sm"
                      variant="success"
                      loading={updatingId === r._id}
                      onClick={() => handleUpdateStatus(r._id, 'COMPLETED')}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      {t('markCompleted')}
                    </Button>
                  )}

                  <Link to={`/asha/patients/${r.patientId?._id}`}>
                    <Button size="sm" variant="secondary">
                      <span>{t('viewProfile')}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
