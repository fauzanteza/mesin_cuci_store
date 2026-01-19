// backend/src/routes/order.routes.js
import express from 'express';
import {
    createOrder,
    getOrderById,
    getUserOrders,
    updateOrderStatus,
    cancelOrder,
    getAdminOrders,
    getOrderStats,
    updateOrderTracking
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.use(authenticate);

router.post('/', createOrder);
router.get('/user', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// Admin routes
router.use(authorize('admin'));

router.get('/admin/all', getAdminOrders);
router.get('/admin/stats', getOrderStats);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/tracking', updateOrderTracking);

export default router;
