import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Share2,
  CalendarCheck,
  Stethoscope,
  Clock,
  Building,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function MobileNav() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAsha = user?.role === 'ASHA';
  const isDoctor = user?.role === 'DOCTOR';
  const isHospital = user?.role === 'DISTRICT_HOSPITAL';
  const isAdmin = user?.role === 'HEALTH_DEPARTMENT_ADMIN';

  if (!user) return null;

  return (
    <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1 shadow-lg transition-colors">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {isAsha ? (
          <>
            <NavLink
              to="/asha/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-teal-700 ' : 'text-slate-500 '
 }`
              }
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>{t('dashboard')}</span>
            </NavLink>

            <NavLink
              to="/asha/patients"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-teal-700 ' : 'text-slate-500 '
 }`
              }
            >
              <Users className="w-5 h-5 mb-0.5" />
              <span>{t('patients')}</span>
            </NavLink>

            {/* Prominent center Register Button for frontline workers */}
            <NavLink
              to="/asha/register"
              className="flex flex-col items-center -mt-4"
              title={t('registerPatient')}
            >
              <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-700/30 active:scale-95 transition-transform">
                <UserPlus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold text-teal-800 mt-0.5 truncate max-w-[50px]">
                {t('registerPatient')}
              </span>
            </NavLink>

            <NavLink
              to="/asha/referrals"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-teal-700 ' : 'text-slate-500 '
 }`
              }
            >
              <Share2 className="w-5 h-5 mb-0.5" />
              <span>{t('referrals')}</span>
            </NavLink>

            <NavLink
              to="/asha/followups"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-teal-700 ' : 'text-slate-500 '
 }`
              }
            >
              <CalendarCheck className="w-5 h-5 mb-0.5" />
              <span>{t('followups')}</span>
            </NavLink>
          </>
        ) : isDoctor ? (
          <>
            <NavLink
              to="/doctor/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-teal-700 ' : 'text-slate-500 '
 }`
              }
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>{t('dashboard')}</span>
            </NavLink>

            <NavLink
              to="/doctor/reviews"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-teal-700 ' : 'text-slate-500 '
 }`
              }
            >
              <Clock className="w-5 h-5 mb-0.5" />
              <span>{t('pendingReviews')}</span>
            </NavLink>

            <NavLink
              to="/doctor/patients"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-teal-700 ' : 'text-slate-500 '
 }`
              }
            >
              <Users className="w-5 h-5 mb-0.5" />
              <span>{t('patients')}</span>
            </NavLink>

            <NavLink
              to="/doctor/consultations"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-teal-700 ' : 'text-slate-500 '
 }`
              }
            >
              <Stethoscope className="w-5 h-5 mb-0.5" />
              <span>{t('consultations')}</span>
            </NavLink>

            <NavLink
              to="/doctor/referrals"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-teal-700 ' : 'text-slate-500 '
 }`
              }
            >
              <Share2 className="w-5 h-5 mb-0.5" />
              <span>{t('referrals')}</span>
            </NavLink>
          </>
        ) : isHospital ? (
          <>
            <NavLink
              to="/hospital/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-rose-700 ' : 'text-slate-500 '
 }`
              }
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>{t('dashboard')}</span>
            </NavLink>

            <NavLink
              to="/hospital/referrals"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-rose-700 ' : 'text-slate-500 '
 }`
              }
            >
              <Share2 className="w-5 h-5 mb-0.5" />
              <span>Tokens</span>
            </NavLink>

            <NavLink
              to="/hospital/beds"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-rose-700 ' : 'text-slate-500 '
 }`
              }
            >
              <Building className="w-5 h-5 mb-0.5" />
              <span>Beds</span>
            </NavLink>

            <NavLink
              to="/hospital/treatment"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-rose-700 ' : 'text-slate-500 '
 }`
              }
            >
              <Stethoscope className="w-5 h-5 mb-0.5" />
              <span>Care</span>
            </NavLink>

            <NavLink
              to="/hospital/emergency"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-rose-700 ' : 'text-slate-500 '
 }`
              }
            >
              <ShieldCheck className="w-5 h-5 mb-0.5" />
              <span>Triage</span>
            </NavLink>
          </>
        ) : isAdmin ? (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-blue-700 ' : 'text-slate-500 '
 }`
              }
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>Surveillance</span>
            </NavLink>

            <NavLink
              to="/admin/facilities"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-blue-700 ' : 'text-slate-500 '
 }`
              }
            >
              <Building className="w-5 h-5 mb-0.5" />
              <span>Facilities</span>
            </NavLink>

            <NavLink
              to="/admin/audit-logs"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-blue-700 ' : 'text-slate-500 '
 }`
              }
            >
              <ShieldCheck className="w-5 h-5 mb-0.5" />
              <span>Audit Logs</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-blue-700 ' : 'text-slate-500 '
 }`
              }
            >
              <User className="w-5 h-5 mb-0.5" />
              <span>{t('profile')}</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/patient/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-teal-700 ' : 'text-slate-500 '
 }`
              }
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>{t('myCareJourney') || 'Journey'}</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors ${
 isActive ? 'text-teal-700 ' : 'text-slate-500 '
 }`
              }
            >
              <User className="w-5 h-5 mb-0.5" />
              <span>{t('profile')}</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
