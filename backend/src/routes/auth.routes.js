import express from 'express';
import {
    register,
    login,
    logout,
    getMe,
    updateMe,
    changePassword,
    forgotPassword,
    resetPassword,
    refreshToken,
    verifyEmail,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// User must be logged in for these routes
router.use(protect);

router.get('/me', getMe);
router.patch('/update-me', updateMe);
router.patch('/change-password', changePassword);

export default router;
