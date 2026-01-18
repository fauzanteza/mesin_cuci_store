import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', restrictTo('admin'), paymentController.getPayments);
router.get('/:id', paymentController.getPayment);
router.patch('/:id/status', restrictTo('admin'), paymentController.updatePaymentStatus);

export default router;
