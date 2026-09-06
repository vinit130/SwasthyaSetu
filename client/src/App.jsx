import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { OfflineProvider } from './context/OfflineContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout & Route Guards
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

// ASHA Pages
import AshaDashboard from './pages/asha/AshaDashboard';
import AshaPatients from './pages/asha/AshaPatients';
import RegisterPatient from './pages/asha/RegisterPatient';
import AshaPatientProfile from './pages/asha/AshaPatientProfile';
import SymptomsVitals from './pages/asha/SymptomsVitals';
import AshaReferrals from './pages/asha/AshaReferrals';
import AshaFollowups from './pages/asha/AshaFollowups';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorPatientProfile from './pages/doctor/DoctorPatientProfile';
import DoctorReviews from './pages/doctor/DoctorReviews';
import DoctorConsultation from './pages/doctor/DoctorConsultation';
import DoctorConsultationList from './pages/doctor/DoctorConsultationList';
import DoctorReferrals from './pages/doctor/DoctorReferrals';
import DoctorFollowups from './pages/doctor/DoctorFollowups';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';

// Root redirect handler
function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated || !user) return <LandingPage />;
  if (user.role === 'ASHA') return <Navigate to="/asha/dashboard" replace />;
  if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  if (user.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <OfflineProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected App Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Profile (Shared) */}
                <Route path="/profile" element={<ProfilePage />} />

                {/* ASHA Frontline Routes */}
                <Route
                  path="/asha/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ASHA']}>
                      <AshaDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/asha/patients"
                  element={
                    <ProtectedRoute allowedRoles={['ASHA']}>
                      <AshaPatients />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/asha/register"
                  element={
                    <ProtectedRoute allowedRoles={['ASHA']}>
                      <RegisterPatient />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/asha/patients/:id"
                  element={
                    <ProtectedRoute allowedRoles={['ASHA']}>
                      <AshaPatientProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/asha/patients/:id/symptoms"
                  element={
                    <ProtectedRoute allowedRoles={['ASHA']}>
                      <SymptomsVitals />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/asha/referrals"
                  element={
                    <ProtectedRoute allowedRoles={['ASHA']}>
                      <AshaReferrals />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/asha/followups"
                  element={
                    <ProtectedRoute allowedRoles={['ASHA']}>
                      <AshaFollowups />
                    </ProtectedRoute>
                  }
                />

                {/* Doctor Routes */}
                <Route
                  path="/doctor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/patients"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorPatients />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/patients/:id"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorPatientProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/patients/:id/review"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorPatientProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/reviews"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorReviews />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/consultations"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorConsultationList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/consultations/new"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorConsultation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/referrals"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorReferrals />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/followups"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                      <DoctorFollowups />
                    </ProtectedRoute>
                  }
                />

                {/* Patient Routes */}
                <Route
                  path="/patient/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </OfflineProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
);
}
