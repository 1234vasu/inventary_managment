import Product from '../models/Product.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Category from '../models/Category.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

// @desc    Get dashboard metrics and charts data
// @route   GET /api/reports/dashboard
// @access  Private
export const getDashboardData = async (req, res, next) => {
  try {
    // 1. Total Products
    const totalProducts = await Product.countDocuments();

    // 2. Total Orders
    const totalOrders = await Order.countDocuments();

    // 3. Today's Revenue
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayOrders = await Order.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.netAmount, 0);

    // 4. Low Stock count
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$minStockThreshold'] },
    });

    // 5. Top Selling Products (Aggregate OrderItems by quantity)
    const topSelling = await OrderItem.aggregate([
      {
        $group: {
          _id: '$productName',
          quantitySold: { $sum: '$quantity' },
          revenue: { $sum: '$subTotal' },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
    ]);

    // 6. Monthly Sales (For Recharts line/bar chart - last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$netAmount' },
          salesCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Map to user-friendly month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlySales = monthlySalesData.map((item) => ({
      name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: parseFloat(item.revenue.toFixed(2)),
      salesCount: item.salesCount,
    }));

    // 7. Sales by Category (For Recharts pie chart)
    const categorySales = await OrderItem.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.categoryId',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: '$categoryDetails' },
      {
        $group: {
          _id: '$categoryDetails.name',
          value: { $sum: '$quantity' },
          revenue: { $sum: '$subTotal' },
        },
      },
      { $sort: { value: -1 } },
    ]);

    const formattedCategorySales = categorySales.map((item) => ({
      name: item._id,
      value: item.value,
      revenue: parseFloat(item.revenue.toFixed(2)),
    }));

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalProducts,
          totalOrders,
          todayRevenue: parseFloat(todayRevenue.toFixed(2)),
          lowStockCount,
        },
        topSelling,
        monthlySales: formattedMonthlySales,
        categorySales: formattedCategorySales,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete list of sales reports (daily/weekly/monthly history)
// @route   GET /api/reports/sales
// @access  Private
export const getSalesData = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(query)
      .populate('cashierId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Export sales data as PDF report
// @route   GET /api/reports/export/pdf
// @access  Private/Manager,Admin
export const exportSalesPDF = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(query).populate('cashierId', 'name').sort({ createdAt: -1 });

    // Set Response Headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);

    // Document Title Header
    doc.fillColor('#1E293B').fontSize(20).text('Smart Retail Management System', { align: 'center' });
    doc.fontSize(14).text('Sales Report', { align: 'center' });
    doc.moveDown(0.5);

    const dateRangeText = `Report Period: ${startDate || 'Beginning'} to ${endDate || 'Today'}`;
    doc.fontSize(9).fillColor('#64748B').text(dateRangeText, { align: 'center' });
    doc.moveDown(1.5);

    // Table Columns
    const tableTop = 130;
    const itemCodeX = 30;
    const dateX = 140;
    const cashierX = 230;
    const paymentX = 330;
    const discountX = 410;
    const amountX = 490;

    doc.fillColor('#475569').fontSize(9);
    doc.text('Invoice #', itemCodeX, tableTop, { bold: true });
    doc.text('Date', dateX, tableTop, { bold: true });
    doc.text('Cashier', cashierX, tableTop, { bold: true });
    doc.text('Payment', paymentX, tableTop, { bold: true });
    doc.text('Discount ($)', discountX, tableTop, { align: 'right', bold: true });
    doc.text('Net Amount ($)', amountX, tableTop, { align: 'right', bold: true });

    doc.moveTo(30, tableTop + 15).lineTo(565, tableTop + 15).strokeColor('#CBD5E1').stroke();

    let yPosition = tableTop + 25;
    let totalRevenue = 0;
    let totalDiscount = 0;

    orders.forEach((order) => {
      // Check if we need to add a page (page breaking check)
      if (yPosition > 750) {
        doc.addPage();
        yPosition = 50; // Reset to top on new page
      }

      doc.fillColor('#334155');
      doc.text(order.invoiceNumber, itemCodeX, yPosition);
      doc.text(new Date(order.createdAt).toLocaleDateString(), dateX, yPosition);
      doc.text(order.cashierId?.name || 'Deleted Cashier', cashierX, yPosition);
      doc.text(order.paymentMode, paymentX, yPosition);
      doc.text(order.discount.toFixed(2), discountX, yPosition, { align: 'right' });
      doc.text(order.netAmount.toFixed(2), amountX, yPosition, { align: 'right' });

      totalRevenue += order.netAmount;
      totalDiscount += order.discount;
      yPosition += 20;
    });

    // Summary Line
    doc.moveTo(30, yPosition).lineTo(565, yPosition).strokeColor('#94A3B8').stroke();
    yPosition += 10;

    doc.fillColor('#1E293B').fontSize(10);
    doc.text(`Total Transactions: ${orders.length}`, itemCodeX, yPosition, { bold: true });
    doc.text(`Total Discounts: $${totalDiscount.toFixed(2)}`, discountX - 50, yPosition, { align: 'right', bold: true });
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, amountX - 50, yPosition, { align: 'right', bold: true });

    doc.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Export sales data as Excel workbook
