import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  FileText,
  Download,
  Calendar,
  Search,
  AlertTriangle,
  FileBarChart,
  RefreshCw,
  Sparkles,
  TrendingUp
} from 'lucide-react';

const Reports = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSalesReport = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };
      
      const { data } = await api.get('/reports/sales', { params });
      if (data.success) {
        setSales(data.orders);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve transaction reports list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReport();
  }, [startDate, endDate]);

  const handleExport = (format) => {
    let url = `http://localhost:5000/api/reports/export/${format}?`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    triggerSecureDownload(url, format);
  };

  const triggerSecureDownload = async (url, format) => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `sales_report_${new Date().toISOString().slice(0, 10)}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to download report file');
    }
  };

  const totalDiscount = sales.reduce((sum, s) => sum + s.discount, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.netAmount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#111827]/70 midnight:bg-[#070b14]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-extrabold text-primary-500 uppercase tracking-wider mb-0.5">
            <FileBarChart className="w-4 h-4" />
            <span>Audit & Financial Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Store Transaction Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review historical transactions, analyze payment channels, and generate formatted export sheets.
          </p>
        </div>

        {sales.length > 0 && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleExport('excel')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl flex items-center space-x-2 border border-slate-200 dark:border-slate-700 transition text-xs shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Excel</span>
            </button>
            
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-bold rounded-2xl flex items-center space-x-2 shadow-lg shadow-primary-500/25 transition text-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Date Filters bar */}
      <div className="premium-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-slate-500">
          <Calendar className="w-4 h-4 text-primary-500" />
          <span className="text-xs font-extrabold uppercase tracking-wider">Date Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-bold">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-bold">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-primary-500"
            />
          </div>

          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Summary cards */}
      {sales.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="premium-card p-5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Transactions</span>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{sales.length} orders</h4>
          </div>
          <div className="premium-card p-5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Discounts Granted</span>
            <h4 className="text-2xl font-black text-rose-500 mt-1">${totalDiscount.toFixed(2)}</h4>
          </div>
          <div className="premium-card p-5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Net Audited Revenue</span>
            <h4 className="text-2xl font-black text-emerald-500 mt-1">${totalRevenue.toFixed(2)}</h4>
          </div>
        </div>
      )}

      {/* Reports Table list */}
      <div className="premium-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            <p className="text-slate-400 text-xs font-bold">Loading transaction records...</p>
          </div>
        ) : error ? (
          <div className="py-10 text-center text-red-500 text-xs font-semibold">{error}</div>
        ) : sales.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs font-medium">No transactions found for the selected dates.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800/80 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Invoice Number</th>
                  <th className="py-3.5 px-6">Cashier Agent</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6 text-center">Payment Channel</th>
                  <th className="py-3.5 px-6 text-right">Discount</th>
                  <th className="py-3.5 px-6 text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {sales.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white font-mono">{order.invoiceNumber}</td>
                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {order.cashierId?.name || 'Authorized Cashier'}
                    </td>
                    <td className="py-4 px-6 text-slate-800 dark:text-slate-200 font-bold">{order.customerName}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md border ${
                        order.paymentMode === 'UPI'
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          : order.paymentMode === 'Card'
                          ? 'bg-primary-500/10 text-primary-500 border-primary-500/20'
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}>
                        {order.paymentMode}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-rose-500">${order.discount.toFixed(2)}</td>
                    <td className="py-4 px-6 text-right text-emerald-500 font-black">
                      ${order.netAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
