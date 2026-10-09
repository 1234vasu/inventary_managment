import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Award,
  Tags,
  BarChart3,
  TrendingUp,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  Download,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  FileText,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

const BrandAnalytics = () => {
  const [filters, setFilters] = useState({
    timeRange: '30days',
    category: 'all',
    brand: 'all',
    searchQuery: ''
  });

  const [categories, setCategories] = useState([]);
  const [brandsData, setBrandsData] = useState([]);
  const [summary, setSummary] = useState({
    topPerformingBrand: 'N/A',
    topBrandShare: 0,
    activeBrands: 0,
    totalVolumeSold: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const { activeColorObj, mode } = useTheme();

  const fetchBrandData = async (isSync = false) => {
    if (isSync) setSyncing(true);
    else setLoading(true);
    setError('');

    try {
      if (categories.length === 0) {
        const catRes = await api.get('/categories');
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      }

      const params = {};
      if (filters.timeRange !== 'all') params.timeRange = filters.timeRange;
      if (filters.category !== 'all') params.category = filters.category;

      const brandRes = await api.get('/products/brand-analytics', { params });
      if (brandRes.data.success) {
        setBrandsData(brandRes.data.brandsList || []);
        setSummary(brandRes.data.summary || {
          topPerformingBrand: 'N/A',
          topBrandShare: 0,
          activeBrands: 0,
          totalVolumeSold: 0,
          totalRevenue: 0,
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load brand performance data. Please check backend.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchBrandData();
  }, [filters.timeRange, filters.category]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      timeRange: '30days',
      category: 'all',
      brand: 'all',
      searchQuery: ''
    });
  };

  const uniqueBrands = Array.from(new Set(brandsData.map((b) => b.brand)));

  const filteredBrands = brandsData.filter((item) => {
    const matchesSearch = item.brand.toLowerCase().includes(filters.searchQuery.toLowerCase());
    const matchesBrand = filters.brand === 'all' || item.brand === filters.brand;
    return matchesSearch && matchesBrand;
  });

  const topSalesChartData = brandsData.slice(0, 6).map((b) => ({
    name: b.brand,
    'Sales Volume': b.salesVolume
  }));

  const revenueChartData = brandsData.slice(0, 6).map((b) => ({
    name: b.brand,
    value: Math.round(b.revenue)
  }));

  const CHART_COLORS = [
    activeColorObj.primary,
    activeColorObj.secondary,
    '#06b6d4',
    '#10b981',
    '#f59e0b',
    '#f43f5e'
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#111827]/70 midnight:bg-[#070b14]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-extrabold text-primary-500 uppercase tracking-wider mb-0.5">
            <Award className="w-4 h-4" />
            <span>Market Positioning & Share</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Brand Portfolio Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Enterprise brand share diagnostics, market velocity tracking, and category penetration index.
          </p>
        </div>

        <button
          onClick={() => fetchBrandData(true)}
          disabled={syncing}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/25 transition-all active:scale-95 text-xs disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Sync Live Data'}</span>
        </button>
      </div>

      {/* Analytical Segmentation Filters */}
      <div className="premium-card p-5 space-y-4">
        <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-extrabold text-xs border-b border-slate-200/80 dark:border-slate-800/80 pb-3 uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-primary-500" />
          <span>Segmentation Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Time Range */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Time Range</label>
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2.5 bg-slate-50 dark:bg-slate-900/60 focus-within:border-primary-500 transition">
              <Calendar className="w-4 h-4 text-slate-400 mr-2.5" />
              <select
                value={filters.timeRange}
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none border-none cursor-pointer font-bold"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="6months">Last 6 Months</option>
                <option value="ytd">Year to Date</option>
                <option value="all">All-Time</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Category Group</label>
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2.5 bg-slate-50 dark:bg-slate-900/60 focus-within:border-primary-500 transition">
              <Layers className="w-4 h-4 text-slate-400 mr-2.5" />
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none border-none cursor-pointer font-bold"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand Scope */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Brand Focus</label>
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2.5 bg-slate-50 dark:bg-slate-900/60 focus-within:border-primary-500 transition">
              <Tags className="w-4 h-4 text-slate-400 mr-2.5" />
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none border-none cursor-pointer font-bold"
              >
                <option value="all">All Brands</option>
                {uniqueBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-xs transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center space-x-3 text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Highlight Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="premium-card p-6 flex items-center justify-between border-l-4 border-l-primary-500">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Top Performing Brand</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white truncate max-w-[150px]" title={summary.topPerformingBrand}>
                  {summary.topPerformingBrand}
                </h3>
                <p className="text-xs font-bold text-primary-500">
                  {summary.topBrandShare}% sales share
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="premium-card p-6 flex items-center justify-between border-l-4 border-l-blue-500">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Monitored Brands</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{summary.activeBrands} Active</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tracked catalog manufacturers</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Tags className="w-6 h-6" />
              </div>
            </div>

            <div className="premium-card p-6 flex items-center justify-between border-l-4 border-l-emerald-500">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Brand Volume Sold</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{summary.totalVolumeSold.toLocaleString()} units</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Units aggregated in scope</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>

            <div className="premium-card p-6 flex items-center justify-between border-l-4 border-l-amber-500">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Gross Turnover</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Net brand contribution</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Analytics Charts Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart Panel 1 */}
            <div className="premium-card p-6 flex flex-col space-y-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-primary-500" />
                  <span>Brand Market Share (Volume)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Comparative units sold by top manufacturers.</p>
              </div>

              <div className="h-72 w-full pt-2">
                {topSalesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSalesChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={mode === 'light' ? '#e2e8f0' : '#1e293b'} vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
                          borderRadius: '0.75rem',
                          border: `1px solid ${activeColorObj.primary}40`,
                          color: mode === 'light' ? '#0f172a' : '#fff',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      />
                      <Bar dataKey="Sales Volume" fill={activeColorObj.primary} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No data available for the selected filters.
                  </div>
                )}
              </div>
            </div>

            {/* Chart Panel 2 */}
            <div className="premium-card p-6 flex flex-col space-y-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Award className="w-4 h-4 text-primary-500" />
                  <span>Revenue Contribution Share</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manufacturer financial footprint distribution.</p>
              </div>

              <div className="h-72 w-full flex items-center justify-center pt-2">
                {revenueChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {revenueChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`$${value}`, 'Revenue']}
                        contentStyle={{
                          backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
                          borderRadius: '0.75rem',
                          border: `1px solid ${activeColorObj.primary}40`,
                          color: mode === 'light' ? '#0f172a' : '#fff',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No data available for the selected filters.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Brand Comparison & Metrics Table Panel */}
          <div className="premium-card p-6 flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-primary-500" />
                  <span>Brand Performance Matrix</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Indicators, revenue contribution, and catalogue weights.</p>
              </div>

              {/* Search Input Filter */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Filter brands..."
                  value={filters.searchQuery}
                  onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                  className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 focus:border-primary-500 outline-none text-slate-900 dark:text-white font-semibold"
                />
                <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {filteredBrands.length > 0 ? (
                <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-400">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider">
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">Brand / Manufacturer</th>
                      <th className="px-4 py-3 text-right">Items Listed</th>
                      <th className="px-4 py-3 text-right">Sales Volume</th>
                      <th className="px-4 py-3 text-right">Revenue Generated</th>
                      <th className="px-4 py-3 text-right">Share Index</th>
                      <th className="px-4 py-3 text-right">Avg Catalog Price</th>
                      <th className="px-4 py-3 text-center">Market Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredBrands.map((item) => (
                      <tr key={item.brand} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3.5 font-black text-primary-500">#{item.rank}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{item.brand}</td>
                        <td className="px-4 py-3.5 text-right font-medium">{item.itemsListed} Items</td>
                        <td className="px-4 py-3.5 text-right font-bold">{item.salesVolume.toLocaleString()} units</td>
                        <td className="px-4 py-3.5 text-right font-black text-emerald-500">${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3.5 text-right font-semibold">{item.shareIndex}%</td>
                        <td className="px-4 py-3.5 text-right font-semibold">${item.avgPrice.toFixed(2)}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md border ${
                            item.status === 'Dominant' 
                              ? 'bg-primary-500/10 text-primary-500 border-primary-500/20' 
                              : item.status === 'Stable' 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="w-full flex flex-col items-center justify-center py-10 text-center space-y-2">
                  <FileText className="w-8 h-8 text-slate-400" />
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs">No Brands Match Criteria</h4>
                  <p className="text-[11px] text-slate-400">Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BrandAnalytics;
