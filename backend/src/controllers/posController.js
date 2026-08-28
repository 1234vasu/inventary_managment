import Product from '../models/Product.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Inventory from '../models/Inventory.js';
import Sale from '../models/Sale.js';

// @desc    Get a single product by barcode
// @route   GET /api/pos/product/:barcode
// @access  Private
export const getProductByBarcode = async (req, res, next) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found with this barcode' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Checkout POS transaction (Create order, update stock, log inventory, log sales)
// @route   POST /api/pos/checkout
// @access  Private
export const checkout = async (req, res, next) => {
  try {
    const { items, customerName, customerContact, discount, tax, paymentMode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in cart' });
    }

    // 1. Validate stock availability for all items first (Prevention of partial stock outs)
    const itemsToProcess = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name || item.productId} not found` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product '${product.name}'. Available: ${product.quantity}, Requested: ${item.quantity}`,
        });
      }

      itemsToProcess.push({
        product,
        quantity: item.quantity,
        priceAtSale: product.price,
        subTotal: product.price * item.quantity,
      });
    }

    // Calculate totals
    const totalAmount = itemsToProcess.reduce((sum, item) => sum + item.subTotal, 0);
    const taxAmount = tax ? (totalAmount * (tax / 100)) : 0;
    const discountAmount = discount || 0;
    const netAmount = totalAmount + taxAmount - discountAmount;

    // Generate Invoice Number: INV-YYYYMMDDHHMMSS-RAND
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${rand}`;

    // 2. Create the main Order header
    const order = await Order.create({
      invoiceNumber,
      cashierId: req.user._id,
      customerName: customerName || 'Walk-in Customer',
      customerContact,
      totalAmount,
      tax: tax || 0,
      discount: discountAmount,
      netAmount: netAmount < 0 ? 0 : netAmount,
      paymentMode: paymentMode || 'Cash',
    });

    const orderItemsCreated = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day for Sales records

    // 3. Process each item: write order item, decrease stock, create stock log, update sales table
    for (const item of itemsToProcess) {
      // Create OrderItem
      const orderItem = await OrderItem.create({
        orderId: order._id,
        productId: item.product._id,
        productName: item.product.name,
        quantity: item.quantity,
        priceAtSale: item.priceAtSale,
        subTotal: item.subTotal,
      });
      orderItemsCreated.push(orderItem);

      // Deduct quantity from Product
      item.product.quantity -= item.quantity;
      await item.product.save();

      // Create Stock Log
      await Inventory.create({
        productId: item.product._id,
        quantityChanged: -item.quantity,
        type: 'Stock Out',
        updatedBy: req.user._id,
        remarks: `POS Order Checkout: ${invoiceNumber}`,
      });

      // Update Sales statistics for AI training
      // Use findOneAndUpdate with upsert to avoid race conditions and handle new products
      await Sale.findOneAndUpdate(
        { date: today, productId: item.product._id },
        {
          $inc: { quantitySold: item.quantity, revenue: item.subTotal },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Transaction completed successfully',
      order: {
        ...order._doc,
        items: orderItemsCreated,
      },
    });
  } catch (error) {
    next(error);
  }
};
