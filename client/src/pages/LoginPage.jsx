import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
  WifiOff,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';
import LanguageSelector from '../components/common/LanguageSelector';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const navigateByRole = (role) => {
    switch (role) {
      case 'ASHA':
        navigate('/asha/dashboard', { replace: true });
        break;
      case 'DOCTOR':
        navigate('/doctor/dashboard', { replace: true });
        break;
      case 'PATIENT':
        navigate('/patient/dashboard', { replace: true });
        break;
      case 'HEALTH_DEPARTMENT_ADMIN':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'DISTRICT_HOSPITAL':
        navigate('/hospital/dashboard', { replace: true });
        break;
      default:
        navigate('/', { replace: true });
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Demo@123');
    setError('');
    try {
      setLoading(true);
      const res = await login(demoEmail, 'Demo@123');
      const role = res?.user?.role || res?.role;
      if (role) {
        navigateByRole(role);
      } else if (res?.success) {
        navigateByRole(res.user?.role || res.role);
      } else {
        setError(res?.message || t('invalidCredentials'));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  // 1-Click auto-login if URL has ?demo= or ?role=
  useEffect(() => {
    const demoParam = (searchParams.get('demo') || searchParams.get('role') || '').toLowerCase().trim();
    if (demoParam) {
      const demoEmailMap = {
        asha: 'asha@demo.com',
        doctor: 'doctor@demo.com',
        hospital: 'hospital@demo.com',
        districthospital: 'hospital@demo.com',
        admin: 'admin@demo.com',
        healthadmin: 'admin@demo.com',
        patient: 'patient@demo.com',
      };
      const targetEmail = demoEmailMap[demoParam];
      if (targetEmail) {
        handleDemoLogin(targetEmail);
      }
    } else if (isAuthenticated && user?.role) {
      // If already authenticated and no explicit demo requested, go directly to authorized dashboard
      navigateByRole(user.role);
    }
  }, [searchParams, isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');

    if (!email || !password) {
      setError(t('errorRequired'));
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.trim(), password);
      const role = res?.user?.role || res?.role;
      if (role) {
        navigateByRole(role);
      } else if (res?.success) {
        navigateByRole(res.user?.role || res.role);
      } else {
        setError(res?.message || t('invalidCredentials'));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineEntry = () => {
    const storedUser = localStorage.getItem('swasthyasetu_user');
    const token = localStorage.getItem('swasthyasetu_token');
    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        navigateByRole(parsed.role);
      } catch (e) {
        setError('Offline session corrupted. Please sign in online once to re-authenticate.');
      }
    } else {
      setError('Offline Mode requires at least one prior authenticated session on this device to protect patient records.');
    }
  };

  return (
    <div className="min-h-screen hero-mesh flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Bar with Language Selector & Back to Home */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between pb-4">
        <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-teal-700 text-xs font-semibold transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180 text-teal-600" />
          <span>SwasthyaSetu Home</span>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSelector variant="pill" />
        </div>
      </div>

      {/* Main Container: 2 Columns on Desktop */}
      <div className="max-w-5xl w-full mx-auto my-auto grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Brand Story & Mission */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-4">
          <Logo size="lg" showWordmark={true} showTagline={true} />

          <div className="space-y-3">
            <h1 className="text-2xl xl:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {t('loginBrandMessage')}
            </h1>
            <p className="text-xs xl:text-sm text-slate-600 leading-relaxed">
              {t('loginBrandDescription')}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Doctor-Confirmed Risk</span>
                <span className="text-slate-500">Authoritative Single Source of Truth</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                <Wifi className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Offline-First Resilience</span>
                <span className="text-slate-500">Patient screening continues without network</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">English • हिन्दी • मराठी</span>
                <span className="text-slate-500">Accessible regional languages for all roles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-7 max-w-lg mx-auto w-full">
          <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-200/50">
            {/* Mobile Brand Header */}
            <div className="lg:hidden text-center mb-6">
              <Logo size="md" showWordmark={true} className="justify-center mb-2" />
              <p className="text-xs text-slate-500 font-medium">{t('tagline')}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {t('loginHeading')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t('loginSubtitle')}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
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
                <label className="text-sm font-medium text-slate-700">{t('passwordLabel')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-11 py-2.5 text-base md:text-sm text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 min-h-[44px] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="rounded border-slate-300 bg-white text-teal-600 focus:ring-teal-500 w-4 h-4"
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
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="text-center mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {t('demoSectionTitle')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('asha@demo.com')}
                  disabled={loading}
                  className="p-2.5 text-left rounded-xl border-2 border-teal-200/90 bg-teal-50/60 hover:bg-teal-100/70 hover:border-teal-400 transition-all focus:ring-2 focus:ring-teal-600 shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-teal-900 font-bold text-xs mb-1">
                    <UserCheck className="w-4 h-4 text-teal-700" />
                    <span>{t('demoAshaRole') || 'ASHA / ANM'}</span>
                  </div>
                  <p className="text-[10px] text-teal-700 truncate font-mono">asha@demo.com</p>
                  <p className="text-[10px] font-semibold text-teal-600 mt-0.5">{t('demoAshaSub') || 'Frontline Screening'}</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('doctor@demo.com')}
                  disabled={loading}
                  className="p-2.5 text-left rounded-xl border-2 border-indigo-200/90 bg-indigo-50/60 hover:bg-indigo-100/70 hover:border-indigo-400 transition-all focus:ring-2 focus:ring-indigo-600 shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs mb-1">
                    <Stethoscope className="w-4 h-4 text-indigo-700" />
                    <span>{t('demoDoctorRole') || 'Doctor'}</span>
                  </div>
                  <p className="text-[10px] text-indigo-800 truncate font-mono">doctor@demo.com</p>
                  <p className="text-[10px] font-semibold text-indigo-600 mt-0.5">{t('demoDoctorSub') || 'Clinical Reviews'}</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('hospital@demo.com')}
                  disabled={loading}
                  className="p-2.5 text-left rounded-xl border-2 border-rose-200/90 bg-rose-50/60 hover:bg-rose-100/70 hover:border-rose-400 transition-all focus:ring-2 focus:ring-rose-600 shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs mb-1">
                    <Building className="w-4 h-4 text-rose-700" />
                    <span>{t('demoHospitalRole') || 'District Hospital'}</span>
                  </div>
                  <p className="text-[10px] text-rose-800 truncate font-mono">hospital@demo.com</p>
                  <p className="text-[10px] font-semibold text-rose-600 mt-0.5">{t('demoHospitalSub') || 'Admissions & Beds'}</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@demo.com')}
                  disabled={loading}
                  className="p-2.5 text-left rounded-xl border-2 border-blue-200/90 bg-blue-50/60 hover:bg-blue-100/70 hover:border-blue-400 transition-all focus:ring-2 focus:ring-blue-600 shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs mb-1">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>{t('demoAdminRole') || 'Health Admin'}</span>
                  </div>
                  <p className="text-[10px] text-blue-800 truncate font-mono">admin@demo.com</p>
                  <p className="text-[10px] font-semibold text-blue-600 mt-0.5">{t('demoAdminSub') || 'State Surveillance'}</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('patient@demo.com')}
                  disabled={loading}
                  className="p-2.5 text-left rounded-xl border-2 border-emerald-200/90 bg-emerald-50/60 hover:bg-emerald-100/70 hover:border-emerald-400 transition-all focus:ring-2 focus:ring-emerald-600 shadow-2xs sm:col-span-2 lg:col-span-1 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs mb-1">
                    <User className="w-4 h-4 text-emerald-700" />
                    <span>{t('demoPatientRole') || 'Patient'}</span>
                  </div>
                  <p className="text-[10px] text-emerald-800 truncate font-mono">patient@demo.com</p>
                  <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">{t('demoPatientSub') || 'Care Journey'}</p>
                </button>
              </div>

              <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-[10px] text-slate-400 font-medium text-center sm:text-left">
                  {t('demoPasswordNotice') || 'Password for demo accounts:'} <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">Demo@123</code>
                </p>

                <button
                  type="button"
                  onClick={handleOfflineEntry}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-semibold transition-all shadow-2xs cursor-pointer"
                  title="Open offline workspace using previously authenticated local session"
                >
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('launchOfflineMode') || 'Offline Field Mode'}</span>
                </button>
              </div>
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
