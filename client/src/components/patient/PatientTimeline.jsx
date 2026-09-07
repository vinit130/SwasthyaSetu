import React from 'react';
import {
  UserPlus,
  Activity,
  Stethoscope,
  Share2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Hospital,
  FileText,
  AlertOctagon,
} from 'lucide-react';
import Badge from '../common/Badge';
import { formatDateTime, formatDate } from '../../utils/formatters';

export default function PatientTimeline({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-400">
        No recorded clinical timeline events for this patient yet.
      </div>
    );
  }

  const getEventIcon = (type, badge) => {
    switch (type) {
      case 'REGISTRATION':
        return <UserPlus className="w-4 h-4 text-teal-600" />;
      case 'VISIT':
        return <Activity className="w-4 h-4 text-sky-600" />;
      case 'CONSULTATION':
        return <Stethoscope className="w-4 h-4 text-indigo-600" />;
      case 'REFERRAL':
        return <Share2 className="w-4 h-4 text-purple-600" />;
      case 'HOSPITAL_ENCOUNTER':
      case 'HOSPITAL_TREATMENT':
        return <Hospital className="w-4 h-4 text-indigo-600" />;
      case 'EMERGENCY_ENCOUNTER':
        return <AlertOctagon className="w-4 h-4 text-red-600" />;
      case 'MEDICAL_DOCUMENT':
      case 'DOCUMENT':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'FOLLOWUP':
        return <CalendarCheck className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((event, index) => (
        <div key={index} className="relative group">
          {/* Node dot */}
          <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-slate-300 group-hover:border-teal-600 flex items-center justify-center transition-colors shadow-xs">
            {getEventIcon(event.type, event.badge)}
          </div>

          <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-4 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {event.type}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">{formatDateTime(event.date)}</span>
              </div>
              {event.badge && (
                <Badge
                  type={
                    event.type === 'VISIT'
                      ? 'risk'
                      : event.type === 'REFERRAL'
                      ? 'referral'
                      : event.type === 'FOLLOWUP'
                      ? 'followup'
                      : 'default'
                  }
                  value={event.badge}
                  size="sm"
                />
              )}
            </div>

            <h4 className="text-sm font-semibold text-slate-900">{event.title}</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{event.description}</p>

            {/* If visit, show symptoms or vitals pills */}
            {event.type === 'VISIT' && event.data && (
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {event.data.vitals?.temperature && (
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px]">Temp</span>
                    <span className="font-semibold text-slate-700">{event.data.vitals.temperature}°C</span>
                  </div>
                )}
                {event.data.vitals?.bloodPressure?.systolic && (
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px]">BP</span>
                    <span className="font-semibold text-slate-700">
                      {event.data.vitals.bloodPressure.systolic}/{event.data.vitals.bloodPressure.diastolic}
                    </span>
                  </div>
                )}
                {event.data.vitals?.spO2 && (
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px]">SpO2</span>
                    <span className="font-semibold text-slate-700">{event.data.vitals.spO2}%</span>
                  </div>
                )}
                {event.data.vitals?.heartRate && (
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px]">Pulse</span>
                    <span className="font-semibold text-slate-700">{event.data.vitals.heartRate} bpm</span>
                  </div>
                )}
              </div>
            )}

            {/* If consultation, show doctor treatment */}
            {event.type === 'CONSULTATION' && event.data && event.data.treatmentInstructions && (
              <div className="mt-2.5 p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs">
                <span className="font-semibold text-indigo-900 block mb-0.5">Rx / Treatment Advice:</span>
                <span className="text-indigo-800">{event.data.treatmentInstructions}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
