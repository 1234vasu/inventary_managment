import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, User, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { changePassword } = useAuth();

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
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight dark:text-white">Profile Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review account profile details and modify password credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Profile Card Summary */}
        <div className="premium-card p-6 md:col-span-1 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-bold rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-primary-200/20">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h3>
            <span className="text-xs text-slate-400 font-medium block mt-0.5">{user?.email}</span>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5 text-left text-xs font-semibold text-slate-650 dark:text-slate-350">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Role: <strong className="text-primary-600 dark:text-primary-400">{user?.role}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>Tel: <strong>{user?.phone || '—'}</strong></span>
            </div>
          </div>
        </div>

        {/* Change Password Panel */}
        <div className="premium-card p-6 md:col-span-2 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Security Controls</h3>
            <p className="text-xs text-slate-400 mt-0.5">Modify password authentication credentials below.</p>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-500 rounded-xl text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4.5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Current Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition text-sm disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
