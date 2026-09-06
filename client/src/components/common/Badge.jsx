import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Badge({
  type = 'default',
  value = '',
  size = 'md',
  showIcon = true,
  className = '',
}) {
  const { t } = useLanguage();

  const normalized = (value || '').toUpperCase();

  // Risk badges
  if (type === 'risk' || ['GREEN', 'YELLOW', 'RED', 'PENDING_REVIEW'].includes(normalized)) {
    if (normalized === 'PENDING_REVIEW') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold bg-slate-100 text-slate-700 border border-slate-300/80 rounded-full px-2.5 py-0.5 shadow-2xs ${
            size === 'sm' ? 'text-xs' : 'text-sm'
          } ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-slate-500" />}
          <span>{t('riskPending')}</span>
        </span>
      );
    }
    if (normalized === 'RED') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold bg-red-50 text-red-700 border border-red-300 shadow-2xs rounded-full px-2.5 py-0.5 ${
            size === 'sm' ? 'text-xs' : 'text-sm'
          } ${className}`}
        >
          {showIcon && <ShieldAlert className="w-3.5 h-3.5 text-red-600 animate-pulse" />}
          <span>{t('riskRed')}</span>
        </span>
      );
    }
    if (normalized === 'YELLOW') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs rounded-full px-2.5 py-0.5 ${
            size === 'sm' ? 'text-xs' : 'text-sm'
          } ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
          <span>{t('riskYellow')}</span>
        </span>
      );
    }
    // Default GREEN
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs rounded-full px-2.5 py-0.5 ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        } ${className}`}
      >
        {showIcon && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
        <span>{t('riskGreen')}</span>
      </span>
    );
  }

  // Referral status badges
  if (type === 'referral') {
    switch (normalized) {
      case 'CREATED':
        return (
          <span className="inline-flex items-center gap-1 font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 text-xs">
            <Clock className="w-3 h-3" />
            <span>{t('statusCreated')}</span>
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2.5 py-0.5 text-xs">
            <CheckCircle className="w-3 h-3" />
            <span>{t('statusAccepted')}</span>
          </span>
        );
      case 'PATIENT ARRIVED':
        return (
          <span className="inline-flex items-center gap-1 font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-2.5 py-0.5 text-xs">
            <Clock className="w-3 h-3" />
            <span>{t('statusArrived')}</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 font-medium bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 text-xs">
            <CheckCircle className="w-3 h-3" />
            <span>{t('statusCompleted')}</span>
          </span>
        );
      default:
        return <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-700">{value}</span>;
    }
  }

  // Follow-up status badges
  if (type === 'followup') {
    switch (normalized) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-2.5 py-0.5 text-xs">
            <Clock className="w-3 h-3" />
            <span>{t('statusPending')}</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 font-medium bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 text-xs">
            <CheckCircle className="w-3 h-3" />
            <span>{t('statusCompleted')}</span>
          </span>
        );
      case 'MISSED':
        return (
          <span className="inline-flex items-center gap-1 font-medium bg-red-50 text-red-700 border border-red-200 rounded-full px-2.5 py-0.5 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>{t('statusMissed')}</span>
          </span>
        );
      default:
        return <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-700">{value}</span>;
    }
  }

  // Generic badge
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium bg-slate-100 text-slate-700 rounded-full px-2.5 py-0.5 text-xs ${className}`}
    >
      {value}
    </span>
  );
}
