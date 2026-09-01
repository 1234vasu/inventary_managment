import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, COLOR_THEMES, APPEARANCE_MODES } from '../contexts/ThemeContext';
import {
  Shield,
  User,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Palette,
  Sparkles,
  Moon,
  Sun,
  Zap,
  Check
} from 'lucide-react';

const Profile = () => {
  const { user, changePassword } = useAuth();
  const {
    mode,
    setMode,
    colorTheme,
    setColorTheme,
    ambientAnimation,
    setAmbientAnimation,
    activeColorObj
  } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Confirm password does not match new password');
      return;
    }

    setLoading(true);
    try {
      const success = await changePassword(currentPassword, newPassword);
      if (success) {
        setSuccessMsg('Your security password has been updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password. Check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#111827]/70 midnight:bg-[#070b14]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your account credentials, security access, and personal workspace theme.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Profile Card Summary */}
        <div className="premium-card p-6 md:col-span-1 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-400 text-white font-black rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-primary-500/25 border border-white/20">
            {user?.name?.slice(0, 2).toUpperCase() || 'SR'}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{user?.name}</h3>
            <span className="text-xs text-slate-400 font-medium block mt-0.5">{user?.email}</span>
          </div>

          <div className="w-full pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3 text-left text-xs font-bold">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Assigned Role
              </span>
              <span className="text-primary-500 font-black uppercase text-[10px] bg-primary-500/10 px-2 py-0.5 rounded-md">
                {user?.role}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Active Palette
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-bold text-xs">
                {activeColorObj.name}
              </span>
            </div>
          </div>
        </div>

        {/* Right Columns: Theme Customizer & Security */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Workspace Theme Studio in Profile */}
          <div className="premium-card p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-primary-500" />
                  <span>Workspace Theme Studio</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Customize your color palette and display appearance.</p>
              </div>
            </div>

            {/* Display Mode */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Appearance Mode</label>
              <div className="grid grid-cols-3 gap-2.5">
                {APPEARANCE_MODES.map((item) => {
                  const isSelected = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMode(item.id)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-md shadow-primary-500/15'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {item.id === 'dark' && <Moon className="w-4 h-4" />}
                      {item.id === 'midnight' && <Sparkles className="w-4 h-4" />}
                      {item.id === 'light' && <Sun className="w-4 h-4" />}
                      <span className="text-xs font-bold">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Palettes */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Color Themes</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {COLOR_THEMES.map((theme) => {
                  const isSelected = colorTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setColorTheme(theme.id)}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10 ring-2 ring-primary-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div
                          className="w-5 h-5 rounded-lg shadow-sm flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
                          }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{theme.name}</h4>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ambient Animation toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Zap className="w-4 h-4 text-primary-500" />
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Ambient Background Glow</h5>
                  <p className="text-[10px] text-slate-400">Responsive mesh light orbs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAmbientAnimation(!ambientAnimation)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  ambientAnimation ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    ambientAnimation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Change Password Panel */}
          <div className="premium-card p-6 space-y-6">
            <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <Lock className="w-4 h-4 text-primary-500" />
                <span>Security & Password Credentials</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Ensure your account uses a secure password phrase.</p>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/25 transition disabled:opacity-50 text-xs flex items-center justify-center space-x-2"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
