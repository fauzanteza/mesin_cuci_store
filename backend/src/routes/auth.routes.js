import express from 'express';
import {
    register,
    login,
    logout,
    getMe,
    updateMe,
    changePassword,
    refreshToken,
    forgotPassword,
    resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/profile', protect, getMe);     // Mapped getProfile -> getMe
router.put('/profile', protect, updateMe);  // Mapped updateProfile -> updateMe
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router;
