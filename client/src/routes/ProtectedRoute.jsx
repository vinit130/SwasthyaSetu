import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Verifying security credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective authorized dashboard
    if (user.role === 'ASHA') {
      return <Navigate to="/asha/dashboard" replace />;
    } else if (user.role === 'DOCTOR') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else if (user.role === 'PATIENT') {
      return <Navigate to="/patient/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
