import Order from '../../models/Order.js';
import OrderItem from '../../models/OrderItem.js';
import User from '../../models/User.js';
import NotificationService from '../../services/notification.service.js';
import OrderService from '../../services/order.service.js';
import OrderStatusHistory from '../../models/OrderStatusHistory.js';
import ShippingUpdate from '../../models/ShippingUpdate.js';
import Payment from '../../models/Payment.js';
import DeliveryRecord from '../../models/DeliveryRecord.js';
import Address from '../../models/Address.js';

class OrderHandler {
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;
        this.userId = null;
        this.userRole = null;
        this.subscribedOrders = new Set();

        // Bind methods
        this.setupHandlers = this.setupHandlers.bind(this);
        this.handleSubscribeToOrder = this.handleSubscribeToOrder.bind(this);
        this.handleUnsubscribeFromOrder = this.handleUnsubscribeFromOrder.bind(this);
        this.handleGetOrderStatus = this.handleGetOrderStatus.bind(this);
        this.handleTrackOrder = this.handleTrackOrder.bind(this);
        this.handleGetOrderUpdates = this.handleGetOrderUpdates.bind(this);
        this.handleSubscribeToAllOrders = this.handleSubscribeToAllOrders.bind(this);
        this.handleOrderStatusUpdate = this.handleOrderStatusUpdate.bind(this);
        this.handleNewOrder = this.handleNewOrder.bind(this);
        this.handlePaymentUpdate = this.handlePaymentUpdate.bind(this);
        this.handleShippingUpdate = this.handleShippingUpdate.bind(this);
        this.handleOrderCancellation = this.handleOrderCancellation.bind(this);
        this.handleOrderDelivery = this.handleOrderDelivery.bind(this);
    }

    /**
     * Setup all order handlers
     */
    setupHandlers(userId, userRole) {
        this.userId = userId;
        this.userRole = userRole;

        // Join user's order room
        this.socket.join(`orders_user_${userId}`);

        // If user is admin, join admin orders room
        if (userRole === 'admin') {
            this.socket.join('orders_admin');
        }

        // Setup event handlers
        this.socket.on('order:subscribe', this.handleSubscribeToOrder);
        this.socket.on('order:unsubscribe', this.handleUnsubscribeFromOrder);
        this.socket.on('order:get_status', this.handleGetOrderStatus);
        this.socket.on('order:track', this.handleTrackOrder);
        this.socket.on('order:get_updates', this.handleGetOrderUpdates);
        this.socket.on('order:subscribe_all', this.handleSubscribeToAllOrders);
        this.socket.on('order:status_update', this.handleOrderStatusUpdate);
        this.socket.on('order:new', this.handleNewOrder);
        this.socket.on('order:payment_update', this.handlePaymentUpdate);
        this.socket.on('order:shipping_update', this.handleShippingUpdate);
        this.socket.on('order:cancellation', this.handleOrderCancellation);
        this.socket.on('order:delivery', this.handleOrderDelivery);

        console.log(`📦 Order handlers setup for user ${userId} (${userRole})`);
    }

    /**
     * Handle subscription to a specific order
     */
    async handleSubscribeToOrder(data) {
        try {
            const { orderId, orderNumber } = data;

            if (!orderId && !orderNumber) {
                throw new Error('Order ID or Order Number is required');
            }

            let order;
            if (orderId) {
                order = await Order.findByPk(orderId);
            } else {
                order = await Order.findOne({ where: { orderNumber } });
            }

            if (!order) {
                throw new Error('Order not found');
            }

            // Check permissions
            if (this.userRole !== 'admin' && order.userId !== this.userId) {
                throw new Error('Access denied to this order');
            }

            // Join order room
            const roomName = `order_${order.id}`;
            this.socket.join(roomName);
            this.subscribedOrders.add(order.id);

            // Get current order status
            const orderWithStatus = await this.getOrderWithStatus(order.id);

            this.socket.emit('order:subscribed', {
                success: true,
                orderId: order.id,
                orderNumber: order.orderNumber,
                currentStatus: orderWithStatus,
                subscribedAt: new Date()
            });

            console.log(`User ${this.userId} subscribed to order ${order.id}`);
        } catch (error) {
            this.socket.emit('order:error', {
                error: 'Failed to subscribe to order',
                details: error.message
            });
        }
    }

    /**
     * Handle unsubscription from an order
     */
    async handleUnsubscribeFromOrder(data) {
        try {
            const { orderId } = data;

            if (!orderId) {
                throw new Error('Order ID is required');
            }

            // Leave order room
            const roomName = `order_${orderId}`;
            this.socket.leave(roomName);
            this.subscribedOrders.delete(orderId);

            this.socket.emit('order:unsubscribed', {
                success: true,
                orderId,
                unsubscribedAt: new Date()
            });

            console.log(`User ${this.userId} unsubscribed from order ${orderId}`);
        } catch (error) {
            this.socket.emit('order:error', {
                error: 'Failed to unsubscribe from order',
                details: error.message
            });
        }
    }

    /**
     * Handle getting current order status
     */
    async handleGetOrderStatus(data) {
        try {
            const { orderId, orderNumber } = data;

            if (!orderId && !orderNumber) {
                throw new Error('Order ID or Order Number is required');
            }

            let order;
            if (orderId) {
                order = await Order.findByPk(orderId, {
                    include: [
                        {
                            model: OrderItem,
                            as: 'items',
                            limit: 5
                        },
                        {
                            model: OrderStatusHistory,
                            as: 'statusHistory',
                            order: [['createdAt', 'DESC']],
                            limit: 10
                        }
                    ]
                });
            } else {
                order = await Order.findOne({
                    where: { orderNumber },
                    include: [
                        {
                            model: OrderItem,
                            as: 'items',
                            limit: 5
                        }
                    ]
                });
            }

            if (!order) {
                throw new Error('Order not found');
            }

            // Check permissions
            if (this.userRole !== 'admin' && order.userId !== this.userId) {
                throw new Error('Access denied to this order');
            }

            // Get estimated delivery time
            const estimatedDelivery = await this.calculateEstimatedDelivery(order);

            // Get tracking info if available
            const trackingInfo = await this.getTrackingInfo(order);

            this.socket.emit('order:status', {
                order: order.toJSON(),
                estimatedDelivery,
                trackingInfo,
                lastUpdated: new Date()
            });
        } catch (error) {
            this.socket.emit('order:error', {
                error: 'Failed to get order status',
                details: error.message
            });
        }
    }

    /**
     * Handle order tracking
     */
    async handleTrackOrder(data) {
        try {
            const { orderId } = data;

            if (!orderId) {
                throw new Error('Order ID is required');
            }

            const order = await Order.findByPk(orderId);

            if (!order) {
                throw new Error('Order not found');
            }

            // Check permissions
            if (this.userRole !== 'admin' && order.userId !== this.userId) {
                throw new Error('Access denied to this order');
            }

            // Get detailed tracking information
            const trackingInfo = await this.getDetailedTrackingInfo(order);

            // Start live tracking updates
            await this.startLiveTracking(order, trackingInfo);

            this.socket.emit('order:tracking_started', {
                success: true,
                orderId,
                trackingInfo,
                startedAt: new Date()
            });
        } catch (error) {
            this.socket.emit('order:error', {
                error: 'Failed to track order',
                details: error.message
            });
        }
    }

    /**
     * Handle getting order updates
     */
    async handleGetOrderUpdates(data) {
        try {
            const { orderId, since } = data;

            if (!orderId) {
                throw new Error('Order ID is required');
            }

            const order = await Order.findByPk(orderId);

            if (!order) {
                throw new Error('Order not found');
            }

            // Check permissions
            if (this.userRole !== 'admin' && order.userId !== this.userId) {
                throw new Error('Access denied to this order');
            }

            // Get status updates since specified time
            const updates = await OrderStatusHistory.findAll({
                where: {
                    orderId,
                    createdAt: { $gt: new Date(since) }
                },
                order: [['createdAt', 'ASC']]
            });

            // Get any other updates (payment, shipping, etc.)
            const otherUpdates = await this.getOtherOrderUpdates(orderId, since);

            this.socket.emit('order:updates', {
                orderId,
                updates: [...updates, ...otherUpdates],
                lastUpdate: new Date(),
                hasMore: updates.length === 50
            });
        } catch (error) {
            this.socket.emit('order:error', {
                error: 'Failed to get order updates',
                details: error.message
            });
        }
    }

    /**
     * Handle subscription to all user orders
     */
    async handleSubscribeToAllOrders() {
        try {
            // Get all user orders
            const orders = await Order.findAll({
                where: { userId: this.userId },
                attributes: ['id', 'orderNumber']
            });

            // Subscribe to each order
            const subscriptions = [];
            for (const order of orders) {
                await this.handleSubscribeToOrder({ orderId: order.id });
                subscriptions.push(order.id);
            }

            this.socket.emit('order:subscribed_all', {
                success: true,
                count: subscriptions.length,
                orderIds: subscriptions,
                subscribedAt: new Date()
            });

            console.log(`User ${this.userId} subscribed to all ${subscriptions.length} orders`);
        } catch (error) {
            this.socket.emit('order:error', {
                error: 'Failed to subscribe to all orders',
                details: error.message
            });
        }
    }

    /**
     * Handle order status update (admin only)
     */
    async handleOrderStatusUpdate(data) {
        try {
            if (this.userRole !== 'admin') {
                throw new Error('Admin access required');
            }

            const { orderId, status, notes } = data;

            if (!orderId || !status) {
                throw new Error('Order ID and status are required');
            }

            // Update order status
            const updatedOrder = await OrderService.updateOrderStatus(
                orderId,
                status,
                notes,
                this.userId
            );

            // Get user for notification
            const user = await User.findByPk(updatedOrder.userId);

            // Emit update to order room
            this.io.to(`order_${orderId}`).emit('order:status_updated', {
                orderId,
                newStatus: status,
                oldStatus: updatedOrder.previousStatus,
                updatedBy: this.userId,
                notes,
                timestamp: new Date(),
                estimatedDelivery: await this.calculateEstimatedDelivery(updatedOrder)
            });

            // Emit to user's order room
            this.io.to(`orders_user_${updatedOrder.userId}`).emit('order:user_status_updated', {
                orderId,
                orderNumber: updatedOrder.orderNumber,
                newStatus: status,
                timestamp: new Date()
            });

            // Send notification
            if (user) {
                await NotificationService.notifyUserOrderStatus(updatedOrder, user);
            }

            this.socket.emit('order:status_update_success', {
                success: true,
                orderId,
                status,
                timestamp: new Date()
            });

            console.log(`Order ${orderId} status updated to ${status} by admin ${this.userId}`);
        } catch (error) {
            this.socket.emit('order:error', {
                error: 'Failed to update order status',
                details: error.message
            });
        }
    }

    /**
     * Handle new order creation
     */
    async handleNewOrder(data) {
        try {
            const { order } = data;

            if (!order) {
                throw new Error('Order data is required');
            }

            // Emit to admin room
            this.io.to('orders_admin').emit('order:new', {
                order: order.toJSON(),
                createdAt: new Date()
            });

            // Emit to user's order room
            this.io.to(`orders_user_${order.userId}`).emit('order:created', {
                orderId: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                totalAmount: order.totalAmount,
                createdAt: order.createdAt
            });

            // Auto-subscribe user to their new order
            await this.handleSubscribeToOrder({ orderId: order.id });

            console.log(`New order ${order.id} created by user ${order.userId}`);
        } catch (error) {
            console.error('Failed to handle new order:', error);
        }
    }

    /**
     * Handle payment update
     */
    async handlePaymentUpdate(data) {
        try {
            const { orderId, paymentStatus, paymentMethod, amount } = data;

            if (!orderId || !paymentStatus) {
                throw new Error('Order ID and payment status are required');
            }

            const order = await Order.findByPk(orderId);

            if (!order) {
                throw new Error('Order not found');
            }

            // Update payment status
            order.paymentStatus = paymentStatus;
            if (paymentMethod) order.paymentMethod = paymentMethod;
            await order.save();

            // Emit to order room
            this.io.to(`order_${orderId}`).emit('order:payment_updated', {
                orderId,
                paymentStatus,
                paymentMethod,
                amount,
                updatedAt: new Date()
            });

            // If payment successful, update order status
            if (paymentStatus === 'paid') {
                await this.handleOrderStatusUpdate({
                    orderId,
                    status: 'processing',
                    notes: 'Payment received, order processing started'
                });
            }

            console.log(`Order ${orderId} payment updated to ${paymentStatus}`);
        } catch (error) {
            console.error('Failed to handle payment update:', error);
        }
    }

    /**
     * Handle shipping update
     */
    async handleShippingUpdate(data) {
        try {
            const { orderId, trackingNumber, carrier, status, location, estimatedDelivery } = data;

            if (!orderId || !trackingNumber) {
                throw new Error('Order ID and tracking number are required');
            }

            // Update order shipping info
            await Order.update(
                {
                    trackingNumber,
                    shippingCarrier: carrier,
                    shippingStatus: status
                },
                { where: { id: orderId } }
            );

            // Create shipping update record
            await ShippingUpdate.create({
                orderId,
                trackingNumber,
                carrier,
                status,
                location,
                estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
                updatedAt: new Date()
            });

            // Emit to order room
            this.io.to(`order_${orderId}`).emit('order:shipping_updated', {
                orderId,
                trackingNumber,
                carrier,
                status,
                location,
                estimatedDelivery,
                updatedAt: new Date()
            });

            // Update order status if shipped
            if (status === 'shipped') {
                await this.handleOrderStatusUpdate({
                    orderId,
                    status: 'shipped',
                    notes: `Package shipped via ${carrier}, tracking: ${trackingNumber}`
                });
            }

            console.log(`Order ${orderId} shipping updated: ${status} via ${carrier}`);
        } catch (error) {
            console.error('Failed to handle shipping update:', error);
        }
    }

    /**
     * Handle order cancellation
     */
    async handleOrderCancellation(data) {
        try {
            const { orderId, reason } = data;

            if (!orderId) {
                throw new Error('Order ID is required');
            }

            const order = await Order.findByPk(orderId);

            if (!order) {
                throw new Error('Order not found');
            }

            // Check permissions
            if (this.userRole !== 'admin' && order.userId !== this.userId) {
                throw new Error('Access denied to cancel this order');
            }

            // Cancel order
            await OrderService.cancelOrder(orderId, this.userId, reason);

            // Emit to order room
            this.io.to(`order_${orderId}`).emit('order:cancelled', {
                orderId,
                cancelledBy: this.userId,
                reason,
                cancelledAt: new Date(),
                refundStatus: 'pending'
            });

            // Emit to user's order room
            this.io.to(`orders_user_${order.userId}`).emit('order:user_cancelled', {
                orderId,
                orderNumber: order.orderNumber,
                reason,
                cancelledAt: new Date()
            });

            console.log(`Order ${orderId} cancelled by user ${this.userId}`);
        } catch (error) {
            console.error('Failed to handle order cancellation:', error);
        }
    }

    /**
     * Handle order delivery
     */
    async handleOrderDelivery(data) {
        try {
            const { orderId, deliveredAt, receivedBy, notes } = data;

            if (!orderId) {
                throw new Error('Order ID is required');
            }

            // Update order as delivered
            const order = await Order.findByPk(orderId);
            order.status = 'delivered';
            order.deliveredAt = deliveredAt ? new Date(deliveredAt) : new Date();
            await order.save();

            // Create delivery record
            await DeliveryRecord.create({
                orderId,
                deliveredAt: order.deliveredAt,
                receivedBy,
                notes,
                deliveryAgent: 'System'
            });

            // Emit to order room
            this.io.to(`order_${orderId}`).emit('order:delivered', {
                orderId,
                deliveredAt: order.deliveredAt,
                receivedBy,
                notes,
                timestamp: new Date()
            });

            // Update order status
            await this.handleOrderStatusUpdate({
                orderId,
                status: 'delivered',
                notes: `Order delivered${receivedBy ? ` to ${receivedBy}` : ''}`
            });

            console.log(`Order ${orderId} marked as delivered`);
        } catch (error) {
            console.error('Failed to handle order delivery:', error);
        }
    }

    /**
     * Get order with detailed status
     */
    async getOrderWithStatus(orderId) {
        try {
            const order = await Order.findByPk(orderId, {
                include: [
                    {
                        model: OrderItem,
                        as: 'items',
                        attributes: ['id', 'productName', 'quantity', 'price']
                    },
                    {
                        model: OrderStatusHistory,
                        as: 'statusHistory',
                        order: [['createdAt', 'DESC']],
                        limit: 1
                    },
                    {
                        model: ShippingUpdate,
                        as: 'shippingUpdates',
                        order: [['updatedAt', 'DESC']],
                        limit: 1
                    }
                ]
            });

            if (!order) {
                return null;
            }

            const statusInfo = {
                orderId: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                paymentStatus: order.paymentStatus,
                shippingStatus: order.shippingStatus,
                lastUpdated: order.updatedAt,
                items: order.items,
                lastStatus: order.statusHistory?.[0],
                shippingInfo: order.shippingUpdates?.[0],
                estimatedDelivery: await this.calculateEstimatedDelivery(order)
            };

            return statusInfo;
        } catch (error) {
            console.error('Failed to get order status:', error);
            return null;
        }
    }

    /**
     * Calculate estimated delivery time
     */
    async calculateEstimatedDelivery(order) {
        try {
            const createdDate = new Date(order.createdAt);
            let estimatedDays = 3; // Default estimation

            // Adjust based on shipping method
            switch (order.shippingMethod) {
                case 'express':
                    estimatedDays = 1;
                    break;
                case 'same_day':
                    estimatedDays = 0;
                    break;
                case 'economy':
                    estimatedDays = 5;
                    break;
            }

            // Adjust based on destination
            const address = await Address.findByPk(order.shippingAddressId);
            if (address) {
                if (address.city.toLowerCase().includes('jakarta')) {
                    estimatedDays = Math.max(1, estimatedDays - 1);
                } else if (address.province.toLowerCase().includes('jawa')) {
                    // No change
                } else {
                    estimatedDays += 2;
                }
            }

            // Calculate estimated date
            const estimatedDate = new Date(createdDate);
            estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

            return {
                estimatedDate,
                estimatedDays,
                isDelayed: new Date() > estimatedDate && order.status !== 'delivered'
            };
        } catch (error) {
            console.error('Failed to calculate estimated delivery:', error);
            return null;
        }
    }

    /**
     * Get tracking information
     */
    async getTrackingInfo(order) {
        try {
            if (!order.trackingNumber) {
                return null;
            }

            // In production, integrate with shipping carrier API
            // For now, return mock data
            return {
                trackingNumber: order.trackingNumber,
                carrier: order.shippingCarrier || 'JNE',
                status: order.shippingStatus || 'pending',
                lastUpdate: order.updatedAt,
                estimatedDelivery: await this.calculateEstimatedDelivery(order),
                history: [
                    {
                        status: 'package_received',
                        location: 'Jakarta Sorting Center',
                        timestamp: new Date(order.createdAt.getTime() + 2 * 60 * 60 * 1000)
                    },
                    {
                        status: 'in_transit',
                        location: 'In Transit to Destination',
                        timestamp: new Date(order.createdAt.getTime() + 6 * 60 * 60 * 1000)
                    }
                ]
            };
        } catch (error) {
            console.error('Failed to get tracking info:', error);
            return null;
        }
    }

    /**
     * Get detailed tracking information
     */
    async getDetailedTrackingInfo(order) {
        try {
            const updates = await ShippingUpdate.findAll({
                where: { orderId: order.id },
                order: [['updatedAt', 'ASC']]
            });

            return {
                orderId: order.id,
                trackingNumber: order.trackingNumber,
                carrier: order.shippingCarrier,
                currentStatus: order.shippingStatus,
                updates,
                lastUpdated: order.updatedAt
            };
        } catch (error) {
            console.error('Failed to get detailed tracking info:', error);
            return null;
        }
    }

    /**
     * Start live tracking updates
     */
    async startLiveTracking(order, trackingInfo) {
        try {
            // Simulate live tracking updates
            const trackingInterval = setInterval(async () => {
                // Get latest tracking info from carrier API
                const latestInfo = await this.getLatestTrackingInfo(order.trackingNumber);

                if (latestInfo && latestInfo.status !== trackingInfo.currentStatus) {
                    // Emit update
                    this.io.to(`order_${order.id}`).emit('order:tracking_update', {
                        orderId: order.id,
                        trackingInfo: latestInfo,
                        updatedAt: new Date()
                    });

                    // Update local tracking info
                    Object.assign(trackingInfo, latestInfo);
                }
            }, 300000); // Check every 5 minutes

            // Store interval reference for cleanup
            this.trackingIntervals = this.trackingIntervals || new Map();
            this.trackingIntervals.set(order.id, trackingInterval);
        } catch (error) {
            console.error('Failed to start live tracking:', error);
        }
    }

    /**
     * Get latest tracking info from carrier (placeholder)
     */
    async getLatestTrackingInfo(trackingNumber) {
        // Implement actual carrier API integration
        // For now, return mock data
        return {
            status: 'in_transit',
            location: 'Bandung Sorting Center',
            estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            lastUpdated: new Date()
        };
    }

    /**
     * Get other order updates (payment, shipping, etc.)
     */
    async getOtherOrderUpdates(orderId, since) {
        try {
            const updates = [];

            // Get payment updates
            const paymentUpdates = await Payment.findAll({
                where: {
                    orderId,
                    updatedAt: { $gt: new Date(since) }
                }
            });

            updates.push(...paymentUpdates.map(p => ({
                type: 'payment',
                data: p.toJSON(),
                timestamp: p.updatedAt
            })));

            // Get shipping updates
            const shippingUpdates = await ShippingUpdate.findAll({
                where: {
                    orderId,
                    updatedAt: { $gt: new Date(since) }
                }
            });

            updates.push(...shippingUpdates.map(s => ({
                type: 'shipping',
                data: s.toJSON(),
                timestamp: s.updatedAt
            })));

            return updates;
        } catch (error) {
            console.error('Failed to get other order updates:', error);
            return [];
        }
    }

    /**
     * Cleanup when socket disconnects
     */
    cleanup() {
        // Leave all rooms
        this.socket.leave(`orders_user_${this.userId}`);
        this.socket.leave('orders_admin');

        // Leave all subscribed order rooms
        this.subscribedOrders.forEach(orderId => {
            this.socket.leave(`order_${orderId}`);
        });

        // Clear tracking intervals
        if (this.trackingIntervals) {
            this.trackingIntervals.forEach(interval => clearInterval(interval));
            this.trackingIntervals.clear();
        }

        // Remove event listeners
        this.socket.removeAllListeners('order:subscribe');
        this.socket.removeAllListeners('order:unsubscribe');
        this.socket.removeAllListeners('order:get_status');
        this.socket.removeAllListeners('order:track');
        this.socket.removeAllListeners('order:get_updates');
        this.socket.removeAllListeners('order:subscribe_all');
        this.socket.removeAllListeners('order:status_update');
        this.socket.removeAllListeners('order:new');
        this.socket.removeAllListeners('order:payment_update');
        this.socket.removeAllListeners('order:shipping_update');
        this.socket.removeAllListeners('order:cancellation');
        this.socket.removeAllListeners('order:delivery');

        console.log(`📦 Order handlers cleaned up for user ${this.userId}`);
    }
}

export default OrderHandler;
