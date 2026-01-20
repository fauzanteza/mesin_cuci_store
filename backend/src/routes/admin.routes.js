import express from 'express';
import adminController from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Ensure path is correct
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// Protect all admin routes
router.use(authMiddleware.protect);
// router.use(requireAdmin); // Temporarily commented out for testing if role middleware not ready

// Dashboard routes
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/recent-orders', adminController.getRecentOrders);
router.get('/dashboard/sales-report', adminController.getSalesReport);
router.get('/dashboard/inventory-alerts', adminController.getInventoryAlerts);
router.get('/dashboard/top-products', adminController.getTopProducts);
router.get('/dashboard/customer-stats', adminController.getCustomerStats);

export default router;
