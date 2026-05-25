import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScanViewer from './pages/ScanViewer';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import PatientDetail from './pages/PatientDetail';
import { Loader2 } from 'lucide-react';

// Route Guard: Restricts access to authenticated clinicians only
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070c] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-medical-primaryLight animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Route Guard: Redirects authenticated users away from authentication prompts
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070c] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-medical-primaryLight animate-spin" />
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Landing Page Route Guard: If authenticated, redirects to /dashboard. Otherwise, shows landing page.
const LandingRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070c] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-medical-primaryLight animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />;
};

function App() {
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Landing Route */}
          <Route path="/" element={<LandingRoute />} />

          {/* Auth Route */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Patient Detail Route */}
          <Route
            path="/patient/:id"
            element={
              <PrivateRoute>
                <PatientDetail />
              </PrivateRoute>
            }
          />

          {/* Scan Viewer Detail Route */}
          <Route
            path="/scan/:id"
            element={
              <PrivateRoute>
                <ScanViewer />
              </PrivateRoute>
            }
          />

          {/* Catch All Redirection */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
