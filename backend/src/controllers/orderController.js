import models from '../models/index.js';
import AppError from '../utils/appError.js';
import { paginate } from '../utils/pagination.js';
import EmailService from '../services/email.service.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';

const { Order, OrderItem, Product, User, Address, Payment, ProductVariant, PromoCode } = models;

// Create new order
export const createOrder = async (req, res, next) => {
    const transaction = await models.sequelize.transaction();

    try {
        const {
            address_id,
            payment_method,
            shipping_method,
            shipping_cost,
            notes,
            promo_code,
            items,
        } = req.body;

        const user = req.user;

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            await transaction.rollback();
            return next(new AppError('Order must contain at least one item', 400));
        }

        // Get address
        const address = await Address.findOne({
            where: { id: address_id, user_id: user.id },
            transaction,
        });

        if (!address) {
            await transaction.rollback();
            return next(new AppError('Address not found', 404));
        }

        // Calculate order items and validate stock
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const { product_id, variant_id, quantity } = item;

            if (!product_id || !quantity || quantity < 1) {
                await transaction.rollback();
                return next(new AppError('Invalid item data', 400));
            }

            // Get product
            const product = await Product.findByPk(product_id, { transaction });
            if (!product) {
                await transaction.rollback();
                return next(new AppError(`Product ${product_id} not found`, 404));
            }

            if (!product.is_available) {
                await transaction.rollback();
                return next(new AppError(`Product ${product.name} is not available`, 400));
            }

            let price = product.price;
            let variant = null;

            // Check variant if specified
            if (variant_id) {
                variant = await ProductVariant.findByPk(variant_id, { transaction });
                if (!variant || variant.product_id !== product.id) {
                    await transaction.rollback();
                    return next(new AppError('Invalid product variant', 400));
                }

                if (variant.stock < quantity) {
                    await transaction.rollback();
                    return next(new AppError(`Insufficient stock for variant ${variant.variant_value}`, 400));
                }

                price = variant.price || product.price;
            } else {
                if (product.stock < quantity) {
                    await transaction.rollback();
                    return next(new AppError(`Insufficient stock for ${product.name}`, 400));
                }
            }

            const itemSubtotal = price * quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                product_id,
                variant_id,
                product_name: product.name,
                price,
                quantity,
                subtotal: itemSubtotal,
            });
        }

        // Apply promo code if provided
        let discount = 0;
        let promoCodeUsed = null;

        if (promo_code) {
            const promo = await PromoCode.findOne({
                where: {
                    code: promo_code,
                    is_active: true,
                    start_date: { [Op.lte]: new Date() },
                    end_date: { [Op.gte]: new Date() },
                    usage_limit: { [Op.or]: [{ [Op.gt]: models.sequelize.col('used_count') }, { [Op.is]: null }] },
                },
                transaction,
            });

            if (promo) {
                // Check minimum purchase
                if (subtotal < promo.min_purchase) {
                    await transaction.rollback();
                    return next(new AppError(`Minimum purchase of ${promo.min_purchase} required for this promo code`, 400));
                }

                // Calculate discount
                if (promo.discount_type === 'percentage') {
                    discount = subtotal * (promo.discount_value / 100);
                    if (promo.max_discount && discount > promo.max_discount) {
                        discount = promo.max_discount;
                    }
                } else {
                    discount = promo.discount_value;
                }

                promoCodeUsed = promo;
            }
        }

        // Calculate tax (10%)
        const tax = subtotal * 0.1;

        // Calculate total
        const total = subtotal + tax + parseFloat(shipping_cost || 0) - discount;

        // Create order
        const order = await Order.create({
            user_id: user.id,
            address_id: address.id,
            payment_method,
            shipping_method,
            shipping_cost: parseFloat(shipping_cost || 0),
            subtotal,
            tax,
            discount,
            total,
            notes,
            promo_code_id: promoCodeUsed ? promoCodeUsed.id : null,
        }, { transaction });

        // Create order items
        const createdOrderItems = await OrderItem.bulkCreate(
            orderItems.map(item => ({
                order_id: order.id,
                ...item,
            })),
            { transaction }
        );

        // Update product stock
        for (const [index, item] of orderItems.entries()) {
            if (item.variant_id) {
                await ProductVariant.decrement('stock', {
                    by: item.quantity,
                    where: { id: item.variant_id },
                    transaction,
                });
            } else {
                await Product.decrement('stock', {
                    by: item.quantity,
                    where: { id: item.product_id },
                    transaction,
                });

                // Increment sales count
                await Product.increment('sales_count', {
                    by: item.quantity,
                    where: { id: item.product_id },
                    transaction,
                });
            }
        }

        // Update promo code usage
        if (promoCodeUsed) {
            await PromoCode.increment('used_count', {
                by: 1,
                where: { id: promoCodeUsed.id },
                transaction,
            });
        }

        // Create initial status history
        await models.OrderStatusHistory.create({
            order_id: order.id,
            status: 'pending',
            notes: 'Order created',
        }, { transaction });

        // Create payment record
        await Payment.create({
            order_id: order.id,
            payment_method,
            amount: total,
            status: 'pending',
        }, { transaction });

        // Commit transaction
        await transaction.commit();

        // Get order with details
        const orderWithDetails = await Order.findByPk(order.id, {
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'slug', 'images'],
                            include: [
                                {
                                    model: models.ProductImage,
                                    as: 'images',
                                    attributes: ['image_url', 'alt_text', 'is_primary'],
                                    where: { is_primary: true },
                                    required: false,
                                },
                            ],
                        },
                        {
                            model: ProductVariant,
                            as: 'variant',
                            attributes: ['id', 'variant_name', 'variant_value'],
                        },
                    ],
                },
                {
                    model: Address,
                    as: 'address',
                },
                {
                    model: Payment,
                    as: 'payment',
                },
            ],
        });

        // Send order confirmation email
        try {
            await EmailService.sendOrderConfirmationEmail(
                user.email,
                user.name,
                orderWithDetails
            );
        } catch (emailError) {
            logger.error('Failed to send order confirmation email:', emailError);
        }

        // Create notification
        await models.Notification.create({
            user_id: user.id,
            type: 'order_update',
            title: 'Pesanan Berhasil Dibuat',
            message: `Pesanan #${order.order_number} berhasil dibuat. Silakan lakukan pembayaran.`,
            data: { order_id: order.id, order_number: order.order_number },
        });

        // Clear user's cart
        await models.CartItem.destroy({ where: { user_id: user.id } });

        res.status(201).json({
            status: 'success',
            data: {
                order: orderWithDetails,
            },
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// Get user orders
export const getMyOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const where = { user_id: req.user.id };

        if (status) {
            where.status = status;
        }

        const result = await paginate(Order, {
            page: parseInt(page),
            limit: parseInt(limit),
            where,
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    attributes: ['id', 'product_name', 'price', 'quantity', 'subtotal'],
                    limit: 2,
                },
                {
                    model: Payment,
                    as: 'payment',
                    attributes: ['id', 'status', 'payment_method', 'amount'],
                },
            ],
            order: [['created_at', 'DESC']],
        });

        res.status(200).json({
            status: 'success',
            data: {
                orders: result.data,
                pagination: result.pagination,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get single order
export const getOrder = async (req, res, next) => {
    try {
        const { id } = req.params;

        const order = await Order.findOne({
            where: {
                id,
                user_id: req.user.id,
            },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'slug'],
                            include: [
                                {
                                    model: models.ProductImage,
                                    as: 'images',
                                    attributes: ['image_url', 'alt_text', 'is_primary'],
                                    where: { is_primary: true },
                                    required: false,
                                },
                            ],
                        },
                        {
                            model: ProductVariant,
                            as: 'variant',
                            attributes: ['id', 'variant_name', 'variant_value'],
                        },
                    ],
                },
                {
                    model: Address,
                    as: 'address',
                },
                {
                    model: Payment,
                    as: 'payment',
                },
                {
                    model: models.OrderStatusHistory,
                    as: 'statusHistory',
                    order: [['created_at', 'ASC']],
                },
                {
                    model: PromoCode,
                    as: 'promoCode',
                    attributes: ['id', 'code', 'description', 'discount_type', 'discount_value'],
                },
            ],
        });

        if (!order) {
            return next(new AppError('Order not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                order,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Cancel order
export const cancelOrder = async (req, res, next) => {
    const transaction = await models.sequelize.transaction();

    try {
        const { id } = req.params;
        const { reason } = req.body;

        const order = await Order.findOne({
            where: {
                id,
                user_id: req.user.id,
            },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                },
            ],
            transaction,
        });

        if (!order) {
            await transaction.rollback();
            return next(new AppError('Order not found', 404));
        }

        // Check if order can be cancelled
        if (!order.canBeCancelled()) {
            await transaction.rollback();
            return next(new AppError('Order cannot be cancelled at this stage', 400));
        }

        // Update order status
        await order.updateStatus('cancelled', `Cancelled by user. Reason: ${reason || 'No reason provided'}`, { transaction });

        // Restore product stock
        for (const item of order.items) {
            if (item.variant_id) {
                await ProductVariant.increment('stock', {
                    by: item.quantity,
                    where: { id: item.variant_id },
                    transaction,
                });
            } else {
                await Product.increment('stock', {
                    by: item.quantity,
                    where: { id: item.product_id },
                    transaction,
                });

                // Decrement sales count
                await Product.decrement('sales_count', {
                    by: item.quantity,
                    where: { id: item.product_id },
                    transaction,
                });
            }
        }

        // Update payment status if paid
        if (order.payment_status === 'paid') {
            await Payment.update(
                { status: 'refunded', refunded_at: new Date() },
                { where: { order_id: order.id }, transaction }
            );

            order.payment_status = 'refunded';
            await order.save({ transaction });
        }

        // Commit transaction
        await transaction.commit();

        // Send cancellation email
        try {
            const user = await User.findByPk(req.user.id);
            await EmailService.sendOrderCancellationEmail(
                user.email,
                user.name,
                order,
                reason
            );
        } catch (emailError) {
            logger.error('Failed to send cancellation email:', emailError);
        }

        // Create notification
        await models.Notification.create({
            user_id: req.user.id,
            type: 'order_update',
            title: 'Pesanan Dibatalkan',
            message: `Pesanan #${order.order_number} telah dibatalkan.`,
            data: { order_id: order.id, order_number: order.order_number },
        });

        res.status(200).json({
            status: 'success',
            data: {
                order,
            },
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// Track order
export const trackOrder = async (req, res, next) => {
    try {
        const { order_number } = req.params;

        const order = await Order.findOne({
            where: {
                order_number,
                user_id: req.user.id,
            },
            include: [
                {
                    model: models.OrderStatusHistory,
                    as: 'statusHistory',
                    order: [['created_at', 'ASC']],
                },
                {
                    model: Payment,
                    as: 'payment',
                    attributes: ['id', 'status', 'payment_method', 'amount', 'paid_at'],
                },
            ],
            attributes: ['id', 'order_number', 'status', 'shipping_method', 'tracking_number', 'created_at'],
        });

        if (!order) {
            return next(new AppError('Order not found', 404));
        }

        // Simulate shipping tracking (in real app, integrate with shipping API)
        let trackingInfo = null;
        if (order.tracking_number) {
            trackingInfo = {
                tracking_number: order.tracking_number,
                carrier: order.shipping_method,
                status: order.status === 'shipped' ? 'in_transit' : order.status,
                estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                checkpoints: [
                    {
                        location: 'Jakarta',
                        status: 'Package received at sorting facility',
                        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    },
                    {
                        location: 'Bandung',
                        status: 'Package in transit',
                        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    },
                ],
            };
        }

        res.status(200).json({
            status: 'success',
            data: {
                order,
                tracking: trackingInfo,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Request return/refund
export const requestReturn = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason, items } = req.body;

        const order = await Order.findOne({
            where: {
                id,
                user_id: req.user.id,
                status: 'delivered',
            },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                },
            ],
        });

        if (!order) {
            return next(new AppError('Order not found or not eligible for return', 404));
        }

        // Check if return was already requested
        const existingReturn = await models.ReturnRequest.findOne({
            where: { order_id: order.id },
        });

        if (existingReturn) {
            return next(new AppError('Return request already submitted for this order', 400));
        }

        // Create return request
        const returnRequest = await models.ReturnRequest.create({
            order_id: order.id,
            user_id: req.user.id,
            reason,
            status: 'pending',
            requested_items: items || order.items.map(item => ({
                order_item_id: item.id,
                quantity: item.quantity,
            })),
        });

        // Create notification for admin
        await models.Notification.create({
            user_id: req.user.id,
            type: 'system',
            title: 'Permintaan Return Baru',
            message: `Pengguna ${req.user.name} mengajukan return untuk order #${order.order_number}`,
            data: { order_id: order.id, return_request_id: returnRequest.id },
        });

        // Send email to admin
        try {
            await EmailService.sendReturnRequestEmail(returnRequest, order, req.user);
        } catch (emailError) {
            logger.error('Failed to send return request email:', emailError);
        }

        res.status(201).json({
            status: 'success',
            data: {
                returnRequest,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get order statistics for user
export const getOrderStatistics = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const statistics = await Order.findAll({
            where: { user_id: userId },
            attributes: [
                [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total_orders'],
                [models.sequelize.fn('SUM', models.sequelize.col('total')), 'total_spent'],
                [models.sequelize.fn('AVG', models.sequelize.col('total')), 'average_order_value'],
                [models.sequelize.literal(`COUNT(CASE WHEN status = 'pending' THEN 1 END)`), 'pending_orders'],
                [models.sequelize.literal(`COUNT(CASE WHEN status = 'processing' THEN 1 END)`), 'processing_orders'],
                [models.sequelize.literal(`COUNT(CASE WHEN status = 'delivered' THEN 1 END)`), 'delivered_orders'],
                [models.sequelize.literal(`COUNT(CASE WHEN status = 'cancelled' THEN 1 END)`), 'cancelled_orders'],
            ],
            raw: true,
        });

        const monthlySpending = await Order.findAll({
            where: {
                user_id: userId,
                created_at: {
                    [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1), // Last 6 months
                },
            },
            attributes: [
                [models.sequelize.fn('DATE_FORMAT', models.sequelize.col('created_at'), '%Y-%m'), 'month'],
                [models.sequelize.fn('SUM', models.sequelize.col('total')), 'total'],
                [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count'],
            ],
            group: ['month'],
            order: [['month', 'ASC']],
            raw: true,
        });

        res.status(200).json({
            status: 'success',
            data: {
                statistics: statistics[0] || {
                    total_orders: 0,
                    total_spent: 0,
                    average_order_value: 0,
                    pending_orders: 0,
                    processing_orders: 0,
                    delivered_orders: 0,
                    cancelled_orders: 0,
                },
                monthlySpending,
            },
        });
    } catch (error) {
        next(error);
    }
};