// @route   GET /api/reports/export/excel
// @access  Private/Manager,Admin
export const exportSalesExcel = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(query).populate('cashierId', 'name').sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Title Row
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Smart Retail Management System - Sales Report';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 40;

    // Subtitle Row
    worksheet.mergeCells('A2:H2');
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = `Generated on: ${new Date().toLocaleString()} | Period: ${startDate || 'Beginning'} to ${endDate || 'Today'}`;
    subtitleCell.font = { name: 'Arial', size: 10, italic: true };
    subtitleCell.alignment = { horizontal: 'center' };
    worksheet.getRow(2).height = 20;

    // Column Headers
    const headers = [
      'Date',
      'Invoice Number',
      'Cashier',
      'Customer Name',
      'Payment Mode',
      'Total Amount ($)',
      'Discount ($)',
      'Net Amount ($)',
    ];
    worksheet.addRow(headers);
    
    // Style Header Row
    const headerRow = worksheet.getRow(3);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Populate Data
    let totalDiscount = 0;
    let totalNet = 0;

    orders.forEach((order) => {
      const row = worksheet.addRow([
        new Date(order.createdAt).toLocaleDateString(),
        order.invoiceNumber,
        order.cashierId?.name || 'Deleted Cashier',
        order.customerName,
        order.paymentMode,
        order.totalAmount,
        order.discount,
        order.netAmount,
      ]);
      row.height = 20;

      // Align cells
      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(2).alignment = { horizontal: 'center' };
      row.getCell(3).alignment = { horizontal: 'left' };
      row.getCell(4).alignment = { horizontal: 'left' };
      row.getCell(5).alignment = { horizontal: 'center' };
      row.getCell(6).alignment = { horizontal: 'right' };
      row.getCell(7).alignment = { horizontal: 'right' };
      row.getCell(8).alignment = { horizontal: 'right' };

      // Number formatting
      row.getCell(6).numFmt = '$#,##0.00';
      row.getCell(7).numFmt = '$#,##0.00';
      row.getCell(8).numFmt = '$#,##0.00';

      totalDiscount += order.discount;
      totalNet += order.netAmount;
    });

    // Add Summary Row
    worksheet.addRow([]);
    const summaryRow = worksheet.addRow([
      'Total Summary',
      '',
      '',
      '',
      '',
      '',
      totalDiscount,
      totalNet,
    ]);
    worksheet.mergeCells(`A${summaryRow.number}:E${summaryRow.number}`);
    
    summaryRow.height = 25;
    summaryRow.getCell(1).font = { name: 'Arial', size: 11, bold: true };
    summaryRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    summaryRow.getCell(7).font = { name: 'Arial', size: 11, bold: true };
    summaryRow.getCell(7).numFmt = '$#,##0.00';
    summaryRow.getCell(8).font = { name: 'Arial', size: 11, bold: true };
    summaryRow.getCell(8).numFmt = '$#,##0.00';

    summaryRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      cell.border = {
        top: { style: 'double' },
        bottom: { style: 'thin' },
      };
    });

    // Auto-fit Columns
    worksheet.columns.forEach((column, i) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        if (cell.value && i > 0) { // Skip checking title merging cell
          const length = cell.value.toString().length;
          if (length > maxLength) maxLength = length;
        }
      });
      column.width = Math.max(maxLength + 4, 15);
    });

    // Set Response Headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
