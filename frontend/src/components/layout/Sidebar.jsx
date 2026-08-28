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
  Award
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin, isManager } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Cashier'] },
    { name: 'POS Billing', path: '/pos', icon: ShoppingCart, roles: ['Admin', 'Manager', 'Cashier'] },
    { name: 'Products', path: '/products', icon: Package, roles: ['Admin', 'Manager'] },
    { name: 'Inventory', path: '/inventory', icon: ShieldCheck, roles: ['Admin', 'Manager'] },
    { name: 'Suppliers', path: '/suppliers', icon: Truck, roles: ['Admin', 'Manager'] },
    { name: 'AI Analytics', path: '/ai-analytics', icon: TrendingUp, roles: ['Admin', 'Manager'] },
    { name: 'Brand Analytics', path: '/brand-analytics', icon: Award, roles: ['Admin', 'Manager'] },
    { name: 'Reports', path: '/reports', icon: FileBarChart, roles: ['Admin', 'Manager'] },
  ];

  const filteredMenu = menuItems.filter((item) => {
    return item.roles.includes(user?.role);
  });

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131c2e] flex flex-col h-screen text-slate-800 dark:text-slate-200 transition-all duration-300">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
        <div className="bg-primary-600 dark:bg-primary-500 p-2.5 rounded-xl shadow-lg shadow-purple-500/30">
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-primary-600 to-purple-400 bg-clip-text text-transparent">SmartRetail</h1>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Management System</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info & Settings Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="flex items-center space-x-3 mb-4 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name}</h4>
            <span className="inline-block px-2 py-0.5 mt-0.5 text-[9px] font-extrabold uppercase rounded bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-100/50 dark:border-primary-900/50">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center px-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <NavLink
            to="/profile"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            title="Edit Profile"
          >
            <User className="w-4 h-4" />
          </NavLink>

          <button
            onClick={logout}
            className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 transition"
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
