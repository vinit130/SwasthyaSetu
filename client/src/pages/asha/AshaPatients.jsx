import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, UserPlus, Users, ArrowUpDown } from 'lucide-react';
import { patientAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import PatientCard from '../../components/patient/PatientCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { storage } from '../../utils/storage';
import { useOffline } from '../../context/OfflineContext';

export default function AshaPatients() {
  const { t } = useLanguage();
  const { isOnline } = useOffline();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      if (!isOnline) {
        // Fallback to local cache
        const cached = storage.getCachedPatients() || [];
        let filtered = cached;
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name?.toLowerCase().includes(q) ||
              p.patientId?.toLowerCase().includes(q) ||
              p.phone?.includes(q) ||
              p.village?.toLowerCase().includes(q)
          );
        }
        if (riskFilter) {
          filtered = filtered.filter((p) => (p.currentRisk || 'PENDING_REVIEW') === riskFilter);
        }
        setPatients(filtered);
        return;
      }

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (riskFilter) params.risk = riskFilter;

      const res = await patientAPI.getPatients(params);
      if (res.data.success) {
        setPatients(res.data.data);
        storage.setCachedPatients(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch patients, falling back to cache:', err);
      const cached = storage.getCachedPatients() || [];
      setPatients(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatients();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, riskFilter, isOnline]);

  // Listen for sync completion event to reload fresh data
  useEffect(() => {
    const handleSynced = () => {
      fetchPatients();
    };
    window.addEventListener('swasthyasetu:synced', handleSynced);
    return () => window.removeEventListener('swasthyasetu:synced', handleSynced);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{t('patients')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Village registry, longitudinal profiles and frontline screenings.
          </p>
        </div>

        <Link to="/asha/register">
          <Button size="md" className="w-full sm:w-auto shadow-sm">
            <UserPlus className="w-4 h-4 mr-2" />
            <span>{t('registerPatient')}</span>
          </Button>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-teal-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full md:w-48 py-2 px-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-teal-600 dark:focus:border-teal-500"
            >
              <option value="">{t('allCases')}</option>
              <option value="PENDING_REVIEW">{t('riskPending')}</option>
              <option value="GREEN">{t('riskGreen')}</option>
              <option value="YELLOW">{t('riskYellow')}</option>
              <option value="RED">{t('riskRed')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Content: Mobile Cards & Desktop Table */}
      {loading ? (
        <SkeletonLoader count={4} />
      ) : patients.length === 0 ? (
        <EmptyState
          title={t('emptyStatePatients')}
          description="Try changing your search terms or register a new patient."
          actionLabel={t('registerPatient')}
          onAction={() => (window.location.href = '/asha/register')}
        />
      ) : (
        <>
          {/* Mobile Grid */}
          <div className="grid sm:grid-cols-2 lg:hidden gap-4">
            {patients.map((p) => (
              <PatientCard key={p._id} patient={p} />
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-5">Patient Name</th>
                  <th className="py-3 px-4">Patient ID</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Village</th>
                  <th className="py-3 px-4">Last Visit</th>
                  <th className="py-3 px-4">Risk Status</th>
                  <th className="py-3 px-4">Follow-up</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900 dark:text-white">{p.name}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">{p.patientId}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-xs">
                      {p.age} yrs • {p.gender}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-xs">{p.village}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                      {p.latestVisit?.visitDate ? formatDate(p.latestVisit.visitDate) : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge type="risk" value={p.currentRisk || 'GREEN'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      {p.pendingFollowup ? (
                        <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                          {formatDate(p.pendingFollowup.date)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/asha/patients/${p._id}`}>
                          <Button size="sm" variant="secondary">
                            {t('viewProfile')}
                          </Button>
                        </Link>
                        <Link to={`/asha/patients/${p._id}/symptoms`}>
                          <Button size="sm" variant="outline" title="Add Symptoms & Vitals">
                            + Vitals
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
