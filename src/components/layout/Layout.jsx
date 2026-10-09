import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AmbientBackground from '../common/AmbientBackground';
import ThemeCustomizer from '../common/ThemeCustomizer';

const Layout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white relative overflow-hidden">
        <AmbientBackground />
        <div className="flex flex-col items-center space-y-4 relative z-10 animate-fade-in">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-primary-600/20 border border-primary-500/40 flex items-center justify-center animate-pulse">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent"></div>
            </div>
          </div>
          <div className="text-center">
            <h4 className="font-extrabold text-sm tracking-wide text-white">SmartRetail OS</h4>
            <p className="text-xs text-slate-400 mt-0.5">Initializing session & theme tokens...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if user session is not found
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] transition-colors duration-300 relative">
      {/* Dynamic Theme Ambient Mesh & Light Orbs */}
      <AmbientBackground />

      {/* Theme Studio Customizer Drawer */}
      <ThemeCustomizer />

      {/* Modern Glass Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Top Navbar with live breadcrumbs, clock & controls */}
        <Navbar />

        {/* Dynamic Page Scroll Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
