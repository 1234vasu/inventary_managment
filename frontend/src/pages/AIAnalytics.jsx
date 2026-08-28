import React, { useEffect, useState } from 'react';
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
  BarChart3
} from 'lucide-react';

const AIAnalytics = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-6">
        {/* Glowing brain animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="bg-primary-600 dark:bg-primary-500 p-5 rounded-3xl relative border border-primary-400/30">
            <Cpu className="w-10 h-10 text-white animate-spin duration-3000" />
          </div>
        </div>
        <div className="flex flex-col items-center space-y-2 text-center">
          <h3 className="text-xl font-bold dark:text-white">AI Sales Forecast & Analytics</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
            Please wait while Python feeds the MERN historical sales dataset into Scikit-Learn to fit and train the Linear Regression models...
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

  // Find top brand by predicted sales
  const topBrandBySales = [...brandAggList].sort((a, b) => b.predictedSales - a.predictedSales)[0];

  // Find brand with highest positive average slope (growth)
  const fastestGrowingBrand = [...brandAggList]
    .filter(b => b.avgSlope > 0)
    .sort((a, b) => b.avgSlope - a.avgSlope)[0];

  // Find brand with highest replenishment quantity needed
  const priorityBrandToRestock = [...brandAggList].filter(b => b.recQty > 0).sort((a, b) => b.recQty - a.recQty)[0];

  // Chart data mapping
  const chartData = predictions.slice(0, 7).map((item) => ({
    name: item.productName.slice(0, 12),
    'Current Stock': item.currentStock,
    'Predicted Demand': Math.round(item.predictedSalesNextMonth)
  }));

  const brandPieData = brandAggList.map((brand) => ({
    name: brand.name,
    value: Math.round(brand.predictedSales),
  })).sort((a, b) => b.value - a.value);

  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight dark:text-white flex items-center space-x-2.5">
            <BrainCircuit className="w-8 h-8 text-primary-600 dark:text-primary-500" />
            <span>AI Predictive Inventory Planner</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Linear Regression models predict next month's sales and recommend restock quantities using 12 months of sales records.
          </p>
        </div>

        <button
          onClick={() => fetchAIAnalysis(true)}
          disabled={refreshing}
          className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl flex items-center space-x-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 transition duration-150 text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Recalculating...' : 'Refresh AI Projections'}</span>
        </button>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-500 rounded-2xl flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">AI Module Failed to Execute</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
            <p className="text-[11px] text-slate-400 mt-2 italic font-semibold">
              * Verification Note: Ensure you run `pip install -r requirements.txt` inside the `ai-module` folder and Python is configured on your PATH.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="premium-card p-6 border-l-4 border-l-red-500">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Restocking Needed</span>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{restockItems.length}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Products where stock is below forecast demand.</p>
              </div>
            </div>
            
            <div className="premium-card p-6 border-l-4 border-l-emerald-500">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Healthy Stock Levels</span>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{healthyItems.length}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Products with secure quantities for next month.</p>
              </div>
            </div>

            <div className="premium-card p-6 border-l-4 border-l-primary-500">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">AI Model Status</span>
                <h3 className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">Active</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Linear Regression fitted on MERN aggregates.</p>
              </div>
            </div>
          </div>

          {/* AI Brand Insights & Suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Brand Optimization Suggestions</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topBrandBySales && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start space-x-3.5 shadow-sm">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Top Brand By Demand</span>
                      <h5 className="font-extrabold text-slate-900 dark:text-white text-base">{topBrandBySales.name}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Predicted sales volume of <strong className="text-slate-800 dark:text-slate-200">{Math.round(topBrandBySales.predictedSales)} units</strong> next month across {topBrandBySales.productCount} products.
                      </p>
                    </div>
                  </div>
                )}

                {fastestGrowingBrand && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start space-x-3.5 shadow-sm">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Growth Leader</span>
                      <h5 className="font-extrabold text-slate-900 dark:text-white text-base">{fastestGrowingBrand.name}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Strong upward sales velocity with an average monthly coefficient of <strong className="text-emerald-500">+{fastestGrowingBrand.avgSlope.toFixed(2)}</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {priorityBrandToRestock ? (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start space-x-3.5 shadow-sm md:col-span-2">
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                      <Zap className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Restock Priority Suggestion</span>
                      <h5 className="font-extrabold text-slate-900 dark:text-white text-base">{priorityBrandToRestock.name}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        We recommend prioritizing a restock order of <strong className="text-rose-500">{priorityBrandToRestock.recQty} units</strong> across <strong className="text-slate-800 dark:text-slate-200">{priorityBrandToRestock.restockCount} items</strong> to prevent stockouts next month due to high predicted demand.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start space-x-3.5 shadow-sm md:col-span-2">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Restock Status</span>
                      <h5 className="font-extrabold text-slate-900 dark:text-white text-base">All Brands Secured</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        All brands have healthy stock levels relative to predicted demand. No immediate restock actions are suggested.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Pie chart showing predicted demand share */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full">
              <div className="space-y-1 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Brand Predicted Sales Share</span>
                </h3>
                <p className="text-[10px] text-slate-400">Relative allocation of next month's predicted sales volume.</p>
              </div>

              <div className="h-40 w-full flex items-center justify-center">
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
                        backgroundColor: 'rgba(30, 41, 59, 0.8)',
                        borderRadius: '0.75rem',
                        border: 'none',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Legends */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t border-slate-150 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {brandPieData.slice(0, 4).map((entry, index) => (
                  <div key={entry.name} className="flex items-center space-x-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="truncate">{entry.name}: {entry.value}u</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Forecasting comparison chart */}
          <div className="premium-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Demand Forecast vs Current Stock</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Visual comparison for the first 7 products in catalogue.</p>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Current Stock" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Predicted Demand" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Replenishment Table */}
          <div className="premium-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">AI Replenishment Recommendations</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Restock recommendation is triggered if current stock falls below minimum threshold OR next month's predicted sales.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4 text-center">Current Stock</th>
                    <th className="py-3.5 px-4 text-center">Predicted Sales (1M)</th>
                    <th className="py-3.5 px-4 text-center">Sales Trend</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Recommended Order</th>
                    <th className="py-3.5 px-4">Supplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {predictions.map((item) => {
                    const isRestock = item.recommendation === 'Restock';
                    
                    return (
                      <tr key={item.productId} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{item.productName}</td>
                        <td className="py-4 px-4 text-center">{item.currentStock} units</td>
                        <td className="py-4 px-4 text-center font-extrabold text-slate-900 dark:text-white">
                          {item.predictedSalesNextMonth} units
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-1">
                            {item.trend === 'Upward' ? (
                              <span className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                                <TrendingUp className="w-3.5 h-3.5 mr-1" /> Upward
                              </span>
                            ) : item.trend === 'Downward' ? (
                              <span className="flex items-center text-rose-500 text-xs font-bold bg-rose-500/10 px-2 py-0.5 rounded-lg">
                                <TrendingDown className="w-3.5 h-3.5 mr-1" /> Downward
                              </span>
                            ) : (
                              <span className="flex items-center text-slate-400 text-xs font-bold bg-slate-500/10 px-2 py-0.5 rounded-lg">
                                <Minus className="w-3.5 h-3.5 mr-1" /> Stable
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center">
                            {isRestock ? (
                              <span className="flex items-center space-x-1 px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-md bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100/50 dark:border-red-900/50">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Restock</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-1 px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-md bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border border-emerald-100/50 dark:border-emerald-900/50">
                                <CheckCircle className="w-3 h-3" />
                                <span>Secured</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`py-4 px-4 text-center font-extrabold text-sm ${isRestock ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`}>
                          {isRestock ? `+${item.recommendedQuantity} units` : '0'}
                        </td>
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-450 text-xs">{item.supplier}</td>
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
