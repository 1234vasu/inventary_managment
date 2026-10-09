import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getCategories);
router.post('/', protect, authorize('Admin', 'Manager'), createCategory);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateCategory);
router.delete('/:id', protect, authorize('Admin'), deleteCategory);

export default router;
