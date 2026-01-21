import PaymentService from '../services/payment.service.js';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createPayment = catchAsync(async (req, res, next) => {
    const { orderId, paymentMethod, customerDetails } = req.body;

    // Validate order ownership
    const order = await Order.findOne({
        where: { orderNumber: orderId, user_id: req.user.id }
    });

    if (!order) {
        return next(new AppError('Order not found or not authorized', 404));
    }

    // Call service to create transaction
    const transaction = await PaymentService.createTransaction(order, req.user);

    res.status(200).json({
        status: 'success',
        token: transaction.token,
        redirect_url: transaction.redirect_url
    });
});

export const uploadManualPayment = catchAsync(async (req, res, next) => {
    // req.file should be populated by upload middleware
    if (!req.file) {
        return next(new AppError('Please upload a payment proof', 400));
    }

    const { orderId, bank } = req.body;

    // Find order (using ID or OrderNumber? Frontend sends OrderId as ID usually, but `createPayment` used orderNumber. Let's support both or check frontend)
    // Frontend `ManualPaymentUpload` sends `orderId` which is `orderData.id` (e.g. ORD-TIMESTAMP).
    // Let's assume ID is passed.
    const order = await Order.findOne({
        where: { id: orderId, user_id: req.user.id }
    });

    if (!order) {
        // Try finding by orderNumber if ID failed
        const orderByNumber = await Order.findOne({
            where: { orderNumber: orderId, user_id: req.user.id }
        });
        if (!orderByNumber) return next(new AppError('Order not found', 404));
    }

    // Create Payment record for manual transfer
    const payment = await Payment.create({
        order_id: orderId, // ensure foreign key matches
        user_id: req.user.id,
        payment_method: 'bank_transfer',
        payment_type: 'manual', // customized field
        amount: order ? order.totalAmount : 0, // Fallback need order
        status: 'pending', // Waiting verification
        proof_image: req.file.path, // Match model field name
        bank_destination: bank,
        response: JSON.stringify({ bank, originalName: req.file.originalname })
    });

    // Update order status potentially?
    // Maybe keep 'pending' until admin verifies.

    res.status(201).json({
        status: 'success',
        data: payment
    });
});

export const handleMidtransWebhook = catchAsync(async (req, res, next) => {
    const notification = req.body;

    const result = await PaymentService.handleNotification(notification);

    res.status(200).json(result);
});

export const getPayments = catchAsync(async (req, res, next) => {
    // Admin list all, user list theirs
    const where = {};
    if (req.user.role !== 'admin') {
        where.user_id = req.user.id;
    }

    const payments = await Payment.findAll({ where, include: ['order'] });

    res.status(200).json({
        status: 'success',
        results: payments.length,
        data: payments
    });
});

export const getPayment = catchAsync(async (req, res, next) => {
    const payment = await Payment.findByPk(req.params.id, { include: ['order'] });

    if (!payment) return next(new AppError('Payment not found', 404));

    // Access check
    if (req.user.role !== 'admin' && payment.user_id !== req.user.id) {
        return next(new AppError('Not authorized', 403));
    }

    res.status(200).json({
        status: 'success',
        data: payment
    });
});

export const verifyPayment = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'approve' | 'reject'

    const payment = await Payment.findByPk(id);
    if (!payment) return next(new AppError('Payment not found', 404));

    if (action === 'approve') {
        payment.status = 'completed';
        const order = await Order.findByPk(payment.order_id);
        if (order) {
            order.status = 'paid';
            order.payment_status = 'paid';
            await order.save();
        }
    } else if (action === 'reject') {
        payment.status = 'failed';
        payment.rejection_reason = notes;
    } else {
        return next(new AppError('Invalid action', 400));
    }

    await payment.save();

    res.status(200).json({
        status: 'success',
        data: payment
    });
});
