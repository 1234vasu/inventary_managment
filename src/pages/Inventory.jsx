import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  AlertTriangle,
  History,
  ArrowDownRight,
  ArrowUpRight,
  Sliders,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';

const Inventory = () => {
  const { isManager } = useAuth();
  const [lowStock, setLowStock] = useState([]);
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Restock Form Modal state
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockForm, setRestockForm] = useState({
    productId: '',
    quantityChanged: '',
    type: 'Stock In',
    remarks: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [lowRes, logRes, prodRes] = await Promise.all([
        api.get('/inventory/low-stock'),
        api.get('/inventory/logs'),
        api.get('/products')
      ]);

      if (lowRes.data.success) setLowStock(lowRes.data.products);
      if (logRes.data.success) setLogs(logRes.data.logs);
      if (prodRes.data.success) setProducts(prodRes.data.products);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve inventory log tracking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleOpenRestockModal = (prodId = '') => {
    setRestockForm({
      productId: prodId || (products[0]?._id || ''),
      quantityChanged: '',
      type: 'Stock In',
      remarks: ''
    });
    setFormError('');
    setIsRestockModalOpen(true);
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    const qty = parseInt(restockForm.quantityChanged);
    
    // Adjust quantity for Stock Out/Adjustment types
    let finalQty = qty;
    if (restockForm.type === 'Adjustment') {
      // Adjustment value can be negative or positive depending on what the user types
      if (isNaN(finalQty)) {
        setFormError('Please enter a valid numeric adjustment');
        setSubmitting(false);
        return;
      }
    } else {
      // Stock In or manual Stock Out
      if (isNaN(qty) || qty <= 0) {
        setFormError('Please enter a positive numeric quantity');
        setSubmitting(false);
        return;
      }
      if (restockForm.type === 'Stock Out') {
        finalQty = -qty;
      }
    }

    try {
      const { data } = await api.post('/inventory/restock', {
        productId: restockForm.productId,
        quantityChanged: finalQty,
        type: restockForm.type,
        remarks: restockForm.remarks
      });

      if (data.success) {
        setIsRestockModalOpen(false);
        fetchInventoryData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to execute stock update');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight dark:text-white">Inventory Controls</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Audit stock changes, restock products, and review low-inventory alerts.</p>
        </div>

        {isManager && (
          <button
            onClick={() => handleOpenRestockModal()}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-primary-500/20 transition text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Restock / Adjust Stock</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-slate-400 mt-3 text-sm">Querying inventory logs...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-500 rounded-2xl">{error}</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left panel: Low Stock Alerts List */}
          <div className="xl:col-span-1 space-y-6">
            <div className="premium-card p-6 flex flex-col h-full">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Low Stock Warnings</h3>
                  <p className="text-[11px] text-slate-400">Products requiring urgent replenishment.</p>
                </div>
                <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                  {lowStock.length} items
                </span>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-1">
                {lowStock.length > 0 ? (
                  lowStock.map((prod) => (
                    <div
                      key={prod._id}
                      className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{prod.name}</h4>
                        <span className="block text-[10px] text-slate-400">Min. Threshold: {prod.minStockThreshold} units</span>
                        <span className="block text-[10px] text-slate-500 font-semibold italic">Supplier: {prod.supplierId?.name}</span>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className="text-sm font-extrabold text-red-500">
                          {prod.quantity} Left
                        </span>
                        {isManager && (
                          <button
                            onClick={() => handleOpenRestockModal(prod._id)}
                            className="px-2.5 py-1 bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-extrabold text-[10px] uppercase tracking-wider rounded-lg border border-primary-200/50 hover:bg-primary-600 hover:text-white transition"
                          >
                            Restock
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400 text-sm">All products have sufficient stock levels.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Complete Stock History Logs */}
          <div className="xl:col-span-2 space-y-6">
            <div className="premium-card p-6">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-500">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Audit Logs & History</h3>
                  <p className="text-[11px] text-slate-400">Incremental inventory modifications tracking sheet.</p>
                </div>
                <button
                  onClick={fetchInventoryData}
                  className="ml-auto p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Product Details</th>
                      <th className="py-3 px-4 text-center">Operation</th>
                      <th className="py-3 px-4 text-center">Quantity</th>
                      <th className="py-3 px-4">Authorized By</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {logs.length > 0 ? (
                      logs.map((log) => {
                        const isIncrease = log.quantityChanged > 0;
                        const qtyText = isIncrease ? `+${log.quantityChanged}` : `${log.quantityChanged}`;
                        
                        return (
                          <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="py-3.5 px-4 text-xs font-normal text-slate-400">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-slate-950 dark:text-white font-bold block">
                                {log.productId?.name || 'Deleted Product'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">Barcode: {log.productId?.barcode}</span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-lg border ${
                                log.type === 'Stock In'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100/50 dark:border-emerald-900/50'
                                  : log.type === 'Stock Out'
                                  ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-100/50 dark:border-rose-900/50'
                                  : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 border-indigo-100/50 dark:border-indigo-900/50'
                              }`}>
                                {log.type === 'Stock In' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                <span>{log.type}</span>
                              </span>
                            </td>
                            <td className={`py-3.5 px-4 text-center font-extrabold ${isIncrease ? 'text-emerald-500' : 'text-red-500'}`}>
                              {qtyText}
                            </td>
                            <td className="py-3.5 px-4 text-xs">
                              <span className="block font-bold text-slate-850 dark:text-slate-200">{log.updatedBy?.name}</span>
                              <span className="text-[9px] uppercase font-extrabold text-slate-400">{log.updatedBy?.role}</span>
                            </td>
                            <td className="py-3.5 px-4 text-xs font-normal text-slate-500 max-w-[150px] truncate" title={log.remarks}>
                              {log.remarks || '—'}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-10 text-center text-slate-400">No stock logs generated.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Restock/Adjustment Modal */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#131c2e] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Adjust Product Inventory</h3>
              <button
                onClick={() => setIsRestockModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4.5">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-500 rounded-xl text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Product Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product *</label>
                <select
                  value={restockForm.productId}
                  onChange={(e) => setRestockForm({ ...restockForm, productId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                >
                  {products.map((prod) => (
                    <option key={prod._id} value={prod._id}>
                      {prod.name} (Stock: {prod.quantity} units)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Adjust Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Operation Type *</label>
                  <select
                    value={restockForm.type}
                    onChange={(e) => setRestockForm({ ...restockForm, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option value="Stock In">Stock In (Manual Add)</option>
                    <option value="Stock Out">Stock Out (Manual Remove)</option>
                    <option value="Adjustment">Adjustment (+/- Audit)</option>
                  </select>
                </div>

                {/* Adjust Quantity */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Quantity Changed *</label>
                  <input
                    type="number"
                    required
                    value={restockForm.quantityChanged}
                    onChange={(e) => setRestockForm({ ...restockForm, quantityChanged: e.target.value })}
                    placeholder={restockForm.type === 'Adjustment' ? 'e.g. -15 or 25' : 'e.g. 50'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Audit Remarks</label>
                <textarea
                  value={restockForm.remarks}
                  onChange={(e) => setRestockForm({ ...restockForm, remarks: e.target.value })}
                  placeholder="Reason for stock movement (e.g., Supplier Batch #04, Damaged inventory discard, Audit reconciliation)"
                  rows="3"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition text-sm disabled:opacity-50"
                >
                  {submitting ? 'Applying...' : 'Apply Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
