import React, { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, COLOR_THEMES } from '../../contexts/ThemeContext';
import {
  Palette,
  Sun,
  Moon,
  Sparkles,
  Cpu,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  LayoutDashboard,
  ShoppingCart,
  Package,
  TrendingUp,
  Award,
  FileBarChart,
  Truck,
  Bell,
  Check
} from 'lucide-react';

const routeDetails = {
  '/': { title: 'Dashboard Overview', icon: LayoutDashboard, category: 'Analytics' },
  '/pos': { title: 'POS Smart Checkout', icon: ShoppingCart, category: 'Terminal' },
  '/products': { title: 'Product Catalog & Inventory', icon: Package, category: 'Management' },
  '/inventory': { title: 'Stock Logs & Restocking', icon: ShieldCheck, category: 'Management' },
  '/suppliers': { title: 'Supplier Directory & Orders', icon: Truck, category: 'Management' },
  '/ai-analytics': { title: 'AI Predictive Intelligence', icon: TrendingUp, category: 'Machine Learning' },
  '/brand-analytics': { title: 'Brand Market Share', icon: Award, category: 'Analytics' },
  '/reports': { title: 'Sales & Inventory Reports', icon: FileBarChart, category: 'Reports' },
  '/profile': { title: 'User Profile & Settings', icon: User, category: 'Account' },
};

const Navbar = () => {
  const { user } = useAuth();
  const { mode, toggleTheme, colorTheme, setColorTheme, setIsCustomizerOpen, activeColorObj } = useTheme();
  const location = useLocation();

  // Digital live clock
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentRoute = routeDetails[location.pathname] || {
    title: 'Management Console',
    icon: LayoutDashboard,
    category: 'System'
  };
  const IconComponent = currentRoute.icon;

  return (
    <header className="h-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#111827]/70 midnight:bg-[#070b14]/80 backdrop-blur-xl px-8 flex items-center justify-between z-10 transition-colors">
      {/* Left: Dynamic Route Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-500 shadow-sm">
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span>{currentRoute.category}</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-primary-500">{currentRoute.title}</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currentRoute.title}
          </h2>
        </div>
      </div>

      {/* Right: Quick Color Swatches, Live AI Status, Digital Clock, Theme Customizer & User Pill */}
      <div className="flex items-center space-x-3.5">
        {/* Quick Color Palette Swatches Bar */}
        <div className="hidden xl:flex items-center space-x-1.5 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          {COLOR_THEMES.map((theme) => {
            const isSelected = colorTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setColorTheme(theme.id)}
                className={`w-6 h-6 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                  isSelected ? 'ring-2 ring-white shadow-md scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: theme.primary }}
                title={`Switch to ${theme.name}`}
              >
                {isSelected && <Check className="w-3 h-3 text-white drop-shadow" />}
              </button>
            );
          })}
        </div>

        {/* Live AI Status Badge */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Cpu className="w-3.5 h-3.5" /> AI Online
          </span>
        </div>

        {/* Live Digital Clock */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono font-medium">
          <Clock className="w-3.5 h-3.5 text-primary-500" />
          <span>{timeStr}</span>
        </div>

        {/* Theme Customizer Trigger Button */}
        <button
          onClick={() => setIsCustomizerOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/30 text-primary-500 font-bold text-xs shadow-sm hover:shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition"
          title="Open Theme Studio"
        >
          <Palette className="w-4 h-4 text-primary-500 animate-pulse-glow" />
          <span className="hidden sm:inline">Theme Studio</span>
          <span
            className="w-2.5 h-2.5 rounded-full ring-2 ring-white/30"
            style={{ backgroundColor: activeColorObj.primary }}
          />
        </button>

        {/* Mode Toggle Sun/Moon */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 transition hover:scale-105 active:scale-95"
          title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {mode === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Quick Profile Pill */}
        <NavLink
          to="/profile"
          className="flex items-center space-x-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition"
        >
          <div className="w-7 h-7 rounded-lg bg-primary-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
            {user?.name?.slice(0, 2).toUpperCase() || 'SR'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {user?.name?.split(' ')[0]}
            </p>
            <span className="text-[9px] font-bold text-primary-500 uppercase tracking-wider">
              {user?.role}
            </span>
          </div>
        </NavLink>
      </div>
    </header>
  );
};

export default Navbar;
