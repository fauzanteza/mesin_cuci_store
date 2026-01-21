// backend/src/services/adminOrder.service.js
import models from '../models/index.js';
import { Op } from 'sequelize';
import AppError from '../utils/appError.js';
import emailService from './email.service.js';

const {
    Order,
    OrderItem,
    User,
    Address,
    Product,
    OrderStatusHistory,
    sequelize
} = models;

class AdminOrderService {
    async getOrders(params) {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            paymentStatus,
            startDate,
            endDate,
            customerId,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = params;

        const offset = (page - 1) * limit;
        const where = {};

        if (status && status !== 'all') where.status = status;
        if (paymentStatus && paymentStatus !== 'all') where.paymentStatus = paymentStatus;
        if (customerId) where.userId = customerId;

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt[Op.gte] = new Date(startDate);
            if (endDate) where.createdAt[Op.lte] = new Date(endDate);
        }

        if (search) {
            where[Op.or] = [
                { orderNumber: { [Op.like]: `%${search}%` } },
                { '$user.name$': { [Op.like]: `%${search}%` } },
                { '$user.email$': { [Op.like]: `%${search}%` } }
            ];
        }

        return await Order.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: OrderItem,
                    as: 'items',
                    attributes: ['id', 'productName', 'quantity', 'subtotal']
                }
            ],
            order: [[sortBy, sortOrder]],
            limit,
            offset,
            distinct: true
        });
    }

    async getOrderById(id) {
        const order = await Order.findByPk(id, {
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'images', 'sku'] }]
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'phone', 'avatar']
                },
                {
                    model: Address,
                    as: 'shippingAddress'
                },
                {
                    model: Address,
                    as: 'billingAddress'
                },
                // {
                //     model: OrderStatusHistory,
                //     as: 'statusHistory',
                //     order: [['createdAt', 'DESC']]
                // }
            ]
        });

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        // Mock status history if not implemented in model association yet
        if (!order.statusHistory) {
            order.dataValues.statusHistory = [
                { status: order.status, updatedAt: order.updatedAt, updatedBy: 'System', note: 'Current Status' },
                { status: 'pending', updatedAt: order.createdAt, updatedBy: 'System', note: 'Order Placed' }
            ];
        }

        return order;
    }

    // Placeholder for createOrder (usually orders are created by users)
    async createOrder(data) {
        throw new AppError('Admin create order not implemented yet', 501);
    }

    // Placeholder for updateOrder generic
    async updateOrder(id, data) {
        const order = await Order.findByPk(id);
        if (!order) throw new AppError('Order not found', 404);

        await order.update(data);
        return order;
    }

    async deleteOrder(id) {
        const order = await Order.findByPk(id);
        if (!order) throw new AppError('Order not found', 404);
        await order.destroy();
    }

    async updateOrderStatus(id, status, userId, metadata = {}) {
        const order = await Order.findByPk(id);
        if (!order) throw new AppError('Order not found', 404);

        const transaction = await sequelize.transaction();
        try {
            order.status = status;
            if (metadata.trackingNumber) order.trackingNumber = metadata.trackingNumber;
            if (metadata.courier) order.courier = metadata.courier;
            if (metadata.estimatedDelivery) order.estimatedDelivery = metadata.estimatedDelivery;

            await order.save({ transaction });

            // Add history
            try {
                // Check if model exists/associated
                await OrderStatusHistory.create({
                    orderId: id,
                    status: status,
                    changedBy: userId,
                    notes: metadata.note || `Status updated to ${status}`
                }, { transaction });
            } catch (e) {
                // Ignore if table not ready
            }

            await transaction.commit();

            // Send email
            // Get user for notification
            const user = await User.findByPk(order.userId);
            if (user) {
                try {
                    await emailService.sendOrderStatusUpdate(user.email, order);
                } catch (e) { }
            }

            return order;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updatePaymentStatus(id, status, note) {
        const order = await Order.findByPk(id);
        if (!order) throw new AppError('Order not found', 404);

        order.paymentStatus = status;
        await order.save();
        return order;
    }

    async updateOrderNotes(id, adminNotes) {
        const order = await Order.findByPk(id);
        if (!order) throw new AppError('Order not found', 404);

        order.adminNotes = adminNotes;
        await order.save();
        return order;
    }

    async bulkUpdateOrderStatus(orderIds, status) {
        const result = await Order.update(
            { status },
            { where: { id: { [Op.in]: orderIds } } }
        );
        return { updatedCount: result[0] };
    }

    async exportOrders(format, startDate, endDate) {
        // Placeholder for export - return sample CSV
        const header = 'Order Number,Customer,Total,Status,Date\n';
        const row = 'ORD-001,John Doe,100000,pending,2024-01-01\n';
        return Buffer.from(header + row);
    }

    async getOrderStats(period) {
        // Reusing logic from order service but could be expanded
        const totalOrders = await Order.count();
        const revenue = await Order.sum('total') || 0;
        const pendingOrders = await Order.count({ where: { status: 'pending' } });

        return {
            totalOrders,
            revenue,
            pendingOrders
        };
    }
}

export default new AdminOrderService();
