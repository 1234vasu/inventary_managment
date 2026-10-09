import express from 'express';
import {
  getDashboardData,
  getSalesData,
  exportSalesPDF,
  exportSalesExcel,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardData);
router.get('/sales', protect, getSalesData);
router.get('/export/pdf', protect, authorize('Admin', 'Manager'), exportSalesPDF);
router.get('/export/excel', protect, authorize('Admin', 'Manager'), exportSalesExcel);

export default router;
