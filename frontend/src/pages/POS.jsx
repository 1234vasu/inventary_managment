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
  X
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="no-print">
        <h2 className="text-3xl font-extrabold tracking-tight dark:text-white">POS Cashier Terminal</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Scan barcodes or search catalogue items to compile a checkout invoice.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start no-print">
        {/* Left Side: Product Selector (Search & Results) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="premium-card p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Items</h3>
            
            <form onSubmit={handleBarcodeSubmit} className="relative mb-6">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan Barcode or Search Product by Name..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition text-sm"
                autoFocus
              />
            </form>

            {/* Search Results Drawer */}
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1">
                {searchResults.map((prod) => (
                  <div
                    key={prod._id}
                    onClick={() => addToCart(prod)}
                    className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between cursor-pointer hover:border-primary-400 dark:hover:border-primary-500/50 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{prod.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block">Barcode: {prod.barcode}</span>
                      <span className="text-xs text-primary-600 dark:text-primary-400 font-bold block mt-1">
                        ${prod.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${prod.quantity <= prod.minStockThreshold ? 'text-red-500' : 'text-slate-500'}`}>
                        {prod.quantity} Left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.trim().length > 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No products found.</div>
            ) : (
              <div className="text-center py-20 text-slate-450 flex flex-col items-center justify-center space-y-3">
                <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-medium">Scan product barcode or use search input above.</p>
              </div>
            )}
          </div>

          {/* Cart Table */}
          {cart.length > 0 && (
            <div className="premium-card p-6 overflow-hidden">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Cart items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4 text-center">Price</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {cart.map((item) => (
                      <tr key={item.productId} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-normal">Barcode: {item.barcode}</span>
                        </td>
                        <td className="py-4 px-4 text-center font-bold">${item.price.toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.productId, -1)}
                              className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, 1)}
                              className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Checkout Summary
              </h3>

              {checkoutError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-500 rounded-xl text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Customer Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Customer Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-white focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
              </div>

              {/* Customer Contact */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Contact Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    placeholder="e.g. 555-0199"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-white focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Discount */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Discount ($)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Percent className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-white focus:outline-none focus:border-primary-500 text-xs"
                    />
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-white focus:outline-none focus:border-primary-500 text-xs"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              {/* Subtotal, tax, net calculations */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs font-semibold">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax ({taxRate}%)</span>
                  <span>${taxVal.toFixed(2)}</span>
                </div>
                {discountVal > 0 && (
                  <div className="flex justify-between text-rose-500">
                    <span>Discount</span>
                    <span>-${discountVal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Total Due</span>
                  <span>${total < 0 ? '0.00' : total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || processing}
              className="w-full mt-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition duration-200 focus:outline-none disabled:opacity-50 text-sm"
            >
              {processing ? 'Processing...' : 'Finalize & Checkout'}
            </button>
          </div>
        </div>
      </div>

      {/* Bill Receipt Modal (Rendered on checkout success) */}
      {isReceiptModalOpen && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4 print:relative print:bg-white print:inset-0 print:p-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden print:shadow-none print:border-none print:max-w-full">
            {/* Modal actions (Hide in print mode) */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between no-print">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary-500 flex items-center space-x-1.5">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                <span>Transaction Complete</span>
              </h3>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Paper Bill content */}
            <div className="p-6 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-4 print:p-0">
              <div className="text-center space-y-1">
                <h4 className="font-extrabold text-base uppercase">Smart Retail Store</h4>
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
                <div className="flex justify-between text-sm font-extrabold pt-1.5 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                  <span>NET AMOUNT:</span>
                  <span>${completedOrder.netAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-[10px] uppercase font-bold text-slate-500">Thank You For Shopping!</p>
                <p className="text-[9px] text-slate-400">Please retain receipt for returns.</p>
              </div>
            </div>

            {/* Print and Close controls (Hide in print mode) */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex space-x-3 no-print bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="flex-1 py-2 bg-slate-200 dark:bg-slate-800 text-slate-850 dark:text-slate-200 font-bold rounded-xl transition text-xs text-center"
              >
                Close Panel
              </button>
              <button
                onClick={triggerPrint}
                className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow transition text-xs"
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
