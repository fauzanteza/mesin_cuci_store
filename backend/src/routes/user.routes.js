// backend/src/routes/user.routes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/dashboard-stats', userController.getDashboardStats);

// Addresses
router.get('/addresses', userController.getAddresses);
router.post('/addresses', userController.createAddress);
router.put('/addresses/:id', userController.updateAddress);
router.delete('/addresses/:id', userController.deleteAddress);

// Wishlist
router.get('/wishlist', userController.getWishlist);
router.post('/wishlist', userController.addToWishlist);
router.delete('/wishlist/:id', userController.removeFromWishlist);

export default router;
