import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  FolderPlus,
  RefreshCw,
  X
} from 'lucide-react';

const Products = () => {
  const { isManager, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Modal controls
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // Form states
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    barcode: '',
    categoryId: '',
    price: '',
    quantity: '',
    minStockThreshold: '',
    supplierId: '',
    brand: ''
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormError, setCategoryFormError] = useState('');

  const [formError, setFormError] = useState('');

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const prodParams = {
        search: search || undefined,
        category: selectedCategory || undefined,
        lowStock: lowStockFilter ? 'true' : undefined
      };
      
      const [prodRes, catRes, supRes] = await Promise.all([
        api.get('/products', { params: prodParams }),
        api.get('/categories'),
        api.get('/suppliers')
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (supRes.data.success) setSuppliers(supRes.data.suppliers);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve product catalog information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory, lowStockFilter]);

  // Open product modal for add
  const handleAddProductClick = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      barcode: '',
      categoryId: categories[0]?._id || '',
      price: '',
      quantity: '0',
      minStockThreshold: '10',
      supplierId: suppliers[0]?._id || '',
      brand: ''
    });
    setFormError('');
    setIsProductModalOpen(true);
  };

  // Open product modal for edit
  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      barcode: product.barcode,
      categoryId: product.categoryId?._id || '',
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      minStockThreshold: product.minStockThreshold.toString(),
      supplierId: product.supplierId?._id || '',
      brand: product.brand || ''
    });
    setFormError('');
    setIsProductModalOpen(true);
  };

  // Submit product Form (Add or Edit)
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      quantity: parseInt(productForm.quantity),
      minStockThreshold: parseInt(productForm.minStockThreshold)
    };

    // Validation
    if (!payload.name || !payload.barcode || !payload.categoryId || isNaN(payload.price) || !payload.supplierId || !payload.brand) {
      setFormError('Please fill in all required fields with valid values');
      return;
    }

    try {
      if (editingProduct) {
        // Edit Product
        const { data } = await api.put(`/products/${editingProduct._id}`, payload);
        if (data.success) {
          setIsProductModalOpen(false);
          fetchData();
        }
      } else {
        // Add Product
        const { data } = await api.post('/products', payload);
        if (data.success) {
          setIsProductModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit product form');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to remove this product from the inventory catalog?')) {
      try {
        const { data } = await api.delete(`/products/${id}`);
        if (data.success) {
          fetchData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Could not delete product');
      }
    }
  };

  // Submit category form (Add or Edit)
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setCategoryFormError('');

    if (!categoryForm.name) {
      setCategoryFormError('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        // Edit Category
        const { data } = await api.put(`/categories/${editingCategory._id}`, categoryForm);
        if (data.success) {
          setCategoryForm({ name: '', description: '' });
          setEditingCategory(null);
          fetchData(); // Refresh category listings and dropdown
        }
      } else {
        // Add Category
        const { data } = await api.post('/categories', categoryForm);
        if (data.success) {
          setCategoryForm({ name: '', description: '' });
          fetchData(); // Refresh category listings and dropdown
        }
      }
    } catch (err) {
      setCategoryFormError(err.response?.data?.message || 'Failed to submit category form');
    }
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to remove this category?')) {
      setCategoryFormError('');
      try {
        const { data } = await api.delete(`/categories/${id}`);
        if (data.success) {
          // If the deleted category was currently being edited, reset the form
          if (editingCategory?._id === id) {
            setEditingCategory(null);
            setCategoryForm({ name: '', description: '' });
          }
          fetchData(); // Refresh category listings and dropdown
        }
      } catch (err) {
        setCategoryFormError(err.response?.data?.message || 'Could not delete category');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight dark:text-white">Product Catalog</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage supermarket items, categories, and inventory configurations.</p>
        </div>
        
        {isManager && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl flex items-center space-x-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 transition duration-150 text-sm"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Manage Categories</span>
            </button>
            <button
              onClick={handleAddProductClick}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/35 transition duration-150 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="premium-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by Product Name or Barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs font-bold focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Low Stock Toggle */}
          <label className="flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockFilter}
              onChange={() => setLowStockFilter(!lowStockFilter)}
              className="rounded text-primary-600 focus:ring-primary-500 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
            <span>Low Stock Only</span>
          </label>

          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              setLowStockFilter(false);
            }}
            className="p-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="premium-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            <p className="text-slate-400 mt-3 text-sm">Querying catalogue...</p>
          </div>
        ) : error ? (
          <div className="py-10 text-center text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            No products found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="py-3.5 px-6">Product Details</th>
                  <th className="py-3.5 px-6">Barcode</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6 text-center">Unit Price</th>
                  <th className="py-3.5 px-6 text-center">Stock Count</th>
                  <th className="py-3.5 px-6">Supplier</th>
                  {isManager && <th className="py-3.5 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {products.map((prod) => {
                  const isLowStock = prod.quantity <= prod.minStockThreshold;
                  return (
                    <tr key={prod._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4.5 px-6">
                        <span className="text-slate-900 dark:text-white font-bold block">{prod.name}</span>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-normal">ID: {prod._id.slice(-6)}</span>
                          <span className="text-[11px] text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{prod.brand}</span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 font-mono text-xs">{prod.barcode}</td>
                      <td className="py-4.5 px-6">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {prod.categoryId?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-center font-bold text-slate-900 dark:text-white">
                        ${prod.price.toFixed(2)}
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`font-bold ${isLowStock ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>
                            {prod.quantity} units
                          </span>
                          {isLowStock && (
                            <span className="flex items-center space-x-1 mt-0.5 px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded-md bg-red-50 dark:bg-red-950/30 text-red-500 border border-red-100/50 dark:border-red-900/50">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Low Stock</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-slate-500 dark:text-slate-400 text-xs">
                        {prod.supplierId?.name || 'Unknown'}
                      </td>
                      {isManager && (
                        <td className="py-4.5 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditProductClick(prod)}
                              className="p-2 bg-slate-100 hover:bg-primary-100 dark:bg-slate-800 dark:hover:bg-primary-950/30 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteProduct(prod._id)}
                                className="p-2 bg-slate-100 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-red-950/30 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal (Add / Edit) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#131c2e] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingProduct ? 'Edit Catalogue Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4.5">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-500 rounded-xl text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Whole Wheat Bread"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* Barcode */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Barcode / EAN *</label>
                  <input
                    type="text"
                    required
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    placeholder="e.g. 890126..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Brand *</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    placeholder="e.g. Coca-Cola Co."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category *</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Unit Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* Alert Threshold */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Min Alert Level</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.minStockThreshold}
                    onChange={(e) => setProductForm({ ...productForm, minStockThreshold: e.target.value })}
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* Stock Quantity (Only editable on creation to prevent breaking logs) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Initial Quantity</label>
                  <input
                    type="number"
                    min="0"
                    disabled={!!editingProduct}
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500 disabled:opacity-40"
                  />
                </div>

                {/* Supplier Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Supplier *</label>
                  <select
                    value={productForm.supplierId}
                    onChange={(e) => setProductForm({ ...productForm, supplierId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option value="" disabled>Select Supplier</option>
                    {suppliers.map((sup) => (
                      <option key={sup._id} value={sup._id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition text-sm"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#131c2e] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Manage Product Categories</h3>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                  setCategoryForm({ name: '', description: '' });
                  setCategoryFormError('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Two Columns */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-6 max-h-[70vh] overflow-y-auto">
              
              {/* Left Column: Form to Add/Edit */}
              <div className="md:col-span-2 space-y-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/80 pb-6 md:pb-0 md:pr-6">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h4>
                
                {categoryFormError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-500 rounded-xl text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                    <span className="leading-snug">{categoryFormError}</span>
                  </div>
                )}

                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category Name *</label>
                    <input
                      type="text"
                      required
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="e.g. Frozen Foods"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="Describe items in this category"
                      rows="3"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 transition text-xs"
                    >
                      {editingCategory ? 'Update' : 'Create'}
                    </button>
                    {editingCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null);
                          setCategoryForm({ name: '', description: '' });
                          setCategoryFormError('');
                        }}
                        className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-750 transition text-xs"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right Column: Category List */}
              <div className="md:col-span-3 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex justify-between items-center">
                  <span>Categories List</span>
                  <span className="text-xs font-medium text-slate-400">Total: {categories.length}</span>
                </h4>
                
                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                  {categories.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No categories found.</p>
                  ) : (
                    categories.map((cat) => (
                      <div
                        key={cat._id}
                        className={`p-3.5 rounded-2xl border flex items-start justify-between gap-4 transition ${
                          editingCategory?._id === cat._id
                            ? 'bg-primary-50/50 dark:bg-primary-950/10 border-primary-200 dark:border-primary-900/50'
                            : 'bg-slate-50/30 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">{cat.name}</h5>
                          <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed">
                            {cat.description || <em className="text-slate-400 dark:text-slate-500">No description</em>}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory(cat);
                              setCategoryForm({ name: cat.name, description: cat.description || '' });
                              setCategoryFormError('');
                            }}
                            className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-primary-50 dark:hover:bg-primary-950/30 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat._id)}
                              className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-550 dark:text-slate-400 hover:text-red-650 dark:hover:text-red-400 rounded-lg transition"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
