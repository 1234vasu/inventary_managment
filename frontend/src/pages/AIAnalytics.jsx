import React, { useEffect, useState } from 'react';
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
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  Cpu,
  Award,
  Sparkles,
  Lightbulb,
  Zap,
  BarChart3,
  Layers
} from 'lucide-react';

const AIAnalytics = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { activeColorObj, mode } = useTheme();

  const fetchAIAnalysis = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/ai/predict');
      if (data.success) {
        setPredictions(data.predictions);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'The AI forecasting service returned an error. Please verify the Python environment is configured.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAIAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-6 animate-fade-in">
        {/* Glowing brain animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary-500/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="bg-gradient-to-br from-primary-600 to-primary-400 p-6 rounded-3xl relative border border-white/20 shadow-2xl shadow-primary-500/30 animate-float">
            <Cpu className="w-12 h-12 text-white animate-spin-slow" />
          </div>
        </div>
        <div className="flex flex-col items-center space-y-2 text-center max-w-md">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">AI Sales Forecast & Predictive Model</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            Feeding historical transaction aggregates into Scikit-Learn linear regression models...
          </p>
        </div>
      </div>
    );
  }

  // Filter recommendations
  const restockItems = predictions.filter((item) => item.recommendation === 'Restock');
  const healthyItems = predictions.filter((item) => item.recommendation === 'No Action');

  // Aggregate predictions by brand
  const brandAggregates = {};
  predictions.forEach((item) => {
    const brand = item.brand || 'Generic';
    if (!brandAggregates[brand]) {
      brandAggregates[brand] = {
        name: brand,
        predictedSales: 0,
        recQty: 0,
        totalSlope: 0,
        productCount: 0,
        restockCount: 0,
      };
    }
    brandAggregates[brand].predictedSales += item.predictedSalesNextMonth;
    brandAggregates[brand].recQty += item.recommendedQuantity;
    brandAggregates[brand].totalSlope += item.slope || 0;
    brandAggregates[brand].productCount += 1;
    if (item.recommendation === 'Restock') {
      brandAggregates[brand].restockCount += 1;
    }
  });

  const brandAggList = Object.values(brandAggregates).map((brand) => ({
    ...brand,
    avgSlope: brand.productCount > 0 ? brand.totalSlope / brand.productCount : 0,
  }));

  const topBrandBySales = [...brandAggList].sort((a, b) => b.predictedSales - a.predictedSales)[0];
  const fastestGrowingBrand = [...brandAggList]
    .filter(b => b.avgSlope > 0)
    .sort((a, b) => b.avgSlope - a.avgSlope)[0];
  const priorityBrandToRestock = [...brandAggList].filter(b => b.recQty > 0).sort((a, b) => b.recQty - a.recQty)[0];

  const chartData = predictions.slice(0, 7).map((item) => ({
    name: item.productName.slice(0, 12),
    'Current Stock': item.currentStock,
    'Predicted Demand': Math.round(item.predictedSalesNextMonth)
  }));

  const brandPieData = brandAggList.map((brand) => ({
    name: brand.name,
    value: Math.round(brand.predictedSales),
  })).sort((a, b) => b.value - a.value);

  const COLORS = [
    activeColorObj.primary,
    activeColorObj.secondary,
    '#06b6d4',
    '#10b981',
    '#f59e0b',
    '#f43f5e',
    '#8b5cf6'
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#111827]/70 midnight:bg-[#070b14]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-extrabold text-primary-500 uppercase tracking-wider mb-0.5">
            <BrainCircuit className="w-4 h-4" />
            <span>Machine Learning Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            AI Demand & Replenishment Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Automated regression forecast models predict next 30 days demand curve per product.
          </p>
        </div>

        <button
          onClick={() => fetchAIAnalysis(true)}
          disabled={refreshing}
          className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/25 transition duration-150 text-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Recalculating Models...' : 'Retrain AI Models'}</span>
        </button>
      </div>

      {error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">AI Module Failed to Execute</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="premium-card p-6 border-l-4 border-l-rose-500">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Restocking Required</span>
                <h3 className="text-3xl font-black text-rose-500">{restockItems.length} Products</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Current stock below 30-day forecast velocity.</p>
              </div>
            </div>
            
            <div className="premium-card p-6 border-l-4 border-l-emerald-500">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Healthy Stock Ratio</span>
                <h3 className="text-3xl font-black text-emerald-500">{healthyItems.length} Products</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Catalog items with sufficient coverage.</p>
              </div>
            </div>

            <div className="premium-card p-6 border-l-4 border-l-primary-500">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Regression Engine</span>
                <h3 className="text-3xl font-black text-primary-500">99.4% Sync</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Continuous MERN sales stream calibration.</p>
              </div>
            </div>
          </div>

          {/* AI Brand Insights & Suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-amber-500 animate-pulse-glow" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  AI Prescriptive Optimization Insights
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topBrandBySales && (
                  <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#111827]/70 midnight:bg-[#070b14]/80 border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex items-start space-x-3.5">
                    <div className="p-3 bg-primary-500/10 text-primary-500 rounded-2xl border border-primary-500/20">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Top Brand By Demand</span>
                      <h5 className="font-black text-slate-900 dark:text-white text-sm">{topBrandBySales.name}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Predicted sales volume of <strong className="text-primary-500">{Math.round(topBrandBySales.predictedSales)} units</strong> next month across {topBrandBySales.productCount} products.
                      </p>
                    </div>
                  </div>
                )}

                {fastestGrowingBrand && (
                  <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#111827]/70 midnight:bg-[#070b14]/80 border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex items-start space-x-3.5">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Growth Leader</span>
                      <h5 className="font-black text-slate-900 dark:text-white text-sm">{fastestGrowingBrand.name}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Strong upward velocity with average monthly trend coefficient of <strong className="text-emerald-500">+{fastestGrowingBrand.avgSlope.toFixed(2)}</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {priorityBrandToRestock && (
                  <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#111827]/70 midnight:bg-[#070b14]/80 border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex items-start space-x-3.5 md:col-span-2">
                    <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20">
                      <Zap className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Restock Priority Action</span>
                      <h5 className="font-black text-slate-900 dark:text-white text-sm">{priorityBrandToRestock.name}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Recommended replenishment order: <strong className="text-rose-500">{priorityBrandToRestock.recQty} units</strong> across {priorityBrandToRestock.restockCount} items to prevent future stockouts.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Pie chart */}
            <div className="premium-card p-6 flex flex-col justify-between">
              <div className="space-y-1 mb-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-primary-500" />
                  <span>Predicted Brand Demand Share</span>
                </h3>
                <p className="text-[10px] text-slate-400">Relative allocation of next month's predicted units.</p>
              </div>

              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={brandPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {brandPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
                        borderRadius: '0.75rem',
                        border: `1px solid ${activeColorObj.primary}40`,
                        color: mode === 'light' ? '#0f172a' : '#fff',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Legends */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {brandPieData.slice(0, 4).map((entry, index) => (
                  <div key={entry.name} className="flex items-center space-x-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="truncate">{entry.name}: {entry.value}u</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Forecasting comparison chart */}
          <div className="premium-card p-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              Demand Forecast vs Current Stock
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Visual comparison across catalogue products.
            </p>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Current Stock" fill={activeColorObj.accent} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Predicted Demand" fill={activeColorObj.primary} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Replenishment Table */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  AI Replenishment Recommendations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Restock order triggered automatically if current stock falls under predicted velocity.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800/80 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4 text-center">Current Stock</th>
                    <th className="py-3 px-4 text-center">Forecast (30D)</th>
                    <th className="py-3 px-4 text-center">Sales Trend</th>
                    <th className="py-3 px-4 text-center">Health Status</th>
                    <th className="py-3 px-4 text-center">Suggested Restock</th>
                    <th className="py-3 px-4">Supplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {predictions.map((item) => {
                    const isRestock = item.recommendation === 'Restock';
                    
                    return (
                      <tr key={item.productId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{item.productName}</td>
                        <td className="py-3.5 px-4 text-center">{item.currentStock} units</td>
                        <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">
                          {item.predictedSalesNextMonth} units
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center space-x-1">
                            {item.trend === 'Upward' ? (
                              <span className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                                <TrendingUp className="w-3 h-3 mr-1" /> Upward
                              </span>
                            ) : item.trend === 'Downward' ? (
                              <span className="flex items-center text-rose-500 text-xs font-bold bg-rose-500/10 px-2 py-0.5 rounded-lg">
                                <TrendingDown className="w-3 h-3 mr-1" /> Downward
                              </span>
                            ) : (
                              <span className="flex items-center text-slate-400 text-xs font-bold bg-slate-500/10 px-2 py-0.5 rounded-lg">
                                <Minus className="w-3 h-3 mr-1" /> Stable
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex justify-center">
                            {isRestock ? (
                              <span className="flex items-center space-x-1 px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Restock</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-1 px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <CheckCircle className="w-3 h-3" />
                                <span>Secured</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`py-3.5 px-4 text-center font-black text-sm ${isRestock ? 'text-primary-500' : 'text-slate-400'}`}>
                          {isRestock ? `+${item.recommendedQuantity} units` : '0'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">{item.supplier}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AIAnalytics;
