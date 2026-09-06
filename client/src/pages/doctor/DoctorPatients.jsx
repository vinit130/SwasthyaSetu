import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Stethoscope, ArrowRight, User } from 'lucide-react';
import { patientAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import PatientCard from '../../components/patient/PatientCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function DoctorPatients() {
  const { t } = useLanguage();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (riskFilter) params.risk = riskFilter;

      const res = await patientAPI.getPatients(params);
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch doctor patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatients();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, riskFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('patients')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete patient clinical registry and longitudinal care journeys.
        </p>
      </div>

      {/* Search & Filter */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-teal-100 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full md:w-48 py-2 px-3 text-sm rounded-xl border border-slate-300 bg-white focus:border-teal-600"
            >
              <option value="">{t('allCases')}</option>
              <option value="RED">{t('riskRed')}</option>
              <option value="YELLOW">{t('riskYellow')}</option>
              <option value="GREEN">{t('riskGreen')}</option>
              <option value="PENDING_REVIEW">{t('riskPending')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* List / Table */}
      {loading ? (
        <SkeletonLoader count={4} />
      ) : patients.length === 0 ? (
        <EmptyState
          title={t('emptyStatePatients')}
          description="No patients match your search criteria."
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
          <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-5">Patient Name & ID</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Village</th>
                  <th className="py-3 px-4">Latest Visit</th>
                  <th className="py-3 px-4">Triage Risk</th>
                  <th className="py-3 px-4">Follow-up</th>
                  <th className="py-3 px-5 text-right">Clinical Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-slate-900 block">{p.name}</span>
                      <span className="text-xs font-mono text-slate-400">{p.patientId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {p.age} yrs • {p.gender}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{p.village}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {p.latestVisit?.visitDate ? formatDate(p.latestVisit.visitDate) : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge type="risk" value={p.currentRisk || 'GREEN'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {p.pendingFollowup ? (
                        <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                          {formatDate(p.pendingFollowup.date)}
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link to={`/doctor/patients/${p._id}`}>
                        <Button size="sm" variant="secondary">
                          <span>Review Patient</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
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
