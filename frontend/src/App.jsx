import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScanViewer from './pages/ScanViewer';
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

  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

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
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
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
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
