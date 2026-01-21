import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js'; // Assuming basic multer setup

const router = express.Router();

// Webhook must be public and come BEFORE protect middleware
router.post('/webhook/midtrans', paymentController.handleMidtransWebhook);

// Protect all other routes
router.use(protect);

router.post('/create', paymentController.createPayment);
router.post('/manual', upload.single('paymentProof'), paymentController.uploadManualPayment);

router.get('/', paymentController.getPayments);
router.get('/:id', paymentController.getPayment);

router.post('/:id/verify', restrictTo('admin'), paymentController.verifyPayment);

export default router;
