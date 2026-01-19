// backend/src/controllers/orderController.js
import orderService from '../services/order.service.js';
import { AppError } from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
    const {
        items,
        shippingAddressId,
        billingAddressId,
        shippingMethod,
        paymentMethod,
        notes
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new AppError('Items are required', 400);
    }

    if (!shippingAddressId) {
        throw new AppError('Shipping address is required', 400);
    }

    if (!shippingMethod) {
        throw new AppError('Shipping method is required', 400);
    }

    if (!paymentMethod) {
        throw new AppError('Payment method is required', 400);
    }

    const order = await orderService.createOrder({
        userId,
        items,
        shippingAddressId,
        billingAddressId,
        shippingMethod,
        paymentMethod,
        notes
    });

    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
    });
});

export const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const order = await orderService.getOrderById(id, isAdmin ? 'admin' : userId);

    res.json({
        success: true,
        data: order
    });
});

export const getUserOrders = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const orders = await orderService.getUserOrders(
        userId,
        parseInt(page),
        parseInt(limit),
        status
    );

    res.json({
        success: true,
        ...orders
    });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
        throw new AppError('Status is required', 400);
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        throw new AppError('Invalid status', 400);
    }

    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
        throw new AppError('Unauthorized', 403);
    }

    const order = await orderService.updateOrderStatus(id, status, userId, notes);

    res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order
    });
});

export const cancelOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason) {
        throw new AppError('Cancellation reason is required', 400);
    }

    const order = await orderService.cancelOrder(id, userId, reason);

    res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
    });
});

export const getAdminOrders = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        status,
        startDate,
        endDate,
        search
    } = req.query;

    const orders = await orderService.getAdminOrders({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        startDate,
        endDate,
        search
    });

    res.json({
        success: true,
        ...orders
    });
});

export const getOrderStats = asyncHandler(async (req, res) => {
    const stats = await orderService.getOrderStats();

    res.json({
        success: true,
        data: stats
    });
});

export const updateOrderTracking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { trackingNumber, carrier, trackingUrl } = req.body;
    const userId = req.user.id;

    if (!trackingNumber || !carrier) {
        throw new AppError('Tracking number and carrier are required', 400);
    }

    const order = await orderService.updateOrderTracking(
        id,
        { trackingNumber, carrier, trackingUrl },
        userId
    );

    res.json({
        success: true,
        message: 'Tracking information updated',
        data: order
    });
});
