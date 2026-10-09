import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Supplier from '../models/Supplier.js';
import Inventory from '../models/Inventory.js';
import Sale from '../models/Sale.js';
import mongoose from 'mongoose';

// @desc    Get all products (with search and filters)
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res, next) => {
  try {
    const { search, category, lowStock } = req.query;
    let query = {};

    // Search by Name or Barcode
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by Category
    if (category) {
      query.categoryId = category;
    }

    // Filter by Low Stock
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$minStockThreshold'] };
    }

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('supplierId', 'name')
      .sort({ name: 1 });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Manager,Admin
export const createProduct = async (req, res, next) => {
  try {
    const { name, barcode, categoryId, price, quantity, minStockThreshold, supplierId, brand } = req.body;

    // Check if barcode is unique
    const barcodeExists = await Product.findOne({ barcode });
    if (barcodeExists) {
      return res.status(400).json({ success: false, message: 'Barcode is already assigned to another product' });
    }

    // Verify category and supplier exist
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const product = await Product.create({
      name,
      barcode,
      categoryId,
      price,
      quantity: quantity || 0,
      minStockThreshold: minStockThreshold || 10,
      supplierId,
      brand: brand || 'Generic',
    });

    // If initial quantity is greater than 0, create an inventory log
    if (product.quantity > 0) {
      await Inventory.create({
        productId: product._id,
        quantityChanged: product.quantity,
        type: 'Stock In',
        updatedBy: req.user._id,
        remarks: 'Initial inventory load',
      });
    }

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Manager,Admin
export const updateProduct = async (req, res, next) => {
  try {
    const { name, barcode, categoryId, price, minStockThreshold, supplierId } = req.body;

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if updated barcode conflicts with another product
    if (barcode && barcode !== product.barcode) {
      const barcodeExists = await Product.findOne({ barcode });
      if (barcodeExists) {
        return res.status(400).json({ success: false, message: 'Barcode is already assigned to another product' });
      }
    }

    // Verify category and supplier exist if changing
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
    }
    if (supplierId) {
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Supplier not found' });
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get best performing brand for each category
// @route   GET /api/products/best-brands
// @access  Private
export const getBestBrandsByCategory = async (req, res, next) => {
  try {
    const bestBrands = await Sale.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: {
            categoryId: '$product.categoryId',
            brand: '$product.brand',
          },
          salesVolume: { $sum: '$quantitySold' },
        },
      },
      { $sort: { salesVolume: -1 } },
      {
        $group: {
          _id: '$_id.categoryId',
          bestBrand: { $first: '$_id.brand' },
          salesVolume: { $first: '$salesVolume' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          categoryName: '$category.name',
          bestBrand: 1,
          salesVolume: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, count: bestBrands.length, bestBrands });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dynamic brand analytics data
// @route   GET /api/products/brand-analytics
// @access  Private
export const getBrandAnalytics = async (req, res, next) => {
  try {
    const { timeRange, category } = req.query;

    // Build date filter
    let matchStage = {};
    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      if (timeRange === '7days') {
        startDate.setDate(now.getDate() - 7);
        matchStage.date = { $gte: startDate };
      } else if (timeRange === '30days') {
        startDate.setDate(now.getDate() - 30);
        matchStage.date = { $gte: startDate };
      } else if (timeRange === '6months') {
        startDate.setMonth(now.getMonth() - 6);
        matchStage.date = { $gte: startDate };
      } else if (timeRange === 'ytd') {
        startDate = new Date(now.getFullYear(), 0, 1);
        matchStage.date = { $gte: startDate };
      }
    }

    // Build aggregation pipeline
    const pipeline = [];
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' }
    );

    // Apply category filter if specified
    if (category && category !== 'all') {
      let categoryId = category;
      if (!mongoose.Types.ObjectId.isValid(category)) {
        const catDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
        categoryId = catDoc ? catDoc._id : null;
      }
      if (categoryId) {
        pipeline.push({
          $match: { 'product.categoryId': new mongoose.Types.ObjectId(categoryId) }
        });
      }
    }

    pipeline.push({
      $group: {
        _id: '$product.brand',
        salesVolume: { $sum: '$quantitySold' },
        revenue: { $sum: '$revenue' },
        productsCount: { $addToSet: '$productId' },
      },
    });

    const brandSalesAgg = await Sale.aggregate(pipeline);

    // Fetch total products and average price per brand
    const productsByBrand = await Product.aggregate([
      {
        $group: {
          _id: '$brand',
          totalProducts: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          categories: { $addToSet: '$categoryId' },
        }
      }
    ]);

    const productBrandMap = {};
    productsByBrand.forEach((b) => {
      productBrandMap[b._id] = {
        totalProducts: b.totalProducts,
        avgPrice: b.avgPrice,
        categoriesCount: b.categories.length,
      };
    });

    // Compute total sales volume and revenue for shares
    let totalSalesVolume = 0;
    let totalRevenue = 0;
    brandSalesAgg.forEach((b) => {
      totalSalesVolume += b.salesVolume;
      totalRevenue += b.revenue;
    });

    // Construct metrics list
    const brandsList = brandSalesAgg.map((item) => {
      const brandName = item._id || 'Unknown';
      const meta = productBrandMap[brandName] || { totalProducts: 0, avgPrice: 0, categoriesCount: 0 };
      const shareIndex = totalSalesVolume > 0 ? ((item.salesVolume / totalSalesVolume) * 100) : 0;
      
      return {
        brand: brandName,
        salesVolume: item.salesVolume,
        revenue: item.revenue,
        itemsListed: meta.totalProducts,
        shareIndex: parseFloat(shareIndex.toFixed(1)),
        avgPrice: parseFloat((meta.avgPrice || 0).toFixed(2)),
        status: shareIndex > 20 ? 'Dominant' : (shareIndex > 10 ? 'Stable' : 'Niche')
      };
    });

    // Sort brands list by sales volume descending
    brandsList.sort((a, b) => b.salesVolume - a.salesVolume);
    
    // Add Rank index
    brandsList.forEach((brandItem, index) => {
      brandItem.rank = `#${index + 1}`;
    });

    // Top performing brand
    const topPerformingBrand = brandsList[0]?.brand || 'N/A';
    const topBrandShare = brandsList[0]?.shareIndex || 0;

    // Active brands count
    const activeBrandsCount = Object.keys(productBrandMap).length;

    res.status(200).json({
      success: true,
      summary: {
        topPerformingBrand,
        topBrandShare,
        activeBrands: activeBrandsCount,
        totalVolumeSold: totalSalesVolume,
        totalRevenue: totalRevenue,
      },
      brandsList,
    });
  } catch (error) {
    next(error);
  }
};
