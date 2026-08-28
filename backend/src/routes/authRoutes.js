import express from 'express';
import { login, register, changePassword, getMe } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', protect, authorize('Admin'), register);
router.post('/change-password', protect, changePassword);
router.get('/me', protect, getMe);

export default router;
