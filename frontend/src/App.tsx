import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DiamondList } from './pages/DiamondList';
import { DiamondDetail } from './pages/DiamondDetail';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { FormBuilder } from './pages/FormBuilder';
import { DiamondForm } from './pages/DiamondForm';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
          {/* Header */}
          <Navbar />

          {/* Main Layout Container */}
          <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<DiamondList />} />
              <Route path="/diamonds/:id" element={<DiamondDetail />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/form-builder"
                element={
                  <ProtectedRoute>
                    <FormBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/diamonds/new"
                element={
                  <ProtectedRoute>
                    <DiamondForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/diamonds/edit/:id"
                element={
                  <ProtectedRoute>
                    <DiamondForm />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500 bg-slate-950/20">
            <div className="max-w-7xl mx-auto px-4">
              &copy; {new Date().getFullYear()} Arham Diamonds Platform. All rights reserved.
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
