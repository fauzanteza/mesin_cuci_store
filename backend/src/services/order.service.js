import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import models from '../models/index.js';
import InventoryService from './inventory.service.js';
import NotificationService from './notification.service.js';
import PaymentService from './payment.service.js';
import AppError from '../utils/appError.js';

const { Order, OrderItem, User, Product, Address, Payment, OrderStatusHistory } = models;

class OrderService {
    /**
     * Create new order
     */
    static async createOrder(userId, orderData) {
        const transaction = await sequelize.transaction();

        try {
            const {
                items,
                shippingAddressId,
                billingAddressId,
                shippingMethod,
                paymentMethod,
                notes
            } = orderData;

            // Validate items
            if (!items || items.length === 0) {
                throw new AppError('Keranjang belanja kosong', 400);
            }

            // Get user
            const user = await User.findByPk(userId, { transaction });
            if (!user) {
                throw new AppError('User tidak ditemukan', 404);
            }

            // Get shipping address
            const shippingAddress = await Address.findOne({
                where: { id: shippingAddressId, userId },
                transaction
            });

            if (!shippingAddress) {
                throw new AppError('Alamat pengiriman tidak ditemukan', 404);
            }

            // Get billing address (use shipping address if not provided)
            let billingAddress = shippingAddress;
            if (billingAddressId && billingAddressId !== shippingAddressId) {
                billingAddress = await Address.findOne({
                    where: { id: billingAddressId, userId },
                    transaction
                });

                if (!billingAddress) {
                    throw new AppError('Alamat penagihan tidak ditemukan', 404);
                }
            }

            // Calculate order details
            let subtotal = 0;
            let totalWeight = 0;
            const orderItems = [];

            // Process each item
            for (const item of items) {
                const product = await Product.findByPk(item.productId, { transaction });

                if (!product) {
                    throw new AppError(`Produk ${item.productId} tidak ditemukan`, 404);
                }

                if (!product.isActive) {
                    throw new AppError(`Produk ${product.name} tidak tersedia`, 400);
                }

                if (product.stock < item.quantity) {
                    throw new AppError(
                        `Stok ${product.name} tidak mencukupi. Tersedia: ${product.stock}`,
                        400
                    );
                }

                // Calculate item total
                const price = product.discountPrice || product.price;
                const itemTotal = price * item.quantity;

                orderItems.push({
                    productId: product.id,
                    productName: product.name,
                    productSku: product.sku,
                    productImage: product.image,
                    price,
                    quantity: item.quantity,
                    total: itemTotal,
                    weight: product.weight || 0,
                    variantId: item.variantId
                });

                subtotal += itemTotal;
                totalWeight += (product.weight || 0) * item.quantity;

                // Reserve stock
                await InventoryService.updateStock(
                    product.id,
                    -item.quantity,
                    'RESERVED',
                    `Reserved for order`,
                    userId,
                    transaction
                );
            }

            // Calculate shipping cost
            const shippingCost = await this.calculateShippingCost(
                shippingAddress,
                totalWeight,
                shippingMethod
            );

            // Calculate tax (11% PPN Indonesia)
            const taxRate = 0.11;
            const taxAmount = subtotal * taxRate;

            // Calculate total
            const totalAmount = subtotal + shippingCost + taxAmount;

            // Generate order number
            const orderNumber = this.generateOrderNumber();

            // Create order
            const order = await Order.create(
                {
                    orderNumber,
                    userId,
                    subtotal,
                    shippingCost,
                    taxAmount,
                    totalAmount,
                    shippingAddressId: shippingAddress.id,
                    billingAddressId: billingAddress.id,
                    shippingMethod,
                    paymentMethod,
                    notes,
                    status: 'pending',
                    paymentStatus: 'pending',
                    items: orderItems,
                    shippingAddress: shippingAddress.toJSON(),
                    billingAddress: billingAddress.toJSON()
                },
                { transaction }
            );

            // Create order items
            for (const item of orderItems) {
                await OrderItem.create(
                    {
                        orderId: order.id,
                        productId: item.productId,
                        productName: item.productName,
                        productSku: item.productSku,
                        productImage: item.productImage,
                        price: item.price,
                        quantity: item.quantity,
                        total: item.total,
                        variantId: item.variantId
                    },
                    { transaction }
                );
            }

            // Create initial status history
            await OrderStatusHistory.create(
                {
                    orderId: order.id,
                    status: 'pending',
                    notes: 'Order created'
                },
                { transaction }
            );

            // Commit transaction
            await transaction.commit();

            // Send order confirmation email
            await NotificationService.sendEmail(
                user.email,
                'orderConfirmation',
                {
                    orderNumber: order.orderNumber,
                    orderDate: order.createdAt,
                    items: orderItems,
                    subtotal,
                    shippingCost,
                    taxAmount,
                    totalAmount,
                    shippingAddress: shippingAddress.toJSON(),
                    billingAddress: billingAddress.toJSON()
                }
            );

            // Notify admin
            await NotificationService.notifyAdminNewOrder({
                ...order.toJSON(),
                userName: user.name,
                userEmail: user.email
            });

            return order;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Get order by ID
     */
    static async getOrderById(orderId, userId = null) {
        try {
            const where = { id: orderId };
            if (userId) {
                where.userId = userId;
            }

            const order = await Order.findOne({
                where,
                include: [
                    {
                        model: OrderItem,
                        as: 'items',
                        include: [{
                            model: Product,
                            attributes: ['id', 'name', 'image', 'slug']
                        }]
                    },
                    {
                        model: Address,
                        as: 'shippingAddress'
                    },
                    {
                        model: Address,
                        as: 'billingAddress'
                    },
                    {
                        model: Payment,
                        as: 'payment'
                    },
                    {
                        model: OrderStatusHistory,
                        as: 'statusHistory',
                        order: [['createdAt', 'DESC']]
                    }
                ]
            });

            if (!order) {
                throw new AppError('Pesanan tidak ditemukan', 404);
            }

            return order;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get order by order number
     */
    static async getOrderByNumber(orderNumber, userId = null) {
        try {
            const where = { orderNumber };
            if (userId) {
                where.userId = userId;
            }

            const order = await Order.findOne({
                where,
                include: [
                    {
                        model: OrderItem,
                        as: 'items'
                    },
                    {
                        model: User,
                        attributes: ['id', 'name', 'email', 'phone']
                    }
                ]
            });

            if (!order) {
                throw new AppError('Pesanan tidak ditemukan', 404);
            }

            return order;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user orders
     */
    static async getUserOrders(userId, filters = {}) {
        try {
            const { page = 1, limit = 10, status, startDate, endDate } = filters;
            const offset = (page - 1) * limit;

            const where = { userId };

            if (status) {
                where.status = status;
            }

            if (startDate && endDate) {
                where.createdAt = {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                };
            }

            const orders = await Order.findAndCountAll({
                where,
                include: [{
                    model: OrderItem,
                    as: 'items',
                    limit: 3
                }],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                orders: orders.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: orders.count,
                    pages: Math.ceil(orders.count / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all orders (admin)
     */
    static async getAllOrders(filters = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                paymentStatus,
                startDate,
                endDate,
                search
            } = filters;

            const offset = (page - 1) * limit;
            const where = {};

            if (status) {
                where.status = status;
            }

            if (paymentStatus) {
                where.paymentStatus = paymentStatus;
            }

            if (startDate && endDate) {
                where.createdAt = {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                };
            }

            if (search) {
                where[Op.or] = [
                    { orderNumber: { [Op.like]: `%${search}%` } },
                    { '$user.name$': { [Op.like]: `%${search}%` } },
                    { '$user.email$': { [Op.like]: `%${search}%` } }
                ];
            }

            const orders = await Order.findAndCountAll({
                where,
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'email', 'phone']
                    },
                    {
                        model: OrderItem,
                        as: 'items',
                        limit: 2
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true
            });

            return {
                orders: orders.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: orders.count,
                    pages: Math.ceil(orders.count / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update order status
     */
    static async updateOrderStatus(orderId, newStatus, notes = '', userId = null) {
        const transaction = await sequelize.transaction();

        try {
            const order = await Order.findByPk(orderId, { transaction });

            if (!order) {
                throw new AppError('Pesanan tidak ditemukan', 404);
            }

            const oldStatus = order.status;

            // Validate status transition
            if (!this.isValidStatusTransition(oldStatus, newStatus)) {
                throw new AppError(`Transisi status dari ${oldStatus} ke ${newStatus} tidak valid`, 400);
            }

            // Update order status
            order.status = newStatus;

            // Update payment status if order is completed
            if (newStatus === 'delivered') {
                order.paymentStatus = 'paid';
                order.deliveredAt = new Date();
            } else if (newStatus === 'cancelled') {
                order.paymentStatus = 'refunded';
                await this.restoreOrderStock(orderId, transaction);
            }

            await order.save({ transaction });

            // Create status history record
            await OrderStatusHistory.create(
                {
                    orderId,
                    status: newStatus,
                    notes,
                    changedBy: userId
                },
                { transaction }
            );

            // Commit transaction
            await transaction.commit();

            // Get user for notification
            const user = await User.findByPk(order.userId);
            if (user) {
                // Notify user about status update
                await NotificationService.notifyUserOrderStatus(order, user);
            }

            return order;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Cancel order
     */
    static async cancelOrder(orderId, userId, reason = '') {
        try {
            const order = await Order.findOne({
                where: { id: orderId, userId }
            });

            if (!order) {
                throw new AppError('Pesanan tidak ditemukan', 404);
            }

            // Check if order can be cancelled
            if (!['pending', 'processing'].includes(order.status)) {
                throw new AppError(
                    `Pesanan dengan status ${order.status} tidak dapat dibatalkan`,
                    400
                );
            }

            // Update order status
            order.status = 'cancelled';
            order.cancellationReason = reason;
            await order.save();

            // Restore stock
            await this.restoreOrderStock(orderId);

            // Create status history
            await OrderStatusHistory.create({
                orderId,
                status: 'cancelled',
                notes: `Order cancelled by user. Reason: ${reason}`
            });

            // Send cancellation email
            const user = await User.findByPk(userId);
            if (user) {
                await NotificationService.sendEmail(
                    user.email,
                    'orderCancelled',
                    {
                        orderNumber: order.orderNumber,
                        reason,
                        refundStatus: 'Dalam proses'
                    }
                );
            }

            return order;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Calculate shipping cost
     */
    static async calculateShippingCost(address, weight, method) {
        try {
            // In production, integrate with RajaOngkir API
            // For now, use simplified calculation

            const baseCost = 15000; // Base cost for Jabodetabek
            const weightCost = Math.ceil(weight / 1000) * 5000; // Rp 5,000 per kg
            const distanceMultiplier = this.getDistanceMultiplier(address.city);

            let methodMultiplier = 1;
            switch (method) {
                case 'express':
                    methodMultiplier = 2;
                    break;
                case 'same_day':
                    methodMultiplier = 3;
                    break;
                case 'economy':
                    methodMultiplier = 0.7;
                    break;
            }

            const totalCost = (baseCost + weightCost) * distanceMultiplier * methodMultiplier;

            return Math.ceil(totalCost / 1000) * 1000; // Round to nearest 1000
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get distance multiplier based on city
     */
    static getDistanceMultiplier(city) {
        const zones = {
            // Jabodetabek
            'jakarta': 1,
            'bogor': 1.2,
            'depok': 1.1,
            'tangerang': 1.1,
            'bekasi': 1.1,

            // Java
            'bandung': 1.5,
            'semarang': 2,
            'yogyakarta': 2.2,
            'surabaya': 2.5,

            // Outside Java
            'medan': 3,
            'palembang': 2.8,
            'makassar': 4,
            'denpasar': 3.5
        };

        const cityLower = city.toLowerCase();
        for (const [key, value] of Object.entries(zones)) {
            if (cityLower.includes(key)) {
                return value;
            }
        }

        return 2; // Default multiplier
    }

    /**
     * Generate order number
     */
    static generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();

        return `ORD${year}${month}${day}${random}`;
    }

    /**
     * Validate status transition
     */
    static isValidStatusTransition(fromStatus, toStatus) {
        const validTransitions = {
            pending: ['processing', 'cancelled'],
            processing: ['shipped', 'cancelled'],
            shipped: ['delivered', 'cancelled'],
            delivered: ['completed', 'returned'],
            completed: [],
            cancelled: [],
            returned: ['refunded']
        };

        return validTransitions[fromStatus]?.includes(toStatus) || false;
    }

    /**
     * Restore order stock
     */
    static async restoreOrderStock(orderId, transaction = null) {
        try {
            const orderItems = await OrderItem.findAll({
                where: { orderId },
                transaction
            });

            for (const item of orderItems) {
                await InventoryService.updateStock(
                    item.productId,
                    item.quantity,
                    'RESTOCK',
                    'Order cancelled/returned',
                    null,
                    transaction
                );
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get order statistics
     */
    static async getOrderStats(timeframe = 'month') {
        try {
            const now = new Date();
            let startDate;

            switch (timeframe) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            }

            const stats = await Order.findAll({
                where: {
                    createdAt: { [Op.gte]: startDate },
                    status: { [Op.notIn]: ['cancelled', 'pending'] }
                },
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
                    [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalRevenue'],
                    [sequelize.fn('AVG', sequelize.col('totalAmount')), 'averageOrderValue']
                ],
                raw: true
            });

            // Get order status distribution
            const statusDistribution = await Order.findAll({
                where: { createdAt: { [Op.gte]: startDate } },
                attributes: [
                    'status',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['status'],
                raw: true
            });

            // Get top products
            const topProducts = await OrderItem.findAll({
                include: [{
                    model: Order,
                    where: { createdAt: { [Op.gte]: startDate } }
                }],
                attributes: [
                    'productId',
                    'productName',
                    [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
                    [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']
                ],
                group: ['productId', 'productName'],
                order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
                limit: 5,
                raw: true
            });

            return {
                timeframe,
                period: { start: startDate, end: now },
                overview: stats[0] || {},
                statusDistribution,
                topProducts
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Process payment
     */
    static async processPayment(orderId, paymentData) {
        try {
            const order = await Order.findByPk(orderId);

            if (!order) {
                throw new AppError('Pesanan tidak ditemukan', 404);
            }

            if (order.paymentStatus !== 'pending') {
                throw new AppError('Pesanan sudah diproses pembayarannya', 400);
            }

            // Create payment record
            const payment = await Payment.create({
                orderId,
                ...paymentData,
                status: 'pending'
            });

            // If payment is COD, update order status
            if (paymentData.method === 'cod') {
                order.paymentStatus = 'pending_cod';
                await order.save();

                await OrderStatusHistory.create({
                    orderId,
                    status: 'processing',
                    notes: 'COD payment selected, waiting for delivery'
                });
            }

            return payment;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verify payment
     */
    static async verifyPayment(orderId, paymentProof) {
        try {
            const order = await Order.findByPk(orderId);

            if (!order) {
                throw new AppError('Pesanan tidak ditemukan', 404);
            }

            // Update payment with proof
            const payment = await Payment.findOne({ where: { orderId } });
            if (!payment) {
                throw new AppError('Data pembayaran tidak ditemukan', 404);
            }

            payment.proofUrl = paymentProof;
            payment.verifiedAt = new Date();
            payment.status = 'verifying';
            await payment.save();

            // Update order status
            order.paymentStatus = 'verifying';
            await order.save();

            await OrderStatusHistory.create({
                orderId,
                status: 'processing',
                notes: 'Payment proof uploaded, waiting for verification'
            });

            // Notify admin for verification
            await NotificationService.notifyAdminPaymentVerification(order);

            return payment;
        } catch (error) {
            throw error;
        }
    }
}

export default OrderService;
