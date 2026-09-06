import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Stethoscope,
  AlertCircle,
  User,
  CheckCircle2,
  Wifi,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';
import LanguageSelector from '../components/common/LanguageSelector';
import ThemeToggle from '../components/common/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'ASHA') {
        navigate('/asha/dashboard');
      } else if (loggedInUser.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else if (loggedInUser.role === 'PATIENT') {
        navigate('/patient/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Unable to sign in. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Demo@123');
    setError('');

    try {
      setLoading(true);
      const loggedInUser = await login(demoEmail, 'Demo@123');
      if (loggedInUser.role === 'ASHA') {
        navigate('/asha/dashboard');
      } else if (loggedInUser.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else if (loggedInUser.role === 'PATIENT') {
        navigate('/patient/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-mesh flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      {/* Top Bar with Language Selector & Back to Home */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between pb-4">
        <Link to="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 text-xs font-semibold transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180 text-teal-600 dark:text-teal-400" />
          <span>SwasthyaSetu Home</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSelector variant="pill" />
        </div>
      </div>

      {/* Main Container: 2 Columns on Desktop */}
      <div className="max-w-5xl w-full mx-auto my-auto grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Brand Story & Mission */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-4">
          <Logo size="lg" showWordmark={true} showTagline={true} />

          <div className="space-y-3">
            <h1 className="text-2xl xl:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              {t('loginBrandMessage')}
            </h1>
            <p className="text-xs xl:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('loginBrandDescription')}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Doctor-Confirmed Risk</span>
                <span className="text-slate-500 dark:text-slate-400">Authoritative Single Source of Truth</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
                <Wifi className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Offline-First Resilience</span>
                <span className="text-slate-500 dark:text-slate-400">Patient screening continues without network</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">English • हिन्दी • मराठी</span>
                <span className="text-slate-500 dark:text-slate-400">Accessible regional languages for all roles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-7 max-w-lg mx-auto w-full">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-8 px-6 sm:px-10 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50">
            {/* Mobile Brand Header */}
            <div className="lg:hidden text-center mb-6">
              <Logo size="md" showWordmark={true} className="justify-center mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('tagline')}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('loginHeading')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('loginSubtitle')}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t('loginIdentifierLabel')}
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('loginIdentifierPlaceholder')}
                icon={Mail}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('passwordLabel')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-11 pr-11 py-2.5 text-base md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 min-h-[44px] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <span>{t('rememberSession')}</span>
                </label>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full text-base font-semibold shadow-sm bg-teal-600 hover:bg-teal-700 text-white"
                size="lg"
              >
                {t('signInBtn')}
              </Button>
            </form>

            {/* Demo Access Section */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="text-center mb-3">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  {t('demoSectionTitle')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('asha@demo.com')}
                  disabled={loading}
                  className="p-3 text-left rounded-xl border-2 border-teal-200/90 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/40 hover:bg-teal-100/70 dark:hover:bg-teal-900/50 hover:border-teal-400 dark:hover:border-teal-600 transition-all focus:ring-2 focus:ring-teal-600 shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 text-teal-900 dark:text-teal-200 font-bold text-xs mb-1">
                    <UserCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                    <span>{t('demoAshaRole')}</span>
                  </div>
                  <p className="text-[10px] text-teal-700 dark:text-teal-400 truncate font-mono">asha@demo.com</p>
                  <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 mt-0.5">{t('demoAshaSub')}</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('doctor@demo.com')}
                  disabled={loading}
                  className="p-3 text-left rounded-xl border-2 border-indigo-200/90 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all focus:ring-2 focus:ring-indigo-600 shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200 font-bold text-xs mb-1">
                    <Stethoscope className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                    <span>{t('demoDoctorRole')}</span>
                  </div>
                  <p className="text-[10px] text-indigo-800 dark:text-indigo-400 truncate font-mono">doctor@demo.com</p>
                  <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">{t('demoDoctorSub')}</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('patient@demo.com')}
                  disabled={loading}
                  className="p-3 text-left rounded-xl border-2 border-emerald-200/90 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200 font-bold text-xs mb-1">
                    <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>{t('demoPatientRole')}</span>
                  </div>
                  <p className="text-[10px] text-emerald-800 dark:text-emerald-400 truncate font-mono">patient@demo.com</p>
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{t('demoPatientSub')}</p>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-3 font-medium">
                {t('demoPasswordNotice')} <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-700 dark:text-slate-300">Demo@123</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="max-w-md w-full mx-auto text-center mt-6">
        <p className="text-[11px] text-slate-500 leading-tight">
          {t('governanceDisclaimer')}
        </p>
      </div>
    </div>
  );
}
