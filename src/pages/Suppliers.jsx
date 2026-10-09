import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';

const Suppliers = () => {
  const { isManager, isAdmin } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  
  // Form state
  const [form, setForm] = useState({
    name: '',
    contactNumber: '',
    email: '',
    address: ''
  });
  const [formError, setFormError] = useState('');

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/suppliers');
      if (data.success) {
        setSuppliers(data.suppliers);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve supplier profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddClick = () => {
    setEditingSupplier(null);
    setForm({
      name: '',
      contactNumber: '',
      email: '',
      address: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleEditClick = (supplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name,
      contactNumber: supplier.contactNumber,
      email: supplier.email || '',
      address: supplier.address || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name || !form.contactNumber) {
      setFormError('Supplier Name and Contact Number are required');
      return;
    }

    try {
      if (editingSupplier) {
        // Edit
        const { data } = await api.put(`/suppliers/${editingSupplier._id}`, form);
        if (data.success) {
          setIsModalOpen(false);
          fetchSuppliers();
        }
      } else {
        // Add
        const { data } = await api.post('/suppliers', form);
        if (data.success) {
          setIsModalOpen(false);
          fetchSuppliers();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit supplier details');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier profile?')) {
      try {
        const { data } = await api.delete(`/suppliers/${id}`);
        if (data.success) {
          fetchSuppliers();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Could not delete supplier');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight dark:text-white">Supplier Directories</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage external supplier contacts, catalog profiles, and warehouse details.</p>
        </div>

        {isManager && (
          <button
            onClick={handleAddClick}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-primary-500/20 transition text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-slate-400 mt-3 text-sm">Querying suppliers list...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-500 rounded-2xl">{error}</div>
      ) : suppliers.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm">No suppliers registered in directories.</div>
      ) : (
        /* Suppliers Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
          {suppliers.map((sup) => (
            <div key={sup._id} className="premium-card p-6 flex flex-col justify-between space-y-6">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{sup.name}</h3>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">Supplier Profile</span>
                </div>

                {isManager && (
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleEditClick(sup)}
                      className="p-1.5 bg-slate-100 hover:bg-primary-100 dark:bg-slate-800 dark:hover:bg-primary-950/30 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition"
                      title="Edit Supplier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(sup._id)}
                        className="p-1.5 bg-slate-100 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-red-950/30 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition"
                        title="Delete Supplier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Contacts Details */}
              <div className="space-y-3 font-medium text-xs text-slate-650 dark:text-slate-350">
                <div className="flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>{sup.contactNumber}</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <a href={`mailto:${sup.email}`} className="hover:text-primary-500 transition">{sup.email || 'No email registered'}</a>
                </div>
                <div className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5" />
                  <span className="leading-relaxed">{sup.address || 'No address registered'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>Created: {new Date(sup.createdAt).toLocaleDateString()}</span>
                <span>ID: {sup._id.slice(-6)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supplier Modal (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#131c2e] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingSupplier ? 'Edit Supplier Profile' : 'Add New Supplier'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-500 rounded-xl text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Nestlé Wholesale Corp"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Contact Number *</label>
                <input
                  type="text"
                  required
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                  placeholder="e.g. +1-800-..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. order@nestle.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Address / Headquarters</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street details, state, country"
                  rows="3"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition text-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
