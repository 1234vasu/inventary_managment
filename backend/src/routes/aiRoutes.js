import express from 'express';
import { predictSales } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/predict', protect, predictSales);

export default router;
