import { Order, OrderItem, User, Address, Product } from '../models/index.js';
// import { v4 as uuidv4 } from 'uuid'; // Assumption: user might have uuid installed, or I'll comment it if not sure, but request had it. I'll stick to request.
// Actually, request assumes `import { v4 as uuidv4 } from 'uuid';`.
// I'll include it. If package missing, I'll note it.
import { v4 as uuidv4 } from 'uuid';
import emailService from './email.service.js';

class OrderService {
    async createOrder(orderData) {
        const {
            userId,
            items,
            shippingAddressId,
            billingAddressId,
            shippingMethod,
            paymentMethod,
            notes,
        } = orderData;

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product) {
                throw new Error(`Product ${item.productId} not found`);
            }

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}`);
            }

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal: itemTotal,
                image: product.images?.[0]?.url,
            });

            // Reduce stock
            product.stock -= item.quantity;
            await product.save();
        }

        const shippingCost = shippingMethod.cost || 0;
        const tax = subtotal * 0.11; // 11% VAT
        const total = subtotal + shippingCost + tax;

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create order
        const order = await Order.create({
            orderNumber,
            userId,
            shippingAddressId,
            billingAddressId: billingAddressId || shippingAddressId,
            shippingMethod: shippingMethod.name,
            shippingCost,
            paymentMethod: paymentMethod.name,
            subtotal,
            tax,
            total,
            status: 'pending',
            notes,
        });

        // Create order items
        await OrderItem.bulkCreate(
            orderItems.map(item => ({
                ...item,
                orderId: order.id,
            }))
        );

        // Send confirmation email
        const user = await User.findByPk(userId);
        if (user) {
            // Assuming emailService exists or will be created
            try {
                await emailService.sendOrderConfirmation(user.email, order, orderItems);
            } catch (error) {
                console.error('Failed to send email:', error);
            }
        }

        return order;
    }

    async getOrderById(id, userId) {
        const order = await Order.findByPk(id, {
            include: [
                { model: OrderItem, as: 'items' },
                { model: Address, as: 'shippingAddress' },
                { model: Address, as: 'billingAddress' },
                { model: User, attributes: ['id', 'name', 'email', 'phone'] },
            ],
        });

        if (!order) {
            throw new Error('Order not found');
        }

        // Check if user is authorized
        if (order.userId !== userId && userId !== 'admin') {
            throw new Error('Unauthorized');
        }

        return order;
    }

    async getUserOrders(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const { rows: orders, count } = await Order.findAndCountAll({
            where: { userId },
            include: [
                { model: OrderItem, as: 'items', limit: 3 },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        return {
            orders,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit),
            },
        };
    }

    async updateOrderStatus(id, status, userId) {
        const order = await Order.findByPk(id);
        if (!order) {
            throw new Error('Order not found');
        }

        // Authorization check
        if (order.userId !== userId && userId !== 'admin') {
            throw new Error('Unauthorized');
        }

        order.status = status;
        await order.save();

        // Add status history (Assuming OrderStatusHistory model exists or we skip strictly)
        /*
        await OrderStatusHistory.create({
          orderId: order.id,
          status,
          changedBy: userId,
          notes: `Status changed to ${status}`,
        });
        */

        // Send notification
        const user = await User.findByPk(order.userId);
        if (user) {
            try {
                await emailService.sendOrderStatusUpdate(user.email, order);
            } catch (e) {
                // ignore email error
            }
        }

        return order;
    }

    async cancelOrder(id, userId, reason) {
        const order = await Order.findByPk(id);
        if (!order) {
            throw new Error('Order not found');
        }

        if (order.userId !== userId) {
            throw new Error('Unauthorized');
        }

        // Check if order can be cancelled
        if (!['pending', 'processing'].includes(order.status)) {
            throw new Error(`Cannot cancel order in ${order.status} status`);
        }

        order.status = 'cancelled';
        order.cancellationReason = reason;
        await order.save();

        // Restore stock
        const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
        for (const item of orderItems) {
            const product = await Product.findByPk(item.productId);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        return order;
    }
}

export default new OrderService();
