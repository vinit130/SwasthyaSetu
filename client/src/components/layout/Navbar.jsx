import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Globe,
  LogOut,
  User,
  Wifi,
  WifiOff,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useOffline } from '../../context/OfflineContext';
import Button from '../common/Button';
import Logo from '../common/Logo';
import LanguageSelector from '../common/LanguageSelector';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { isOnline, pendingCount, simulatedOffline, toggleSimulateOffline } = useOffline();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAsha = user?.role === 'ASHA';
  const isDoctor = user?.role === 'DOCTOR';
  const isHospital = user?.role === 'DISTRICT_HOSPITAL';
  const isAdmin = user?.role === 'HEALTH_DEPARTMENT_ADMIN';
  const isPatient = user?.role === 'PATIENT';

  const homePath = isAsha
    ? '/asha/dashboard'
    : isDoctor
    ? '/doctor/dashboard'
    : isHospital
    ? '/hospital/dashboard'
    : isAdmin
    ? '/admin/dashboard'
    : '/patient/dashboard';

  const roleLabel = isAsha
    ? 'ASHA / ANM'
    : isDoctor
    ? 'DOCTOR'
    : isHospital
    ? 'DISTRICT HOSPITAL'
    : isAdmin
    ? 'HEALTH ADMIN'
    : 'PATIENT';

  const roleBadgeStyle = isAsha
    ? 'bg-teal-50 text-teal-800 border border-teal-200'
    : isDoctor
    ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
    : isHospital
    ? 'bg-rose-50 text-rose-800 border border-rose-200'
    : isAdmin
    ? 'bg-blue-50 text-blue-800 border border-blue-200'
    : 'bg-emerald-50 text-emerald-800 border border-emerald-200';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand / Logo */}
        <Link to={homePath} className="flex items-center gap-3 group">
          <Logo size="md" showWordmark={true} />
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block ${roleBadgeStyle}`}
          >
            {roleLabel}
          </span>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online/Offline Status Indicator */}
          <button
            onClick={toggleSimulateOffline}
            title={isOnline ? 'Network Online (Click to test Offline mode)' : 'Network Offline'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
            )}
            <span className="hidden md:inline font-semibold">
              {isOnline ? t('onlineStatus') : t('offlineStatus')}
            </span>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Trilingual Selector */}
          <LanguageSelector variant="dropdown" />

          {/* User Profile info */}
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors text-xs font-medium"
            title="My Profile"
          >
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <span className="hidden lg:inline max-w-[120px] truncate">{user?.name}</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title={t('logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
