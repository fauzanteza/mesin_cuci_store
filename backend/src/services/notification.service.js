import { transporter, emailTemplates } from '../config/mailer.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

class NotificationService {
    /**
     * Send email notification
     */
    static async sendEmail(to, templateName, data) {
        try {
            const template = emailTemplates[templateName];
            if (!template) {
                throw new Error(`Template ${templateName} not found`);
            }

            const { subject, html } = typeof template === 'function'
                ? template(data)
                : template;

            const mailOptions = {
                from: `"Mesin Cuci Store" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                to,
                subject,
                html
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${to}: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error('Email sending error:', error);
            throw error;
        }
    }

    /**
     * Send SMS notification (placeholder for actual SMS service)
     */
    static async sendSMS(phone, message) {
        // Implement with actual SMS service like Twilio, MessageBird, etc.
        console.log(`[SMS] To: ${phone}, Message: ${message}`);
        return { success: true, message: 'SMS sent (simulated)' };
    }

    /**
     * Send in-app notification
     */
    static async sendInAppNotification(userId, title, message, type = 'info', link = null) {
        try {
            const notification = await Notification.create({
                userId,
                title,
                message,
                type,
                link,
                isRead: false
            });

            // Emit socket event for real-time notification
            // We need to import getIO. Since this is ESM, dynamic import or import from another file.
            // Assuming socket.js exports getIO.
            // const io = require('../socket/socket').getIO(); // CommonJS way
            // In ESM:
            try {
                const { getIO } = await import('../socket/socket.js');
                const io = getIO();
                if (io) {
                    io.to(`user_${userId}`).emit('new_notification', notification);
                }
            } catch (err) {
                console.warn('Socket not initialized or failed to import:', err);
            }

            return notification;
        } catch (error) {
            console.error('In-app notification error:', error);
            throw error;
        }
    }

    /**
     * Notify admin about new order
     */
    static async notifyAdminNewOrder(order) {
        try {
            // Get admin users
            const admins = await User.findAll({
                where: { role: 'admin' },
                attributes: ['id', 'email', 'phone']
            });

            // Send email to all admins
            for (const admin of admins) {
                await this.sendEmail(
                    admin.email,
                    'orderConfirmation',
                    order
                );

                await this.sendInAppNotification(
                    admin.id,
                    'Pesanan Baru',
                    `Pesanan baru #${order.orderNumber} dari ${order.userName}`,
                    'order',
                    `/admin/orders/${order.id}`
                );
            }

            console.log(`Admin notified about new order #${order.orderNumber}`);
        } catch (error) {
            console.error('Admin notification error:', error);
        }
    }

    /**
     * Notify user about order status update
     */
    static async notifyUserOrderStatus(order, user) {
        try {
            const statusMessages = {
                paid: 'Pembayaran berhasil diterima',
                processing: 'Pesanan sedang diproses',
                shipped: 'Pesanan telah dikirim',
                delivered: 'Pesanan telah sampai',
                cancelled: 'Pesanan dibatalkan'
            };

            const message = statusMessages[order.status] || `Status pesanan diubah menjadi ${order.status}`;

            // Send email
            await this.sendEmail(
                user.email,
                'orderConfirmation',
                { ...order, statusUpdate: true, updateMessage: message }
            );

            // Send in-app notification
            await this.sendInAppNotification(
                user.id,
                'Update Status Pesanan',
                message,
                'order',
                `/user/orders/${order.id}`
            );

            // Send SMS if phone exists
            if (user.phone) {
                await this.sendSMS(
                    user.phone,
                    `Pesanan #${order.orderNumber}: ${message}. Cek detail: ${process.env.FRONTEND_URL}/user/orders/${order.id}`
                );
            }

            console.log(`User ${user.id} notified about order #${order.orderNumber} status: ${order.status}`);
        } catch (error) {
            console.error('User notification error:', error);
        }
    }

    /**
     * Send low stock alert
     */
    static async sendLowStockAlert(product) {
        try {
            const admins = await User.findAll({
                where: { role: 'admin' },
                attributes: ['id', 'email']
            });

            for (const admin of admins) {
                await this.sendInAppNotification(
                    admin.id,
                    'Stok Menipis',
                    `Produk ${product.name} sisa ${product.stock} unit`,
                    'warning',
                    `/admin/products/${product.id}`
                );
            }
        } catch (error) {
            console.error('Low stock alert error:', error);
        }
    }
}

export default NotificationService;
