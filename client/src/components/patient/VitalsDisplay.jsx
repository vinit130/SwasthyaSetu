import React from 'react';
import { Thermometer, Heart, Activity, Wind, Scale, Gauge } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function VitalsDisplay({ vitals = {} }) {
  const { t } = useLanguage();

  if (!vitals || Object.keys(vitals).length === 0) {
    return <p className="text-xs text-slate-400">No vitals recorded.</p>;
  }

  const items = [
    {
      label: t('temperature'),
      value: vitals.temperature ? `${vitals.temperature} °C` : '-',
      icon: Thermometer,
      isAbnormal: vitals.temperature >= 38.0 || vitals.temperature < 35.5,
    },
    {
      label: t('bloodPressure'),
      value:
        vitals.bloodPressure?.systolic && vitals.bloodPressure?.diastolic
          ? `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg`
          : '-',
      icon: Gauge,
      isAbnormal:
        vitals.bloodPressure?.systolic >= 140 ||
        vitals.bloodPressure?.diastolic >= 90 ||
        vitals.bloodPressure?.systolic < 90,
    },
    {
      label: t('spO2'),
      value: vitals.spO2 ? `${vitals.spO2} %` : '-',
      icon: Activity,
      isAbnormal: vitals.spO2 && vitals.spO2 < 95,
    },
    {
      label: t('heartRate'),
      value: vitals.heartRate ? `${vitals.heartRate} bpm` : '-',
      icon: Heart,
      isAbnormal: vitals.heartRate > 100 || vitals.heartRate < 60,
    },
    {
      label: t('respiratoryRate'),
      value: vitals.respiratoryRate ? `${vitals.respiratoryRate} /min` : '-',
      icon: Wind,
      isAbnormal: vitals.respiratoryRate > 22 || vitals.respiratoryRate < 12,
    },
    {
      label: t('weight'),
      value: vitals.weight ? `${vitals.weight} kg` : '-',
      icon: Scale,
      isAbnormal: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`p-3 rounded-xl border transition-all ${
              item.isAbnormal
                ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                : 'bg-white border-slate-200/80 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1 text-slate-500">
              <Icon
                className={`w-3.5 h-3.5 ${
                  item.isAbnormal ? 'text-amber-600' : 'text-teal-600'
                }`}
              />
              <span className="text-[11px] font-medium">{item.label}</span>
            </div>
            <div className="text-sm font-semibold text-slate-900">{item.value}</div>
          </div>
        );
      })}
    </div>
  );
}
