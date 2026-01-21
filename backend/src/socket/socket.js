import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import NotificationHandler from './handlers/notification.handler.js';
import ChatHandler from './handlers/chat.handler.js';
import OrderHandler from './handlers/order.handler.js';
import User from '../models/User.js';

let io;

/**
 * Initialize Socket.IO server
 */
export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

            if (!token) {
                throw new Error('Authentication token required');
            }

            // Remove 'Bearer ' prefix if present
            const cleanToken = token.replace('Bearer ', '');

            // Verify token
            const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

            // Get user from database
            const user = await User.findByPk(decoded.id);

            if (!user || !user.is_active) { // Verified is_active in User model
                throw new Error('User not found or inactive');
            }

            // Attach user data to socket
            socket.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            };

            next();
        } catch (error) {
            console.error('Socket authentication error:', error.message);
            next(new Error('Authentication failed'));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        console.log(`🔌 New socket connection: ${socket.id} (User: ${socket.user.id})`);

        // Initialize handlers
        const notificationHandler = new NotificationHandler(io, socket);
        const chatHandler = new ChatHandler(io, socket);
        const orderHandler = new OrderHandler(io, socket);

        // Setup handlers
        notificationHandler.setupHandlers(socket.user.id);
        chatHandler.setupHandlers(socket.user.id, socket.user.role);
        orderHandler.setupHandlers(socket.user.id, socket.user.role);

        // Store handlers in socket for cleanup
        socket.handlers = {
            notification: notificationHandler,
            chat: chatHandler,
            order: orderHandler
        };

        // Send connection confirmation
        socket.emit('connection:established', {
            success: true,
            socketId: socket.id,
            userId: socket.user.id,
            timestamp: new Date()
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            console.log(`🔌 Socket disconnected: ${socket.id} (Reason: ${reason})`);

            // Cleanup all handlers
            if (socket.handlers) {
                socket.handlers.notification.cleanup();
                socket.handlers.chat.cleanup();
                socket.handlers.order.cleanup();
            }
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error(`Socket error for ${socket.id}:`, error);
        });

        // Ping-pong for connection health
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: new Date() });
        });
    });

    // Global error handler
    io.engine.on('connection_error', (err) => {
        console.error('Socket.IO connection error:', err);
    });

    console.log('🚀 Socket.IO server initialized');
    return io;
};

/**
 * Get Socket.IO instance
 */
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

/**
 * Send notification to specific user
 */
export const sendNotificationToUser = (userId, notification) => {
    if (!io) return;

    io.to(`user_${userId}`).emit('notification:new', notification);
};

/**
 * Send notification to all admins
 */
export const sendNotificationToAdmins = (notification) => {
    if (!io) return;

    io.to('admin_notifications').emit('notification:admin', notification);
};

/**
 * Send order update to all subscribed users
 */
export const sendOrderUpdate = (orderId, update) => {
    if (!io) return;

    io.to(`order_${orderId}`).emit('order:update', update);
};

/**
 * Send chat message to room
 */
export const sendChatMessage = (roomId, message) => {
    if (!io) return;

    io.to(`chat_room_${roomId}`).emit('chat:new_message', message);
};

/**
 * Broadcast system announcement
 */
export const broadcastSystemAnnouncement = (announcement) => {
    if (!io) return;

    io.emit('system:announcement', {
        ...announcement,
        broadcastAt: new Date()
    });
};

/**
 * Get connected users count
 */
export const getConnectedUsersCount = () => {
    if (!io) return 0;

    return io.engine.clientsCount;
};

/**
 * Get user socket IDs
 */
export const getUserSocketIds = (userId) => {
    if (!io) return [];

    const adapter = io.of('/').adapter;
    const room = adapter.rooms.get(`user_${userId}`);

    return room ? Array.from(room) : [];
};

/**
 * Check if user is online
 */
export const isUserOnline = (userId) => {
    return getUserSocketIds(userId).length > 0;
};

export default {
    initializeSocket,
    getIO,
    sendNotificationToUser,
    sendNotificationToAdmins,
    sendOrderUpdate,
    sendChatMessage,
    broadcastSystemAnnouncement,
    getConnectedUsersCount,
    getUserSocketIds,
    isUserOnline
};
