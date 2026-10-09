import express from 'express';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../controllers/supplierController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getSuppliers);
router.post('/', protect, authorize('Admin', 'Manager'), createSupplier);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateSupplier);
router.delete('/:id', protect, authorize('Admin'), deleteSupplier);

export default router;
