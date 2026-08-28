import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get AI sales forecasting and restock recommendations
// @route   GET /api/ai/predict
// @access  Private
export const predictSales = async (req, res, next) => {
  try {
    // 1. Calculate the start date for historical sales (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    // 2. Fetch all products
    const products = await Product.find()
      .populate('categoryId', 'name')
      .populate('supplierId', 'name')
      .lean();

    // 3. Aggregate sales by product and month
    const salesHistory = await Sale.aggregate([
      {
        $match: {
          date: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            productId: '$productId',
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalQtySold: { $sum: '$quantitySold' },
        },
      },
    ]);

    // 4. Map sales aggregates into a structured history map for fast lookup
    // Key: productId, Value: array of { monthIndex, quantitySold }
    const salesMap = {};
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-indexed

    salesHistory.forEach((item) => {
      const prodId = item._id.productId.toString();
      
      // Calculate monthIndex relative to 12 months ago
      // e.g. if twelveMonthsAgo is Aug 2025, and record is Oct 2025:
      // index = (2025 - 2025) * 12 + (10 - 8) = 2
      const yearDiff = item._id.year - twelveMonthsAgo.getFullYear();
      const monthDiff = item._id.month - (twelveMonthsAgo.getMonth() + 1); // getMonth is 0-indexed, $month is 1-indexed
      const monthIndex = yearDiff * 12 + monthDiff;

      if (!salesMap[prodId]) {
        salesMap[prodId] = [];
      }
      salesMap[prodId].push({
        monthIndex,
        quantitySold: item.totalQtySold,
      });
    });

    // 5. Structure payload for the Python script
    const pyPayload = products.map((product) => {
      const prodId = product._id.toString();
      const history = salesMap[prodId] || [];

      // Sort history by month index ascending
      history.sort((a, b) => a.monthIndex - b.monthIndex);

      return {
        productId: prodId,
        productName: product.name,
        currentStock: product.quantity,
        minStockThreshold: product.minStockThreshold,
        category: product.categoryId?.name || 'Uncategorized',
        supplier: product.supplierId?.name || 'Unknown',
        price: product.price,
        brand: product.brand || 'Generic',
        salesHistory: history,
      };
    });

    // 6. Spawn Python Process
    const pythonPath = process.env.PYTHON_PATH || 'python';
    // Path to sales_predictor.py (located in ../../ai-module/sales_predictor.py relative to controllers)
    const scriptPath = path.resolve(__dirname, '../../../ai-module/sales_predictor.py');

    console.log(`Spawning Python process: ${pythonPath} ${scriptPath}`);

    const pyProcess = spawn(pythonPath, [scriptPath]);

    let stdoutData = '';
    let stderrData = '';

    // Write input data to Python stdin as JSON string
    pyProcess.stdin.write(JSON.stringify(pyPayload));
    pyProcess.stdin.end();

    // Collect stdout
    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    // Collect stderr
    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    // Process finished
    pyProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}. Error: ${stderrData}`);
        return res.status(500).json({
          success: false,
          message: 'AI Module execution failed',
          error: stderrData.trim(),
        });
      }

      try {
        const predictions = JSON.parse(stdoutData);
        res.status(200).json({
          success: true,
          count: predictions.length,
          predictions,
        });
      } catch (err) {
        console.error(`Failed to parse Python output: ${stdoutData}`);
        res.status(500).json({
          success: false,
          message: 'Failed to parse AI predictions response',
          error: err.message,
        });
      }
    });
  } catch (error) {
    next(error);
  }
};
