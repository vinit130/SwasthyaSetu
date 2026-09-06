import React from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Phone, Calendar, ArrowRight, Activity } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function PatientCard({ patient }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR';

  const profileLink = isDoctor ? `/doctor/patients/${patient._id}` : `/asha/patients/${patient._id}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-300 transition-all p-4 md:p-5 flex flex-col justify-between">
      <div>
        {/* Header: Name, ID, Risk */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div>
            <h3 className="font-semibold text-slate-900 text-base leading-snug">
              {patient.name}
            </h3>
            <span className="inline-block text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1">
              {patient.patientId || 'ID Pending'}
            </span>
          </div>
          <Badge type="risk" value={patient.currentRisk || 'GREEN'} />
        </div>

        {/* Demographic Information */}
        <div className="space-y-1.5 text-xs text-slate-600 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {patient.age} yrs • {patient.gender}
              {patient.bloodGroup && patient.bloodGroup !== 'Unknown' && ` • Blood: ${patient.bloodGroup}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {patient.village}, {patient.district}
            </span>
          </div>

          {patient.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{patient.phone}</span>
            </div>
          )}

          {patient.latestVisit?.visitDate && (
            <div className="flex items-center gap-2 text-slate-500 pt-1 border-t border-slate-100">
              <Activity className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>
                Last Visit: {formatDate(patient.latestVisit.visitDate)}
              </span>
            </div>
          )}
        </div>

        {/* Pending Follow-up alert if any */}
        {patient.pendingFollowup && (
          <div className="mb-3.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between">
            <span>Follow-up: {formatDate(patient.pendingFollowup.date)}</span>
            <span className="font-medium text-amber-700 uppercase text-[10px]">Scheduled</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
        <Link to={profileLink} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full justify-between">
            <span>{isDoctor ? t('reviewPatient') : t('viewProfile')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>

        {!isDoctor && (
          <Link to={`/asha/patients/${patient._id}/symptoms`}>
            <Button variant="outline" size="sm" title={t('addSymptomsVitals')}>
              <Activity className="w-3.5 h-3.5 text-teal-600" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
