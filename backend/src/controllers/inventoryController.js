import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';

// @desc    Get all inventory logs
// @route   GET /api/inventory/logs
// @access  Private
export const getInventoryLogs = async (req, res, next) => {
  try {
    const logs = await Inventory.find()
      .populate('productId', 'name barcode price')
      .populate('updatedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Restock or adjust product quantity manually
// @route   POST /api/inventory/restock
// @access  Private/Manager,Admin
export const restockProduct = async (req, res, next) => {
  try {
    const { productId, quantityChanged, type, remarks } = req.body;

    if (!productId || quantityChanged === undefined || !type) {
      return res.status(400).json({ success: false, message: 'Please provide productId, quantityChanged, and type' });
    }

    if (quantityChanged === 0) {
      return res.status(400).json({ success: false, message: 'Quantity changed cannot be zero' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Adjust product quantity
    // quantityChanged can be positive (Stock In) or negative (Adjustment / Stock Out)
    const newQuantity = product.quantity + quantityChanged;
    if (newQuantity < 0) {
      return res.status(400).json({ success: false, message: 'Resulting stock quantity cannot be negative' });
    }

    product.quantity = newQuantity;
    await product.save();

    // Create inventory log
    const log = await Inventory.create({
      productId,
      quantityChanged,
      type,
      updatedBy: req.user._id,
      remarks,
    });

    res.status(200).json({
      success: true,
      message: 'Product stock updated successfully',
      product,
      log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock products
// @route   GET /api/inventory/low-stock
// @access  Private
export const getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$quantity', '$minStockThreshold'] },
    })
      .populate('categoryId', 'name')
      .populate('supplierId', 'name')
      .sort({ quantity: 1 });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};
