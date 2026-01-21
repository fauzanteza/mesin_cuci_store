import Notification from '../../models/Notification.js';
import User from '../../models/User.js';
import NotificationService from '../../services/notification.service.js';

class NotificationHandler {
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;
        this.userId = null;

        // Bind methods
        this.setupHandlers = this.setupHandlers.bind(this);
        this.handleSubscribe = this.handleSubscribe.bind(this);
        this.handleUnsubscribe = this.handleUnsubscribe.bind(this);
        this.handleMarkAsRead = this.handleMarkAsRead.bind(this);
        this.handleMarkAllAsRead = this.handleMarkAllAsRead.bind(this);
        this.handleGetUnreadCount = this.handleGetUnreadCount.bind(this);
        this.handleGetNotifications = this.handleGetNotifications.bind(this);
        this.handleDeleteNotification = this.handleDeleteNotification.bind(this);
        this.handleClearAll = this.handleClearAll.bind(this);
    }

    /**
     * Setup all notification handlers
     */
    setupHandlers(userId) {
        this.userId = userId;

        // Join user's notification room
        this.socket.join(`user_${userId}`);
        this.socket.join(`admin_notifications`); // Admin also joins admin room

        // Setup event handlers
        this.socket.on('notification:subscribe', this.handleSubscribe);
        this.socket.on('notification:unsubscribe', this.handleUnsubscribe);
        this.socket.on('notification:mark_as_read', this.handleMarkAsRead);
        this.socket.on('notification:mark_all_read', this.handleMarkAllAsRead);
        this.socket.on('notification:get_unread_count', this.handleGetUnreadCount);
        this.socket.on('notification:get_list', this.handleGetNotifications);
        this.socket.on('notification:delete', this.handleDeleteNotification);
        this.socket.on('notification:clear_all', this.handleClearAll);

        // Send welcome notification
        this.sendWelcomeNotification();

        console.log(`🔔 Notification handlers setup for user ${userId}`);
    }

    /**
     * Handle subscription to specific notification types
     */
    async handleSubscribe(data) {
        try {
            const { types = [] } = data;

            // Join rooms for each notification type
            types.forEach(type => {
                this.socket.join(`notification_type_${type}`);
            });

            this.socket.emit('notification:subscribed', {
                success: true,
                message: `Subscribed to notification types: ${types.join(', ')}`,
                subscribedTypes: types
            });
        } catch (error) {
            this.socket.emit('notification:error', {
                error: 'Failed to subscribe to notifications',
                details: error.message
            });
        }
    }

    /**
     * Handle unsubscription from notification types
     */
    async handleUnsubscribe(data) {
        try {
            const { types = [] } = data;

            // Leave rooms for each notification type
            types.forEach(type => {
                this.socket.leave(`notification_type_${type}`);
            });

            this.socket.emit('notification:unsubscribed', {
                success: true,
                message: `Unsubscribed from notification types: ${types.join(', ')}`,
                unsubscribedTypes: types
            });
        } catch (error) {
            this.socket.emit('notification:error', {
                error: 'Failed to unsubscribe from notifications',
                details: error.message
            });
        }
    }

    /**
     * Mark notification as read
     */
    async handleMarkAsRead(data) {
        try {
            const { notificationId } = data;

            if (!notificationId) {
                throw new Error('Notification ID is required');
            }

            const notification = await Notification.findOne({
                where: { id: notificationId, userId: this.userId }
            });

            if (!notification) {
                throw new Error('Notification not found');
            }

            notification.isRead = true;
            notification.readAt = new Date();
            await notification.save();

            // Emit update to the user
            this.socket.emit('notification:marked_as_read', {
                success: true,
                notificationId,
                readAt: notification.readAt
            });

            // Update unread count
            await this.emitUnreadCount();
        } catch (error) {
            this.socket.emit('notification:error', {
                error: 'Failed to mark notification as read',
                details: error.message
            });
        }
    }

    /**
     * Mark all notifications as read
     */
    async handleMarkAllAsRead() {
        try {
            await Notification.update(
                { isRead: true, readAt: new Date() },
                { where: { userId: this.userId, isRead: false } }
            );

            this.socket.emit('notification:all_marked_read', {
                success: true,
                timestamp: new Date()
            });

            // Update unread count
            await this.emitUnreadCount();
        } catch (error) {
            this.socket.emit('notification:error', {
                error: 'Failed to mark all notifications as read',
                details: error.message
            });
        }
    }

    /**
     * Get unread notification count
     */
    async handleGetUnreadCount() {
        try {
            const count = await Notification.count({
                where: { userId: this.userId, isRead: false }
            });

            this.socket.emit('notification:unread_count', {
                count,
                timestamp: new Date()
            });
        } catch (error) {
            this.socket.emit('notification:error', {
                error: 'Failed to get unread count',
                details: error.message
            });
        }
    }

    /**
     * Get list of notifications
     */
    async handleGetNotifications(data) {
        try {
            const { limit = 20, offset = 0, unreadOnly = false } = data;

            const where = { userId: this.userId };
            if (unreadOnly) {
                where.isRead = false;
            }

            const notifications = await Notification.findAll({
                where,
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            const total = await Notification.count({ where });

            this.socket.emit('notification:list', {
                notifications,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total,
                    hasMore: offset + notifications.length < total
                }
            });
        } catch (error) {
            this.socket.emit('notification:error', {
                error: 'Failed to get notifications',
                details: error.message
            });
        }
    }

    /**
     * Delete a notification
     */
    async handleDeleteNotification(data) {
        try {
            const { notificationId } = data;

            if (!notificationId) {
                throw new Error('Notification ID is required');
            }

            const notification = await Notification.findOne({
                where: { id: notificationId, userId: this.userId }
            });

            if (!notification) {
                throw new Error('Notification not found');
            }

            await notification.destroy();

            this.socket.emit('notification:deleted', {
                success: true,
                notificationId
            });

            // Update unread count
            await this.emitUnreadCount();
        } catch (error) {
            this.socket.emit('notification:error', {
                error: 'Failed to delete notification',
                details: error.message
            });
        }
    }

    /**
     * Clear all notifications
     */
    async handleClearAll() {
        try {
            const count = await Notification.destroy({
                where: { userId: this.userId }
            });

            this.socket.emit('notification:cleared_all', {
                success: true,
                count,
                timestamp: new Date()
            });

            // Update unread count
            await this.emitUnreadCount();
        } catch (error) {
            this.socket.emit('notification:error', {
                error: 'Failed to clear all notifications',
                details: error.message
            });
        }
    }

    /**
     * Send a notification to user
     */
    async sendNotification(notificationData) {
        try {
            const notification = await Notification.create({
                ...notificationData,
                userId: this.userId
            });

            // Emit to user's room
            this.io.to(`user_${this.userId}`).emit('notification:new', notification);

            // Also emit to notification type room if specified
            if (notificationData.type) {
                this.io.to(`notification_type_${notificationData.type}`).emit('notification:new', notification);
            }

            // Update unread count
            await this.emitUnreadCount();

            return notification;
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    }

    /**
     * Send notification to admin users
     */
    async sendAdminNotification(notificationData) {
        try {
            // Get all admin users
            const admins = await User.findAll({
                where: { role: 'admin' },
                attributes: ['id']
            });

            // Create notification for each admin
            const notifications = await Promise.all(
                admins.map(admin =>
                    Notification.create({
                        ...notificationData,
                        userId: admin.id
                    })
                )
            );

            // Emit to admin room
            this.io.to('admin_notifications').emit('notification:admin', {
                ...notificationData,
                timestamp: new Date()
            });

            // Also send to individual admin rooms
            admins.forEach(admin => {
                this.io.to(`user_${admin.id}`).emit('notification:new', notificationData);
            });

            return notifications;
        } catch (error) {
            console.error('Failed to send admin notification:', error);
        }
    }

    /**
     * Send welcome notification
     */
    async sendWelcomeNotification() {
        try {
            const user = await User.findByPk(this.userId);

            if (user) {
                await this.sendNotification({
                    title: 'Selamat Datang!',
                    message: `Halo ${user.name}, selamat bergabung di Mesin Cuci Store!`,
                    type: 'welcome',
                    link: '/user/dashboard',
                    priority: 'low'
                });
            }
        } catch (error) {
            console.error('Failed to send welcome notification:', error);
        }
    }

    /**
     * Send order status notification
     */
    async sendOrderNotification(order, status) {
        try {
            const statusMessages = {
                paid: 'Pembayaran berhasil diterima',
                processing: 'Pesanan sedang diproses',
                shipped: 'Pesanan telah dikirim',
                delivered: 'Pesanan telah sampai',
                cancelled: 'Pesanan dibatalkan'
            };

            const message = statusMessages[status] || `Status pesanan diubah menjadi ${status}`;

            await this.sendNotification({
                title: 'Update Status Pesanan',
                message: `Pesanan #${order.orderNumber}: ${message}`,
                type: 'order',
                link: `/user/orders/${order.id}`,
                priority: 'high',
                metadata: {
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    status: status
                }
            });
        } catch (error) {
            console.error('Failed to send order notification:', error);
        }
    }

    /**
     * Send low stock alert to admin
     */
    async sendLowStockAlert(product, currentStock) {
        try {
            await this.sendAdminNotification({
                title: 'Stok Menipis',
                message: `Produk ${product.name} sisa ${currentStock} unit`,
                type: 'inventory',
                link: `/admin/products/${product.id}`,
                priority: 'medium',
                metadata: {
                    productId: product.id,
                    productName: product.name,
                    currentStock,
                    lowStockThreshold: product.lowStockThreshold
                }
            });
        } catch (error) {
            console.error('Failed to send low stock alert:', error);
        }
    }

    /**
     * Send new order notification to admin
     */
    async sendNewOrderAlert(order, user) {
        try {
            await this.sendAdminNotification({
                title: 'Pesanan Baru',
                message: `Pesanan baru #${order.orderNumber} dari ${user.name}`,
                type: 'order',
                link: `/admin/orders/${order.id}`,
                priority: 'high',
                metadata: {
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    customerName: user.name,
                    customerEmail: user.email,
                    totalAmount: order.totalAmount
                }
            });
        } catch (error) {
            console.error('Failed to send new order alert:', error);
        }
    }

    /**
     * Send payment verification notification to admin
     */
    async sendPaymentVerificationAlert(order) {
        try {
            await this.sendAdminNotification({
                title: 'Verifikasi Pembayaran',
                message: `Pembayaran untuk pesanan #${order.orderNumber} perlu diverifikasi`,
                type: 'payment',
                link: `/admin/orders/${order.id}`,
                priority: 'high',
                metadata: {
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    paymentMethod: order.paymentMethod,
                    totalAmount: order.totalAmount
                }
            });
        } catch (error) {
            console.error('Failed to send payment verification alert:', error);
        }
    }

    /**
     * Emit unread count to user
     */
    async emitUnreadCount() {
        try {
            const count = await Notification.count({
                where: { userId: this.userId, isRead: false }
            });

            this.io.to(`user_${this.userId}`).emit('notification:unread_count_update', {
                count,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Failed to emit unread count:', error);
        }
    }

    /**
     * Cleanup when socket disconnects
     */
    cleanup() {
        // Leave all rooms
        this.socket.leave(`user_${this.userId}`);
        this.socket.leave('admin_notifications');

        // Remove event listeners
        this.socket.removeAllListeners('notification:subscribe');
        this.socket.removeAllListeners('notification:unsubscribe');
        this.socket.removeAllListeners('notification:mark_as_read');
        this.socket.removeAllListeners('notification:mark_all_read');
        this.socket.removeAllListeners('notification:get_unread_count');
        this.socket.removeAllListeners('notification:get_list');
        this.socket.removeAllListeners('notification:delete');
        this.socket.removeAllListeners('notification:clear_all');

        console.log(`🔔 Notification handlers cleaned up for user ${this.userId}`);
    }
}

export default NotificationHandler;
