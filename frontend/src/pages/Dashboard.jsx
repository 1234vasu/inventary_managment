import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Award,
  Sparkles,
  Zap,
  Layers,
  Flame
} from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { activeColorObj, mode } = useTheme();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/reports/dashboard');
        if (data.success) {
          setData(data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
        setError('Could not retrieve dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-lg animate-pulse"></div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Aggregating live store metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-3xl text-red-500 max-w-xl mx-auto mt-10">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <span className="font-bold">{error}</span>
        </div>
      </div>
    );
  }

  const { metrics, topSelling, monthlySales, categorySales } = data;

  const chartColors = [
    activeColorObj.primary,
    activeColorObj.secondary,
    '#38bdf8',
    '#34d399',
    '#fbbf24',
    '#f43f5e'
  ];

  const cardItems = [
    {
      title: 'Total Catalog Products',
      value: metrics.totalProducts,
      icon: Package,
      gradient: 'from-blue-500 to-indigo-600',
      badge: '+12% this month',
      description: 'Active items in stock'
    },
    {
      title: 'Sales Count',
      value: metrics.totalOrders,
      icon: ShoppingCart,
      gradient: 'from-primary-600 to-primary-400',
      badge: 'Real-time sync',
      description: 'Transactions processed'
    },
    {
      title: "Today's Revenue",
      value: `$${metrics.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      badge: 'Live Register',
      description: 'Gross checkout sales'
    },
    {
      title: 'Low Stock Alerts',
      value: metrics.lowStockCount,
      icon: AlertTriangle,
      gradient: metrics.lowStockCount > 0 ? 'from-amber-500 to-orange-600' : 'from-slate-600 to-slate-500',
      badge: metrics.lowStockCount > 0 ? 'Action Needed' : 'Optimal',
      description: 'Under threshold items'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/70 dark:bg-[#111827]/70 midnight:bg-[#070b14]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-primary-500 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 animate-pulse-glow" />
            <span>Store Operations Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Performance Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time sales velocity, revenue trajectories, and inventory health.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-4 py-2 rounded-2xl bg-primary-500/10 border border-primary-500/25 text-primary-500 text-xs font-black flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            <span>Live Stream Active</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardItems.map((item, idx) => (
          <div
            key={idx}
            className="premium-card p-6 flex flex-col justify-between group hover:scale-[1.02] transition-all duration-300"
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {item.title}
                </span>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {item.value}
                </h3>
              </div>
              <div
                className={`p-3.5 rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}
              >
                <item.icon className="w-5 h-5" />
              </div>
            </div>

            {/* Bottom info */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {item.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Sales Revenue Area Chart */}
        <div className="premium-card p-6 lg:col-span-2 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Monthly Revenue Trajectory</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary-500/10 text-primary-500">
                  Past 6 Months
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Aggregated revenue performance across sales channels.</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            {monthlySales && monthlySales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySales}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeColorObj.primary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={activeColorObj.primary} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={mode === 'light' ? '#e2e8f0' : '#1e293b'} vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '1rem',
                      border: `1px solid ${activeColorObj.primary}40`,
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                      color: mode === 'light' ? '#0f172a' : '#fff',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={activeColorObj.primary}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No monthly transactions recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="premium-card p-6 flex flex-col space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Category Distribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Inventory share and units sold.</p>
          </div>

          <div className="h-52 w-full flex justify-center items-center relative">
            {categorySales && categorySales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: mode === 'light' ? '#0f172a' : '#fff',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-xs">No category data recorded</div>
            )}
          </div>

          {/* Category Legend List */}
          <div className="space-y-2 overflow-y-auto max-h-36 pr-1 custom-scrollbar">
            {categorySales &&
              categorySales.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between text-xs font-bold p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80"
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <span className="text-slate-700 dark:text-slate-300">{entry.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-900 dark:text-white">
                    <span className="text-slate-400 font-normal">{entry.value} pcs</span>
                    <span className="text-primary-500 font-extrabold">${entry.revenue?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Top-Performing Products</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Velocity Leaders
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Products with the highest volume and gross turnover.</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <th className="py-3 px-4">Rank & Item</th>
                <th className="py-3 px-4 text-center">Volume Sold</th>
                <th className="py-3 px-4 text-right">Net Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {topSelling && topSelling.length > 0 ? (
                topSelling.map((product, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-3.5 px-4 flex items-center space-x-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${
                          idx === 0
                            ? 'bg-amber-400 text-black shadow-amber-400/30'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-900 dark:bg-slate-600 dark:text-white'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        #{idx + 1}
                      </div>
                      <span className="text-slate-900 dark:text-white font-bold group-hover:text-primary-500 transition-colors">
                        {product._id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-800 dark:text-slate-200">
                        {product.quantitySold} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-500">
                      ${product.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-slate-400 text-xs">
                    No orders processed yet to rank store products.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
