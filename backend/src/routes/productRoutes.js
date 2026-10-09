import express from 'express';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getBestBrandsByCategory,
  getBrandAnalytics
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getProducts);
router.get('/best-brands', protect, getBestBrandsByCategory);
router.get('/brand-analytics', protect, getBrandAnalytics);
router.post('/', protect, authorize('Admin', 'Manager'), createProduct);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateProduct);
router.delete('/:id', protect, authorize('Admin'), deleteProduct);

export default router;
