import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Mail, Lock, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      // Error handled by AuthContext and shown via the context's error state
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-900 via-[#0b0f19] to-purple-950 px-4">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-600 p-4 rounded-2xl shadow-xl shadow-primary-500/20 mb-3 border border-primary-500/30">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Smart Retail Management</h2>
          <p className="text-slate-400 text-sm mt-1">AI-Driven Supermarket Analytics & POS</p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Sign In</h3>

          {/* Error Alert Display */}
          {(error || validationError) && (
            <div className="flex items-center space-x-2 bg-red-950/40 border border-red-800 text-red-400 p-3.5 rounded-xl text-xs mb-5 animate-pulse">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@retail.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition duration-200 focus:outline-none flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span>Access System</span>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Info */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Demo Credentials</span>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400">
              <div className="p-1.5 bg-slate-950/40 rounded border border-slate-800/60">
                <span className="font-bold block text-primary-400">Admin</span>
                admin@retail.com<br/>admin123
              </div>
              <div className="p-1.5 bg-slate-950/40 rounded border border-slate-800/60">
                <span className="font-bold block text-primary-400">Manager</span>
                manager@retail.com<br/>manager123
              </div>
              <div className="p-1.5 bg-slate-950/40 rounded border border-slate-800/60">
                <span className="font-bold block text-primary-400">Cashier</span>
                cashier@retail.com<br/>cashier123
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
