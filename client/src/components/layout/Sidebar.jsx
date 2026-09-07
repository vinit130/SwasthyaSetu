import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Share2,
  CalendarCheck,
  User,
  Stethoscope,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAsha = user?.role === 'ASHA';
  const isDoctor = user?.role === 'DOCTOR';
  const isPatient = user?.role === 'PATIENT';
  const isHospital = user?.role === 'DISTRICT_HOSPITAL';
  const isAdmin = user?.role === 'HEALTH_DEPARTMENT_ADMIN';

  const ashaLinks = [
    { to: '/asha/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/asha/patients', label: t('patients'), icon: Users },
    { to: '/asha/register', label: t('registerPatient'), icon: UserPlus, highlight: true },
    { to: '/asha/referrals', label: t('referrals'), icon: Share2 },
    { to: '/asha/followups', label: t('followups'), icon: CalendarCheck },
    { to: '/profile', label: t('profile'), icon: User },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/doctor/patients', label: t('patients'), icon: Users },
    { to: '/doctor/reviews', label: t('pendingReviews'), icon: Clock },
    { to: '/doctor/consultations', label: t('consultations'), icon: Stethoscope },
    { to: '/doctor/referrals', label: t('referrals'), icon: Share2 },
    { to: '/doctor/followups', label: t('followups'), icon: CalendarCheck },
    { to: '/profile', label: t('profile'), icon: User },
  ];

  const hospitalLinks = [
    { to: '/hospital/dashboard', label: t('dashboard') || 'Dashboard', icon: LayoutDashboard },
    { to: '/hospital/referrals', label: t('tokenScanner') || 'Scan Referral Token', icon: Share2, highlight: true },
    { to: '/hospital/beds', label: t('bedManagement') || 'Bed Allocation', icon: Building },
    { to: '/hospital/treatment', label: t('treatmentEntry') || 'Inpatient Treatment', icon: Stethoscope },
    { to: '/hospital/emergency', label: t('breakGlassTriage') || 'Break-Glass Triage', icon: ShieldCheck },
    { to: '/profile', label: t('profile') || 'Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: t('stateSurveillance') || 'State Surveillance', icon: LayoutDashboard },
    { to: '/admin/facilities', label: t('facilitiesDirectory') || 'Facility Network', icon: Building },
    { to: '/admin/audit-logs', label: t('auditTrails') || 'Audit Trails', icon: ShieldCheck },
    { to: '/profile', label: t('profile') || 'Profile', icon: User },
  ];

  const patientLinks = [
    { to: '/patient/dashboard', label: t('myCareJourney') || 'My Care Journey', icon: LayoutDashboard },
    { to: '/profile', label: t('profile'), icon: User },
  ];

  const links = isAsha
    ? ashaLinks
    : isDoctor
    ? doctorLinks
    : isHospital
    ? hospitalLinks
    : isAdmin
    ? adminLinks
    : patientLinks;

  const roleLabel = isAsha
    ? t('ashaRole')
    : isDoctor
    ? t('doctorRole')
    : isHospital
    ? (t('hospitalRole') || 'District Hospital Hub')
    : isAdmin
    ? (t('adminRole') || 'Directorate of Health')
    : (t('patientRole') || 'Patient / Household');

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-4 justify-between transition-colors">
      <div className="space-y-1">
        <div className="px-3 py-2 mb-2">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {roleLabel}
          </p>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to.endsWith('dashboard')}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  } ${link.highlight ? 'text-teal-700 dark:text-teal-400 font-semibold' : ''}`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Trust & Clinical Disclaimer Badge in Sidebar Footer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>{t('clinicalDecisionSupport')}</span>
        </div>
        <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400 font-medium">
          {t('frontlineAdvisoryNotice')}
        </p>
      </div>
    </aside>
  );
}
