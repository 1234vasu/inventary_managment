import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  DollarSign,
  User,
  Phone,
  Percent,
  CheckCircle,
  AlertTriangle,
  Printer,
  X,
  CreditCard,
  Banknote,
  QrCode,
  Sparkles,
  Barcode,
  PackageCheck
} from 'lucide-react';

const POS = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  
  // Checkout details
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [discount, setDiscount] = useState('');
  const [taxRate, setTaxRate] = useState(8); // 8% Default
  const [paymentMode, setPaymentMode] = useState('Cash');

  // Checkout response & modal
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [processing, setProcessing] = useState(false);

  const searchInputRef = useRef(null);

  // Search products when input changes
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        return;
      }
      try {
        const { data } = await api.get(`/products?search=${searchQuery}`);
        if (data.success) {
          setSearchResults(data.products);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // Handle barcode scanning directly: check exact matches first
  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      // First, try direct barcode fetch
      const { data } = await api.get(`/pos/product/${searchQuery}`);
      if (data.success && data.product) {
        addToCart(data.product);
        setSearchQuery('');
        setSearchResults([]);
        return;
      }
    } catch (err) {
      // If not found by exact barcode, look at search results
      if (searchResults.length > 0) {
        addToCart(searchResults[0]);
        setSearchQuery('');
        setSearchResults([]);
      }
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          alert(`Cannot add more. Available stock for ${product.name} is only ${product.quantity}.`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        if (product.quantity <= 0) {
          alert(`Product ${product.name} is out of stock.`);
          return prev;
        }
        return [
          ...prev,
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            availableStock: product.quantity,
            quantity: 1,
            barcode: product.barcode
          }
        ];
      }
    });
  };

  const updateQuantity = (productId, change) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.productId === productId) {
          const newQty = item.quantity + change;
          if (newQty <= 0) return null;
          if (newQty > item.availableStock) {
            alert(`Stock limit reached. Only ${item.availableStock} units available.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountVal = parseFloat(discount) || 0;
  const taxVal = subtotal * (taxRate / 100);
  const total = subtotal + taxVal - discountVal;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutError('');
    setProcessing(true);

    const items = cart.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity
    }));

    try {
      const { data } = await api.post('/pos/checkout', {
        items,
        customerName: customerName.trim() || undefined,
        customerContact: customerContact.trim() || undefined,
        discount: discountVal,
        tax: taxRate,
        paymentMode
      });

      if (data.success) {
        setCompletedOrder(data.order);
        setCheckoutSuccess(true);
        setIsReceiptModalOpen(true);
        // Reset Cart and Details
        setCart([]);
        setCustomerName('');
        setCustomerContact('');
        setDiscount('');
      }
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Checkout operation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="no-print p-6 rounded-3xl bg-white/70 dark:bg-[#111827]/70 midnight:bg-[#070b14]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-extrabold text-primary-500 uppercase tracking-wider mb-0.5">
            <Barcode className="w-4 h-4" />
            <span>High-Speed Checkout Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Smart Cashier POS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Scan hardware barcodes or lookup catalog products for instant bill generation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-500 text-xs font-bold flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cart Items: {cart.reduce((sum, i) => sum + i.quantity, 0)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start no-print">
        {/* Left Side: Product Selector (Search & Results) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Product Catalog & Scanner</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Press Enter after scan</span>
            </div>
            
            <form onSubmit={handleBarcodeSubmit} className="relative mb-6">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan barcode or type product name / SKU..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition text-sm font-medium"
                autoFocus
              />
            </form>

            {/* Search Results Drawer */}
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[48vh] overflow-y-auto pr-1 custom-scrollbar">
                {searchResults.map((prod) => (
                  <div
                    key={prod._id}
                    onClick={() => addToCart(prod)}
                    className="p-4 bg-slate-50/70 hover:bg-slate-100/90 dark:bg-slate-900/50 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center justify-between cursor-pointer hover:border-primary-500/50 hover:shadow-md transition-all group"
                  >
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">
                        {prod.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono block">Barcode: {prod.barcode}</span>
                      <span className="text-sm text-primary-500 font-black block pt-0.5">
                        ${prod.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          prod.quantity <= (prod.minStockThreshold || 5)
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}
                      >
                        {prod.quantity} Left
                      </span>
                      <button className="mt-2 p-1.5 rounded-xl bg-primary-500/10 text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-sm">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.trim().length > 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No matching product found with that name or barcode.
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center space-y-3">
                <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-900/60 text-slate-300 dark:text-slate-700">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Ready for scanning. Scan barcode or type product name above.
                </p>
              </div>
            )}
          </div>

          {/* Cart Table */}
          {cart.length > 0 && (
            <div className="premium-card p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Active Cart ({cart.length} unique items)
                </h3>
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-red-500 hover:text-red-600 font-bold transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800/80 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      <th className="py-3 px-4">Item & Barcode</th>
                      <th className="py-3 px-4 text-center">Unit Price</th>
                      <th className="py-3 px-4 text-center">Quantity</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                      <th className="py-3 px-4 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {cart.map((item) => (
                      <tr key={item.productId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Barcode: {item.barcode}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => updateQuantity(item.productId, -1)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-white rounded-xl transition"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, 1)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-white rounded-xl transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-primary-500">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Checkout Form Panel */}
        <div className="space-y-6">
          <div className="premium-card p-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Payment & Invoice
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-md">
                  Terminal 01
                </span>
              </div>

              {checkoutError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{checkoutError}</span>
                </div>
              )}

              {/* Customer Name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Customer Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Customer Contact */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Contact Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    placeholder="e.g. +1 555-0199"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Discount & Payment Mode */}
              <div className="grid grid-cols-2 gap-3">
                {/* Discount */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Discount ($)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Percent className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Payment Method
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 text-xs font-bold"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI / Digital</option>
                  </select>
                </div>
              </div>

              {/* Subtotal, tax, net calculations */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs font-bold">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Gross Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Sales Tax ({taxRate}%)</span>
                  <span>${taxVal.toFixed(2)}</span>
                </div>
                {discountVal > 0 && (
                  <div className="flex justify-between text-rose-500">
                    <span>Discount Applied</span>
                    <span>-${discountVal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                  <span>Total Due</span>
                  <span className="text-primary-500">${total < 0 ? '0.00' : total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || processing}
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.01] active:scale-95 transition duration-200 focus:outline-none disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
            >
              {processing ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <PackageCheck className="w-4.5 h-4.5" />
                  <span>Finalize & Print Bill</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bill Receipt Modal (Rendered on checkout success) */}
      {isReceiptModalOpen && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 print:relative print:bg-white print:inset-0 print:p-0 animate-fade-in">
          <div className="bg-white dark:bg-[#111827] midnight:bg-[#070b14] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden print:shadow-none print:border-none print:max-w-full animate-scale-in">
            {/* Modal actions (Hide in print mode) */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between no-print bg-slate-50/50 dark:bg-slate-900/40">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary-500 flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Transaction Complete</span>
              </h3>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Paper Bill content */}
            <div className="p-6 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-4 print:p-0">
              <div className="text-center space-y-0.5">
                <h4 className="font-black text-base uppercase tracking-tight">Smart Retail Store</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">123 Supermarket Ave, Tech Hub</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">TEL: +1-800-RET-DEV</p>
              </div>

              <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-3 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>INVOICE:</span>
                  <span className="font-bold">{completedOrder.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{new Date(completedOrder.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span className="font-bold">{completedOrder.customerName}</span>
                </div>
                {completedOrder.customerContact && (
                  <div className="flex justify-between">
                    <span>CONTACT:</span>
                    <span>{completedOrder.customerContact}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>PAYMENT:</span>
                  <span className="font-bold">{completedOrder.paymentMode}</span>
                </div>
              </div>

              {/* Items list */}
              <div className="border-t border-dashed border-slate-300 dark:border-slate-700 py-3 space-y-2">
                <div className="flex font-bold text-[10px] text-slate-400 uppercase">
                  <span className="w-1/2">Item Description</span>
                  <span className="w-1/6 text-center">Qty</span>
                  <span className="w-1/6 text-right">Price</span>
                  <span className="w-1/6 text-right">Total</span>
                </div>

                {completedOrder.items && completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex">
                    <span className="w-1/2 truncate font-bold">{item.productName}</span>
                    <span className="w-1/6 text-center">{item.quantity}</span>
                    <span className="w-1/6 text-right">${item.priceAtSale.toFixed(2)}</span>
                    <span className="w-1/6 text-right">${item.subTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-3 space-y-1.5 text-right text-[10px]">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>${completedOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>TAX ({completedOrder.tax}%):</span>
                  <span>${(completedOrder.totalAmount * (completedOrder.tax / 100)).toFixed(2)}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-500 font-bold">
                    <span>DISCOUNT:</span>
                    <span>-${completedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black pt-1.5 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                  <span>NET PAID:</span>
                  <span>${completedOrder.netAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-[10px] uppercase font-bold text-slate-500">Thank You For Shopping!</p>
                <p className="text-[9px] text-slate-400">Please retain receipt for warranty & returns.</p>
              </div>
            </div>

            {/* Print and Close controls (Hide in print mode) */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex space-x-3 no-print bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition text-xs text-center"
              >
                Close
              </button>
              <button
                onClick={triggerPrint}
                className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-lg shadow-primary-500/25 transition text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Bill</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
