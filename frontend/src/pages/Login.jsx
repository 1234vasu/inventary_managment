import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  ShoppingCart,
  Mail,
  Lock,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Palette,
  ShieldCheck,
  Zap
} from 'lucide-react';
import AmbientBackground from '../components/common/AmbientBackground';
import ThemeCustomizer from '../components/common/ThemeCustomizer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { login, error, loading } = useAuth();
  const { setIsCustomizerOpen, activeColorObj } = useTheme();
  const navigate = useNavigate();

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please enter your email and password');
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center bg-[var(--bg-primary)] px-4 py-8 overflow-hidden">
      {/* Background Animated Orbs */}
      <AmbientBackground />
      <ThemeCustomizer />

      {/* Top Floating Action: Quick Theme Customizer */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setIsCustomizerOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 hover:border-primary-500/50 shadow-lg text-xs font-bold transition hover:scale-105"
        >
          <Palette className="w-4 h-4 text-primary-500 animate-pulse-glow" />
          <span>Themes</span>
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: activeColorObj.primary }}
          />
        </button>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-2xl shadow-primary-500/40 border border-white/20 animate-float">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow">
              <Zap className="w-3 h-3" />
            </span>
          </div>

          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-primary-600 to-primary-500 dark:from-white dark:via-primary-200 dark:to-primary-400 bg-clip-text text-transparent">
            SmartRetail OS
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
            Next-Gen AI Supermarket POS & Inventory Management
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white/80 dark:bg-[#111827]/80 midnight:bg-[#070b14]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Subtle Top Glow Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-80" />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Sign In</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter credentials to unlock console</p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20 text-[10px] font-black uppercase tracking-wider">
              v2.0
            </span>
          </div>

          {/* Error Alert Display */}
          {(error || validationError) && (
            <div className="flex items-center space-x-2.5 bg-red-500/10 border border-red-500/20 text-red-500 p-3.5 rounded-2xl text-xs mb-5 animate-scale-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{validationError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Work Email
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-primary-500 transition">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@retail.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition text-sm font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-primary-500 transition">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition text-sm font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.01] active:scale-95 transition-all duration-200 focus:outline-none flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <span>Access Management Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Info */}
          <div className="mt-7 pt-5 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary-500" /> One-Click Demo Logins
              </span>
              <span className="text-[10px] text-slate-400">Click to fill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@retail.com', 'admin123')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-primary-500/10 dark:bg-slate-900/60 dark:hover:bg-primary-500/15 border border-slate-200 dark:border-slate-800 hover:border-primary-500/40 transition text-left group"
              >
                <span className="font-extrabold block text-xs text-primary-500 group-hover:scale-105 transition-transform">
                  Admin
                </span>
                <span className="text-[9px] text-slate-400 font-mono block">admin123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('manager@retail.com', 'manager123')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-primary-500/10 dark:bg-slate-900/60 dark:hover:bg-primary-500/15 border border-slate-200 dark:border-slate-800 hover:border-primary-500/40 transition text-left group"
              >
                <span className="font-extrabold block text-xs text-primary-500 group-hover:scale-105 transition-transform">
                  Manager
                </span>
                <span className="text-[9px] text-slate-400 font-mono block">manager123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('cashier@retail.com', 'cashier123')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-primary-500/10 dark:bg-slate-900/60 dark:hover:bg-primary-500/15 border border-slate-200 dark:border-slate-800 hover:border-primary-500/40 transition text-left group"
              >
                <span className="font-extrabold block text-xs text-primary-500 group-hover:scale-105 transition-transform">
                  Cashier
                </span>
                <span className="text-[9px] text-slate-400 font-mono block">cashier123</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
