import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  TrendingUp,
  Truck,
  FileBarChart,
  LogOut,
  Sun,
  Moon,
  User,
  ShieldCheck,
  Award,
  Palette,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme, setIsCustomizerOpen, activeColorObj } = useTheme();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Cashier'], badge: null },
    { name: 'POS Billing', path: '/pos', icon: ShoppingCart, roles: ['Admin', 'Manager', 'Cashier'], badge: 'Live' },
    { name: 'Products', path: '/products', icon: Package, roles: ['Admin', 'Manager'], badge: null },
    { name: 'Inventory', path: '/inventory', icon: ShieldCheck, roles: ['Admin', 'Manager'], badge: null },
    { name: 'Suppliers', path: '/suppliers', icon: Truck, roles: ['Admin', 'Manager'], badge: null },
    { name: 'AI Analytics', path: '/ai-analytics', icon: TrendingUp, roles: ['Admin', 'Manager'], badge: 'AI' },
    { name: 'Brand Analytics', path: '/brand-analytics', icon: Award, roles: ['Admin', 'Manager'], badge: null },
    { name: 'Reports', path: '/reports', icon: FileBarChart, roles: ['Admin', 'Manager'], badge: null },
  ];

  const filteredMenu = menuItems.filter((item) => {
    return item.roles.includes(user?.role);
  });

  return (
    <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#111827]/80 midnight:bg-[#070b14]/90 backdrop-blur-2xl flex flex-col h-screen text-slate-800 dark:text-slate-200 transition-all duration-300 z-20 shrink-0">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center space-x-3.5">
        <div className="relative">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white shadow-lg shadow-primary-500/30">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center space-x-1">
            <h1 className="font-black text-xl tracking-tight bg-gradient-to-r from-slate-900 via-primary-600 to-primary-500 dark:from-white dark:via-primary-300 dark:to-primary-400 bg-clip-text text-transparent">
              SmartRetail
            </h1>
          </div>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold block">
            Enterprise OS 2.0
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Core Operations
        </div>

        {filteredMenu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `group relative flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25 scale-[1.02]'
                  : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center space-x-3">
                  <item.icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-primary-500/10 text-primary-500 border border-primary-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Settings Footer */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
        {/* User Card */}
        <div className="flex items-center space-x-3 mb-3 p-2.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-black text-xs shadow-md shadow-primary-500/20">
            {user?.name?.slice(0, 2).toUpperCase() || 'SR'}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {user?.name || 'Retail Manager'}
            </h4>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="inline-block px-2 py-0.5 text-[8px] font-black uppercase rounded-md bg-primary-500/10 text-primary-500 border border-primary-500/20">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary-500 transition flex items-center justify-center"
            title="Theme & Colors Customizer"
          >
            <Palette className="w-4 h-4 text-primary-500" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition flex items-center justify-center"
            title={`Toggle Mode (${mode})`}
          >
            {mode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          <NavLink
            to="/profile"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-center"
            title="User Profile"
          >
            <User className="w-4 h-4" />
          </NavLink>

          <button
            onClick={logout}
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition flex items-center justify-center"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
