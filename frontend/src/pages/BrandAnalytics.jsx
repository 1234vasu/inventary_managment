import React, { useState, useEffect } from 'react';
import api from '../services/api';
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
  AlertTriangle
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

  const fetchBrandData = async (isSync = false) => {
    if (isSync) setSyncing(true);
    else setLoading(true);
    setError('');

    try {
      // Fetch categories on mount
      if (categories.length === 0) {
        const catRes = await api.get('/categories');
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      }

      // Build API request parameters
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

  // Get unique brands from dynamic backend response for dropdown select
  const uniqueBrands = Array.from(new Set(brandsData.map((b) => b.brand)));

  // Filter list
  const filteredBrands = brandsData.filter((item) => {
    const matchesSearch = item.brand.toLowerCase().includes(filters.searchQuery.toLowerCase());
    const matchesBrand = filters.brand === 'all' || item.brand === filters.brand;
    return matchesSearch && matchesBrand;
  });

  // Recharts 1: BarChart for top brand sales volumes
  const topSalesChartData = brandsData.slice(0, 6).map((b) => ({
    name: b.brand,
    'Sales Volume': b.salesVolume
  }));

  // Recharts 2: PieChart for revenue share
  const revenueChartData = brandsData.slice(0, 6).map((b) => ({
    name: b.brand,
    value: Math.round(b.revenue)
  }));

  const CHART_COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#14b8a6'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 dark:text-blue-400 font-bold">Brand Analytics</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-3">
            <Award className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            <span>Brand Analytics</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Enterprise brand share diagnostics, market velocity tracking, and category penetration index.
          </p>
        </div>

        {/* Sync Action Button */}
        <button
          onClick={() => fetchBrandData(true)}
          disabled={syncing}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Sync Feed'}</span>
        </button>
      </div>

      {/* Outlined Style Filter Controls */}
      <div className="bg-white dark:bg-[#131c2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-bold text-sm border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Analytical Segmentation Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Time Range Select */}
          <div className="relative">
            <label className="absolute -top-2 left-3 px-1.5 bg-white dark:bg-[#131c2e] text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Time Range
            </label>
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 bg-transparent focus-within:border-blue-500 dark:focus-within:border-blue-400 transition">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2.5" />
              <select
                value={filters.timeRange}
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none border-none cursor-pointer font-medium"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="6months">Last 6 Months</option>
                <option value="ytd">Year to Date</option>
                <option value="all">All-Time</option>
              </select>
            </div>
          </div>

          {/* Product Category Select */}
          <div className="relative">
            <label className="absolute -top-2 left-3 px-1.5 bg-white dark:bg-[#131c2e] text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Category Group
            </label>
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 bg-transparent focus-within:border-blue-500 dark:focus-within:border-blue-400 transition">
              <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2.5" />
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none border-none cursor-pointer font-medium"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand Scope Select */}
          <div className="relative">
            <label className="absolute -top-2 left-3 px-1.5 bg-white dark:bg-[#131c2e] text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Brand Scope
            </label>
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 bg-transparent focus-within:border-blue-500 dark:focus-within:border-blue-400 transition">
              <Tags className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2.5" />
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none border-none cursor-pointer font-medium"
              >
                <option value="all">All Brands</option>
                {uniqueBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex items-stretch">
            <button
              onClick={handleResetFilters}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-xl font-semibold text-sm transition flex items-center justify-center space-x-2"
            >
              <span>Reset Parameters</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-500 rounded-2xl flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Highlight Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI 1 */}
            <div className="premium-card p-6 flex items-center justify-between border-l-4 border-l-blue-600 dark:border-l-blue-500">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Top Performing Brand</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white truncate max-w-[150px]" title={summary.topPerformingBrand}>
                  {summary.topPerformingBrand}
                </h3>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {summary.topBrandShare}% sales share
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100/50 dark:border-blue-900/30">
                <Award className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 2 */}
            <div className="premium-card p-6 flex items-center justify-between border-l-4 border-l-blue-500 dark:border-l-blue-400">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Monitored Brands</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{summary.activeBrands} Active</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tracked in active inventory</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400 shadow-sm border border-blue-100/50 dark:border-blue-900/30">
                <Tags className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 3 */}
            <div className="premium-card p-6 flex items-center justify-between border-l-4 border-l-blue-400 dark:border-l-blue-500">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Brand Volume Sold</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{summary.totalVolumeSold.toLocaleString()} units</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Aggregated current period</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-400 dark:text-blue-300 shadow-sm border border-blue-100/50 dark:border-blue-900/30">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 4 */}
            <div className="premium-card p-6 flex items-center justify-between border-l-4 border-l-cyan-500 dark:border-l-cyan-400">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Brand Revenue</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sum of net sales value</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 text-cyan-500 dark:text-cyan-400 shadow-sm border border-cyan-100/50 dark:border-cyan-900/30">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Analytics Charts Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart Panel 1: Brand Market Share */}
            <div className="premium-card p-6 flex flex-col space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                  <span>Brand Market Share (Sales Volume)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Comparative units sold by top 6 manufacturers.</p>
              </div>

              <div className="h-72 w-full">
                {topSalesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSalesChartData}>
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
                      <Bar dataKey="Sales Volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No data available for the selected filters.
                  </div>
                )}
              </div>
            </div>

            {/* Chart Panel 2: Brand Revenue Breakdown */}
            <div className="premium-card p-6 flex flex-col space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                  <span>Brand Revenue Penetration Share</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manufacturer financial footprint distribution.</p>
              </div>

              <div className="h-72 w-full flex items-center justify-center">
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
                          backgroundColor: 'rgba(30, 41, 59, 0.8)',
                          borderRadius: '0.75rem',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px'
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
          <div className="premium-card p-6 flex flex-col space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                  <span>Brand Performance Metrics Matrix</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Standard indicators, revenue contribution, and product allocation weights.</p>
              </div>

              {/* Search Input Filter */}
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 bg-transparent focus:border-blue-500 dark:focus:border-blue-400 outline-none text-slate-700 dark:text-slate-300 font-semibold"
                  />
                  <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                </div>
              </div>
            </div>

            {/* Table Layout */}
            <div className="border border-slate-100 dark:border-slate-800/60 rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-slate-900/10">
              {filteredBrands.length > 0 ? (
                <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-400">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#131c2e]/60 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider">
                      <th className="px-6 py-4">Rank</th>
                      <th className="px-6 py-4">Brand / Manufacturer</th>
                      <th className="px-6 py-4 text-right">Items Listed</th>
                      <th className="px-6 py-4 text-right">Sales Volume</th>
                      <th className="px-6 py-4 text-right">Revenue Generated</th>
                      <th className="px-6 py-4 text-right">Share Index</th>
                      <th className="px-6 py-4 text-right">Avg Catalog Price</th>
                      <th className="px-6 py-4 text-center">Market Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrands.map((item) => (
                      <tr key={item.brand} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors border-b border-slate-100/50 dark:border-slate-800/30">
                        <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{item.rank}</td>
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{item.brand}</td>
                        <td className="px-6 py-4 text-right font-medium">{item.itemsListed} Products</td>
                        <td className="px-6 py-4 text-right font-medium">{item.salesVolume.toLocaleString()} units</td>
                        <td className="px-6 py-4 text-right font-medium text-slate-950 dark:text-slate-100">${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-right font-medium">{item.shareIndex}%</td>
                        <td className="px-6 py-4 text-right font-medium">${item.avgPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border ${
                            item.status === 'Dominant' 
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100/30 dark:border-blue-900/30' 
                              : item.status === 'Stable' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100/30 dark:border-emerald-900/30' 
                                : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/30 dark:border-slate-700/30'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="w-full flex flex-col items-center justify-center py-10 px-6 text-center space-y-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100/50 dark:border-blue-900/30 flex items-center justify-center shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">No Brands Match Criteria</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Try adjusting your analytical segmentation filters or reset search parameters.
                    </p>
                  </div>
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
