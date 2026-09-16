import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  WifiOff,
  Globe,
  Users,
  Stethoscope,
  ClipboardCheck,
  Activity,
  Share2,
  CalendarCheck,
  CheckCircle2,
  FileText,
  Lock,
  User,
  Pill,
  Sparkles,
  Building,
} from 'lucide-react';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';
import LanguageSelector from '../components/common/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage() {
  const { t } = useLanguage();

  const steps = [
    { num: '01', title: t('step1Title'), desc: t('step1Desc'), icon: Users },
    { num: '02', title: t('step2Title'), desc: t('step2Desc'), icon: Activity },
    { num: '03', title: t('clinicalDecisionSupport'), desc: t('frontlineAdvisoryNotice'), icon: ClipboardCheck },
    { num: '04', title: t('step3Title'), desc: t('step3Desc'), icon: Stethoscope },
    { num: '05', title: t('step4Title'), desc: t('step4Desc'), icon: Pill },
    { num: '06', title: t('step5Title'), desc: t('step5Desc'), icon: Share2 },
    { num: '07', title: t('step6Title'), desc: t('step6Desc'), icon: CalendarCheck },
  ];

  const features = [
    { title: 'Unified Digital Care Registry', desc: 'Single longitudinal patient profile from village hut to district hospital.', icon: FileText },
    { title: t('trustItem1Title'), desc: t('trustItem1Desc'), icon: ShieldCheck },
    { title: 'Dedicated Patient Care Portal', desc: 'Jargon-free personal care journey, prescriptions, and follow-up timeline for rural families.', icon: User },
    { title: 'Sequential Referral Tracking', desc: 'State-machine managed hospital transfers ensuring zero patient drop-out.', icon: Share2 },
    { title: 'Actionable Home Follow-ups', desc: 'Village-level home visit schedule ensures chronic and acute recovery is monitored.', icon: CalendarCheck },
    { title: t('trustItem3Title'), desc: t('trustItem3Desc'), icon: WifiOff },
    { title: t('trustItem4Title'), desc: t('trustItem4Desc'), icon: Globe },
    { title: t('trustItem2Title'), desc: t('trustItem2Desc'), icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Top Navbar */}
      <nav className="border-b border-slate-200/80 sticky top-0 bg-white/95 backdrop-blur-md z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size="md" showWordmark={true} />
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <LanguageSelector variant="pill" className="hidden sm:inline-flex" />
            <LanguageSelector variant="dropdown" className="sm:hidden" />
            <Link to="/login">
              <Button size="sm" variant="primary" className="shadow-sm">
                <span>{t('signInBtn')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 hero-mesh border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/90 text-teal-900 text-xs font-bold mb-6 border border-teal-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
            3-Role Rural Healthcare Platform • Village to Hospital to Follow-up
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            {t('landingHeroTitle1')}{' '}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              {t('landingHeroTitle2')}
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('landingHeroSubtitle')}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto shadow-md shadow-teal-600/20 font-semibold">
                <span>{t('getStarted')}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <a href="#three-roles" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                {t('exploreHowItWorks')}
              </Button>
            </a>
          </div>

          {/* Quick 1-Click Demo Dashboard Access */}
          <div className="mt-7 pt-5 border-t border-slate-200/60 max-w-4xl mx-auto">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              ⚡ Instant 1-Click Demo Access (Zero Typing Required):
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              <Link
                to="/login?demo=asha"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200/90 hover:bg-teal-100/80 text-teal-800 text-xs font-semibold shadow-2xs transition-all hover:scale-102"
              >
                <Users className="w-3.5 h-3.5 text-teal-700" />
                <span>ASHA / ANM</span>
              </Link>

              <Link
                to="/login?demo=doctor"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200/90 hover:bg-indigo-100/80 text-indigo-800 text-xs font-semibold shadow-2xs transition-all hover:scale-102"
              >
                <Stethoscope className="w-3.5 h-3.5 text-indigo-700" />
                <span>Doctor</span>
              </Link>

              <Link
                to="/login?demo=hospital"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200/90 hover:bg-rose-100/80 text-rose-800 text-xs font-semibold shadow-2xs transition-all hover:scale-102"
              >
                <Building className="w-3.5 h-3.5 text-rose-700" />
                <span>District Hospital</span>
              </Link>

              <Link
                to="/login?demo=admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/90 hover:bg-blue-100/80 text-blue-800 text-xs font-semibold shadow-2xs transition-all hover:scale-102"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                <span>Health Admin</span>
              </Link>

              <Link
                to="/login?demo=patient"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/90 hover:bg-emerald-100/80 text-emerald-800 text-xs font-semibold shadow-2xs transition-all hover:scale-102"
              >
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Patient Portal</span>
              </Link>
            </div>
          </div>

          {/* Responsible Decision Support Disclaimer */}
          <div className="mt-12 max-w-3xl mx-auto p-4 bg-white/95 backdrop-blur-xs border border-slate-200 shadow-xs rounded-2xl flex items-start gap-3 text-left">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800 font-bold block mb-0.5">
                {t('clinicalDecisionSupport')}:
              </strong>
              {t('disclaimer')}
            </div>
          </div>
        </div>
      </section>

      {/* 3 User Roles Architecture Section */}
      <section id="three-roles" className="py-16 md:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Architectural Foundation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {t('rolesTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              {t('rolesSubtitle')}
            </p>
          </div>

          {/* 5 Role Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Role 1: ASHA */}
            <div className="bg-white rounded-2xl border-2 border-teal-100 p-6 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    Frontline Worker
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('roleAshaTitle')}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {t('roleAshaDesc')}
                </p>
                <ul className="space-y-2 text-xs text-slate-600 mb-6">
                  <li className="flex items-center gap-2">✓ Village household intake with duplicate check</li>
                  <li className="flex items-center gap-2">✓ Physiological vitals & symptoms screening</li>
                  <li className="flex items-center gap-2">✓ Real-time advisory risk indication</li>
                  <li className="flex items-center gap-2">✓ Handover login credentials to patient</li>
                  <li className="flex items-center gap-2">✓ Conduct scheduled home recovery visits</li>
                </ul>
              </div>
              <Link to="/login?demo=asha">
                <Button variant="outline" size="sm" className="w-full border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold">
                  <span>Launch ASHA Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Role 2: DOCTOR */}
            <div className="bg-white rounded-2xl border-2 border-indigo-100 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                    Clinical Review
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('roleDoctorTitle')}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {t('roleDoctorDesc')}
                </p>
                <ul className="space-y-2 text-xs text-slate-600 mb-6">
                  <li className="flex items-center gap-2">✓ Prioritized triage review queue (Urgent RED first)</li>
                  <li className="flex items-center gap-2 font-semibold text-indigo-900">
                    ✓ Authoritatively confirms Green, Yellow, or Red risk
                  </li>
                  <li className="flex items-center gap-2">✓ Structured clinical impressions & prescriptions</li>
                  <li className="flex items-center gap-2">✓ 4-stage hospital referral coordination</li>
                  <li className="flex items-center gap-2">✓ Schedule follow-up check-ins for ASHA</li>
                </ul>
              </div>
              <Link to="/login?demo=doctor">
                <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  <span>Launch Doctor Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Role 3: DISTRICT HOSPITAL */}
            <div className="bg-white rounded-2xl border-2 border-rose-100 p-6 shadow-xs hover:shadow-md hover:border-rose-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Building className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                    Secondary & Inpatient Care
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">District Hospital</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Secondary care operations with referral scanner, real-time bed tracking, and Break-Glass emergency access.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 mb-6">
                  <li className="flex items-center gap-2">✓ Instant referral token verification (ST-REF-XXXX)</li>
                  <li className="flex items-center gap-2 font-semibold text-rose-900">
                    ✓ Live ICU, Oxygen & General bed availability tracker
                  </li>
                  <li className="flex items-center gap-2">✓ Break-Glass emergency lookup with audit trails</li>
                  <li className="flex items-center gap-2">✓ Inpatient treatment summaries & discharge updates</li>
                  <li className="flex items-center gap-2">✓ Continuity handoff back to ASHA for home visits</li>
                </ul>
              </div>
              <Link to="/login?demo=hospital">
                <Button size="sm" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                  <span>Launch Hospital Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Role 4: HEALTH DEPARTMENT ADMIN */}
            <div className="bg-white rounded-2xl border-2 border-blue-100 p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    State Surveillance
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Health Department Admin</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  District & state public health surveillance, epidemic cluster detection, and inventory monitoring.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 mb-6">
                  <li className="flex items-center gap-2">✓ Macro surveillance heatmaps & epidemiological trends</li>
                  <li className="flex items-center gap-2 font-semibold text-blue-900">
                    ✓ Outbreak cluster flags and referral bottleneck alerts
                  </li>
                  <li className="flex items-center gap-2">✓ District-wide medicine and bed inventory levels</li>
                  <li className="flex items-center gap-2">✓ Tamper-evident governance audit log inspector</li>
                  <li className="flex items-center gap-2">✓ Healthcare facility directory management</li>
                </ul>
              </div>
              <Link to="/login?demo=admin">
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  <span>Launch Admin Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Role 5: PATIENT */}
            <div className="bg-white rounded-2xl border-2 border-emerald-100 p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group md:col-span-2 lg:col-span-1">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Care Journey
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('rolePatientTitle')}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {t('rolePatientDesc')}
                </p>
                <ul className="space-y-2 text-xs text-slate-600 mb-6">
                  <li className="flex items-center gap-2">✓ Unique Patient ID & portal credentials</li>
                  <li className="flex items-center gap-2 font-semibold text-emerald-900">
                    ✓ Doctor-confirmed risk status & clinical advice
                  </li>
                  <li className="flex items-center gap-2">✓ 6-step visual care journey timeline</li>
                  <li className="flex items-center gap-2">✓ Prescribed medication instructions in plain language</li>
                  <li className="flex items-center gap-2">✓ Hospital referral status & follow-up dates</li>
                </ul>
              </div>
              <Link to="/login?demo=patient">
                <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  <span>Launch Patient Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Continuum of Care: Step-by-Step Workflow */}
      <section className="py-16 md:py-24 bg-slate-50/50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest">{t('continuumTitle')}</h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {t('continuumSubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                        {step.num}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{step.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Clinical Governance */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest">Platform Strengths</h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {t('trustTitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div
                  key={index}
                  className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:shadow-md hover:border-teal-300 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{feat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="py-10 bg-slate-900 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <Logo size="md" showWordmark={true} variant="white" />
            <span className="hidden sm:inline text-slate-600">|</span>
            <p className="text-slate-400 text-xs">{t('footerTagline')}</p>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector variant="dropdown" />
            <p className="text-slate-500 text-[11px]">
              © 2026 SwasthyaSetu • {t('rightsReserved')}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-slate-500 text-[11px] max-w-2xl mx-auto">
            {t('governanceDisclaimer')}
          </p>
        </div>
      </footer>
    </div>
  );
}
