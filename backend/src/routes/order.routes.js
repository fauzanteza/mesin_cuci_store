import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/stats', orderController.getOrderStatistics);
router.get('/:id', orderController.getOrder);
router.post('/:id/cancel', orderController.cancelOrder);
router.get('/track/:order_number', orderController.trackOrder);
router.post('/:id/return', orderController.requestReturn);

export default router;
