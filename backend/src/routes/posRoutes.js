import express from 'express';
import { getProductByBarcode, checkout } from '../controllers/posController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/product/:barcode', protect, getProductByBarcode);
router.post('/checkout', protect, checkout);

export default router;
