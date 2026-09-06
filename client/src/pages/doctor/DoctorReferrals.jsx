import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Share2, Search, Filter, CheckCircle2, Clock, Plus, ArrowRight } from 'lucide-react';
import { referralAPI, patientAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { formatDate } from '../../utils/formatters';

export default function DoctorReferrals() {
  const { t } = useLanguage();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Status update modal
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [targetStatus, setTargetStatus] = useState('ACCEPTED');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

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

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedReferral) return;

    try {
      setUpdating(true);
      await referralAPI.updateStatus(selectedReferral._id, {
        status: targetStatus,
        note: statusNote || `Status updated to ${targetStatus}`,
      });
      setSelectedReferral(null);
      setStatusNote('');
      fetchReferrals();
    } catch (err) {
      console.error('Failed to update referral:', err);
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('referrals')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Hospital transfer tracking across 4 lifecycle stages: Created → Accepted → Patient Arrived → Completed.
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
              placeholder="Search by patient name, destination hospital, or reason..."
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
        <div className="space-y-4">
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
                    Village: {r.patientId?.village} • Age: {r.patientId?.age} • Phone: {r.patientId?.phone}
                  </p>
                </div>

                <Badge type="referral" value={r.status} size="md" />
              </div>

              <div className="py-3 text-xs sm:text-sm text-slate-700 space-y-1.5">
                <p>
                  <strong className="text-slate-900">Destination Facility:</strong> {r.facility} (
                  {r.department})
                </p>
                <p>
                  <strong className="text-slate-900">Referral Reason:</strong> {r.reason}
                </p>
                {r.instructions && (
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-xs">
                    <strong>Instructions:</strong> {r.instructions}
                  </p>
                )}
              </div>

              {/* Status Stepper Progression */}
              <div className="py-3 border-t border-slate-100 grid grid-cols-4 gap-2 text-center text-xs">
                {['CREATED', 'ACCEPTED', 'PATIENT ARRIVED', 'COMPLETED'].map((step, idx) => {
                  const statuses = ['CREATED', 'ACCEPTED', 'PATIENT ARRIVED', 'COMPLETED'];
                  const currentIndex = statuses.indexOf(r.status);
                  const stepIndex = statuses.indexOf(step);
                  const isDone = stepIndex <= currentIndex;

                  return (
                    <div
                      key={step}
                      className={`p-2 rounded-lg border text-[11px] font-medium ${
                        isDone
                          ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="block text-[10px] opacity-75">{idx + 1}</span>
                      <span className="truncate block">{step}</span>
                    </div>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Created: {formatDate(r.createdAt)} by Dr. {r.doctorId?.name}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedReferral(r);
                      setTargetStatus(
                        r.status === 'CREATED'
                          ? 'ACCEPTED'
                          : r.status === 'ACCEPTED'
                          ? 'PATIENT ARRIVED'
                          : 'COMPLETED'
                      );
                    }}
                  >
                    Update Status
                  </Button>

                  <Link to={`/doctor/patients/${r.patientId?._id}`}>
                    <Button size="sm" variant="secondary">
                      <span>Patient Chart</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Update Referral Status */}
      <Modal
        isOpen={!!selectedReferral}
        onClose={() => setSelectedReferral(null)}
        title="Update Referral Journey Status"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <p className="text-xs text-slate-600">
            Updating referral status for <strong>{selectedReferral?.patientId?.name}</strong> at{' '}
            <strong>{selectedReferral?.facility}</strong>.
          </p>

          <Select
            label="Select New Status"
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value)}
            options={[
              { value: 'CREATED', label: '1. CREATED - Referral initiated' },
              { value: 'ACCEPTED', label: '2. ACCEPTED - Facility confirmed slot' },
              { value: 'PATIENT ARRIVED', label: '3. PATIENT ARRIVED - Reached hospital' },
              { value: 'COMPLETED', label: '4. COMPLETED - Evaluation/tests finished' },
            ]}
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Status Change Note / Investigation Outcome
            </label>
            <textarea
              rows="3"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Patient seen in OPD, investigations done, discharged back to village with instructions..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedReferral(null)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={updating}>
              Confirm Status Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
