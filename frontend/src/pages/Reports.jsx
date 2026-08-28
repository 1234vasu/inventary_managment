import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  FileText,
  Download,
  Calendar,
  Search,
  AlertTriangle,
  FileBarChart,
  RefreshCw
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
    const token = localStorage.getItem('token');
    // Build query URL
    let url = `http://localhost:5000/api/reports/export/${format}?`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    // We append authorization token in URL parameter or open directly if backend allows it.
    // Wait, our backend endpoints require authentication.
    // Since browser downloads are triggered by direct link navigation, we can download the file
    // using Axios with authorization headers and write a blob helper to trigger save in browser!
    // This is clean, secure, and works with JWT headers without putting credentials in the URL!
    // Let's implement this blob helper:
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
    <div className="space-y-6">
      {/* Header and Download Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight dark:text-white flex items-center space-x-2.5">
            <FileBarChart className="w-8 h-8 text-primary-600 dark:text-primary-500" />
            <span>Store Transaction Reports</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review historical transactions, analyze payment modes, and download audit sheets.</p>
        </div>

        {sales.length > 0 && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleExport('excel')}
              className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-850 dark:text-slate-200 font-bold rounded-xl flex items-center space-x-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 transition text-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Excel</span>
            </button>
            
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-primary-500/20 transition text-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Date Filters bar */}
      <div className="premium-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-slate-500">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-extrabold uppercase tracking-wider">Date Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-450">Start:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white text-xs font-bold focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-450">End:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white text-xs font-bold focus:outline-none"
            />
          </div>

          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 rounded-lg transition"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Summary cards */}
      {sales.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="premium-card p-5 bg-white/50">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Total Orders</span>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{sales.length} transactions</h4>
          </div>
          <div className="premium-card p-5 bg-white/50">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Total Discounts Given</span>
            <h4 className="text-xl font-bold text-rose-500 mt-1">${totalDiscount.toFixed(2)}</h4>
          </div>
          <div className="premium-card p-5 bg-white/50">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Total Net Revenue</span>
            <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">${totalRevenue.toFixed(2)}</h4>
          </div>
        </div>
      )}

      {/* Reports Table list */}
      <div className="premium-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            <p className="text-slate-400 mt-3 text-sm">Loading transaction records...</p>
          </div>
        ) : error ? (
          <div className="py-10 text-center text-red-500">{error}</div>
        ) : sales.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">No transactions registered in this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Invoice Number</th>
                  <th className="py-3.5 px-6">Cashier</th>
                  <th className="py-3.5 px-6">Customer Name</th>
                  <th className="py-3.5 px-6 text-center">Payment Mode</th>
                  <th className="py-3.5 px-6 text-right">Discount</th>
                  <th className="py-3.5 px-6 text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {sales.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                    <td className="py-4 px-6 text-xs font-normal text-slate-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{order.invoiceNumber}</td>
                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                      {order.cashierId?.name || 'Deleted User'}
                    </td>
                    <td className="py-4 px-6 text-slate-800 dark:text-slate-200 font-bold">{order.customerName}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-lg border ${
                        order.paymentMode === 'UPI'
                          ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-100/50 dark:border-blue-900/50'
                          : order.paymentMode === 'Card'
                          ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 border-purple-100/50 dark:border-purple-900/50'
                          : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100/50 dark:border-emerald-900/50'
                      }`}>
                        {order.paymentMode}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-rose-500">${order.discount.toFixed(2)}</td>
                    <td className="py-4 px-6 text-right text-emerald-600 dark:text-emerald-400 font-bold">
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
