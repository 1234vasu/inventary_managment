import express from 'express';
import { getInventoryLogs, restockProduct, getLowStockProducts } from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/logs', protect, getInventoryLogs);
router.post('/restock', protect, authorize('Admin', 'Manager'), restockProduct);
router.get('/low-stock', protect, getLowStockProducts);

export default router;
