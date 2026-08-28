import React, { useEffect, useState } from 'react';
import api from '../services/api';
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
  Cell,
  BarChart,
  Bar
} from 'recharts';
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Award
} from 'lucide-react';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-slate-500 dark:text-slate-400 font-semibold">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-2xl text-red-600 dark:text-red-400">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6" />
          <span className="font-bold">{error}</span>
        </div>
      </div>
    );
  }

  const { metrics, topSelling, monthlySales, categorySales } = data;

  const cardItems = [
    {
      title: 'Total Products',
      value: metrics.totalProducts,
      icon: Package,
      colorClass: 'text-blue-500',
      bgClass: 'bg-blue-50 dark:bg-blue-950/30',
      description: 'Items in catalog'
    },
    {
      title: 'Total Sales Count',
      value: metrics.totalOrders,
      icon: ShoppingCart,
      colorClass: 'text-purple-500',
      bgClass: 'bg-purple-50 dark:bg-purple-950/30',
      description: 'Transactions processed'
    },
    {
      title: "Today's Revenue",
      value: `$${metrics.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      colorClass: 'text-emerald-500',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
      description: 'Direct register sales'
    },
    {
      title: 'Low Stock Products',
      value: metrics.lowStockCount,
      icon: AlertTriangle,
      colorClass: metrics.lowStockCount > 0 ? 'text-amber-500' : 'text-slate-400',
      bgClass: metrics.lowStockCount > 0 ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-slate-50 dark:bg-slate-900/30',
      description: 'Under threshold warning'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight dark:text-white">Store Analytics Overview</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time indicators and operational trends.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardItems.map((item, idx) => (
          <div key={idx} className="premium-card p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">{item.title}</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
            </div>
            <div className={`p-4 rounded-2xl ${item.bgClass} ${item.colorClass}`}>
              <item.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Sales Revenue Area Chart */}
        <div className="premium-card p-6 lg:col-span-2 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Revenue Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total net amount ($) compiled over the last 6 months.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="h-72 w-full pt-4">
            {monthlySales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySales}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No monthly history logs found</div>
            )}
          </div>
        </div>

        {/* Category Sales Breakdown Pie Chart */}
        <div className="premium-card p-6 flex flex-col space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Category Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Product quantities sold by category grouping.</p>
          </div>
          <div className="h-56 w-full flex justify-center items-center">
            {categorySales.length > 0 ? (
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm">No category distribution data</div>
            )}
          </div>
          <div className="space-y-2.5 overflow-y-auto max-h-36 pr-1 custom-scrollbar">
            {categorySales.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-slate-600 dark:text-slate-300">{entry.name}</span>
                </div>
                <div className="text-slate-800 dark:text-slate-100 flex items-center space-x-4">
                  <span>{entry.value} pcs</span>
                  <span className="text-slate-400 font-normal">${entry.revenue.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top-Selling Products</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Products with the highest quantity sold in the store catalog.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="py-3 px-4">Product Description</th>
                <th className="py-3 px-4 text-center">Unit Sales</th>
                <th className="py-3 px-4 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {topSelling.length > 0 ? (
                topSelling.map((product, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4 flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-extrabold text-xs">
                        #{idx + 1}
                      </div>
                      <span className="text-slate-900 dark:text-slate-100 font-bold">{product._id}</span>
                    </td>
                    <td className="py-4 px-4 text-center">{product.quantitySold} units</td>
                    <td className="py-4 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                      ${product.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-slate-400">
                    No orders processed yet to calculate sales.
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
