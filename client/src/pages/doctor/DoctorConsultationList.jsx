import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Search, ArrowRight, User } from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function DoctorConsultationList() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true);
        const res = await dashboardAPI.getDoctorDashboard();
        if (res.data.success) {
          setConsultations(res.data.data.recentConsultations || []);
        }
      } catch (err) {
        console.error('Failed to load consultations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultations();
  }, []);

  const filtered = consultations.filter((c) => {
    if (!search.trim()) return true;
    const name = c.patientId?.name || '';
    const pid = c.patientId?.patientId || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      pid.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('consultations')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Clinical examination notes, treatment prescriptions, and physician assessments.
        </p>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search consultations by patient name or ID..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-teal-100"
          />
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <SkeletonLoader count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No consultations found"
          description="Start a consultation from the Pending Reviews queue or patient profile."
        />
      ) : (
        <div className="space-y-3.5">
          {filtered.map((c) => (
            <Card key={c._id} className="p-5">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{c.patientId?.name}</span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {c.patientId?.patientId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.patientId?.age} yrs • {c.patientId?.gender} • Village: {c.patientId?.village}
                  </p>
                </div>
                <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
              </div>

              <div className="py-3 text-xs sm:text-sm text-slate-700 space-y-1.5">
                <p>
                  <strong className="text-slate-900">Clinical Assessment:</strong> {c.assessment}
                </p>
                <p>
                  <strong className="text-slate-900">Doctor Observations:</strong> {c.observations}
                </p>
                {c.advice && (
                  <p>
                    <strong className="text-slate-900">Advice:</strong> {c.advice}
                  </p>
                )}
                {c.treatmentInstructions && (
                  <div className="p-2.5 bg-indigo-50/50 rounded-lg text-xs text-indigo-900 border border-indigo-100 mt-2">
                    <strong>Rx / Prescription:</strong> {c.treatmentInstructions}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <Link to={`/doctor/patients/${c.patientId?._id}`}>
                  <Button size="sm" variant="secondary">
                    <span>View Patient History</span>
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
