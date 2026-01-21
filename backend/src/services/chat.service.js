import { Op } from 'sequelize';
import ChatRoom from '../models/ChatRoom.js';
import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import sequelize from '../config/database.js';

class ChatService {
    /**
     * Get user's chat rooms
     */
    static async getUserRooms(userId, userRole, filters = {}) {
        try {
            const { type, status, limit = 20, offset = 0 } = filters;

            const where = {};

            if (type) {
                where.type = type;
            }

            if (status) {
                where.status = status;
            }

            let rooms;

            if (userRole === 'admin') {
                // Admin can see all active rooms
                rooms = await ChatRoom.findAndCountAll({
                    where: {
                        ...where,
                        status: { [Op.ne]: 'archived' }
                    },
                    include: [
                        {
                            model: User,
                            as: 'participants',
                            attributes: ['id', 'name', 'avatar', 'role']
                        },
                        {
                            model: ChatMessage,
                            as: 'messages',
                            limit: 1,
                            order: [['createdAt', 'DESC']],
                            include: [{
                                model: User,
                                attributes: ['id', 'name']
                            }]
                        }
                    ],
                    order: [['lastMessageAt', 'DESC']],
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    distinct: true
                });
            } else {
                // Regular users see only their rooms
                rooms = await ChatRoom.findAndCountAll({
                    where: {
                        ...where,
                        status: { [Op.ne]: 'archived' }
                    },
                    include: [
                        {
                            model: User,
                            as: 'participants',
                            where: { id: userId },
                            attributes: [],
                            required: true
                        },
                        {
                            model: User,
                            as: 'participants',
                            attributes: ['id', 'name', 'avatar', 'role']
                        },
                        {
                            model: ChatMessage,
                            as: 'messages',
                            limit: 1,
                            order: [['createdAt', 'DESC']],
                            include: [{
                                model: User,
                                attributes: ['id', 'name']
                            }]
                        }
                    ],
                    order: [['lastMessageAt', 'DESC']],
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    distinct: true
                });
            }

            // Calculate unread counts for each room
            const roomsWithUnread = await Promise.all(
                rooms.rows.map(async (room) => {
                    const unreadCount = await ChatMessage.count({
                        where: {
                            roomId: room.id,
                            userId: { [Op.ne]: userId },
                            status: 'delivered'
                        }
                    });

                    return {
                        ...room.toJSON(),
                        unreadCount
                    };
                })
            );

            return {
                rooms: roomsWithUnread,
                pagination: {
                    page: Math.floor(offset / limit) + 1,
                    limit: parseInt(limit),
                    total: rooms.count,
                    pages: Math.ceil(rooms.count / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get unread message count for user
     */
    static async getUnreadCount(userId) {
        try {
            // Get rooms where user is a participant
            const rooms = await ChatRoom.findAll({
                include: [{
                    model: User,
                    as: 'participants',
                    where: { id: userId },
                    attributes: [],
                    required: true
                }],
                attributes: ['id']
            });

            const roomIds = rooms.map(room => room.id);

            if (roomIds.length === 0) {
                return 0;
            }

            // Count unread messages in all rooms
            const count = await ChatMessage.count({
                where: {
                    roomId: roomIds,
                    userId: { [Op.ne]: userId },
                    status: 'delivered'
                }
            });

            return count;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user's last seen in room
     */
    static async updateUserLastSeen(roomId, userId) {
        try {
            // This would typically update a separate table tracking user's last seen
            // For now, we'll mark messages as read
            await ChatMessage.update(
                { status: 'read', readAt: new Date() },
                {
                    where: {
                        roomId,
                        userId: { [Op.ne]: userId },
                        status: 'delivered'
                    }
                }
            );

            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create support chat room
     */
    static async createSupportRoom(userId, adminId = null) {
        try {
            const user = await User.findByPk(userId);

            if (!user) {
                throw new AppError('User not found', 404);
            }

            // Find available admin if not specified
            let targetAdminId = adminId;
            if (!targetAdminId) {
                const admin = await User.findOne({
                    where: {
                        role: 'admin',
                        isActive: true
                    },
                    order: [
                        // Prefer admins with fewer active chats
                        sequelize.literal('(SELECT COUNT(*) FROM chat_room_participants crp JOIN chat_rooms cr ON crp.room_id = cr.id WHERE crp.user_id = users.id AND cr.status = "active")')
                    ],
                    attributes: ['id']
                });

                if (!admin) {
                    throw new AppError('No admin available', 404);
                }

                targetAdminId = admin.id;
            }

            // Check if support room already exists
            const existingRoom = await ChatRoom.findOne({
                where: {
                    type: 'support',
                    status: 'active',
                    '$participants.id$': { [Op.in]: [userId, targetAdminId] }
                },
                include: [{
                    model: User,
                    as: 'participants',
                    attributes: ['id']
                }]
            });

            if (existingRoom) {
                return existingRoom;
            }

            // Create new support room
            const room = await ChatRoom.create({
                title: `Support - ${user.name}`,
                type: 'support',
                createdBy: userId,
                metadata: {
                    initiatedBy: 'user',
                    customerId: userId,
                    adminId: targetAdminId
                }
            });

            // Add participants
            await room.addParticipants([userId, targetAdminId]);

            // Get populated room
            const populatedRoom = await ChatRoom.findByPk(room.id, {
                include: [{
                    model: User,
                    as: 'participants',
                    attributes: ['id', 'name', 'avatar', 'role']
                }]
            });

            // Send welcome message
            const welcomeMessage = await ChatMessage.create({
                roomId: room.id,
                userId: targetAdminId,
                content: 'Halo! Selamat datang di layanan dukungan Mesin Cuci Store. Ada yang bisa saya bantu?',
                type: 'text',
                metadata: { isSystemMessage: true }
            });

            return {
                room: populatedRoom,
                welcomeMessage
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Transfer chat to another admin
     */
    static async transferChat(roomId, fromAdminId, toAdminId) {
        try {
            const room = await ChatRoom.findByPk(roomId, {
                include: [{
                    model: User,
                    as: 'participants',
                    attributes: ['id', 'role']
                }]
            });

            if (!room) {
                throw new AppError('Chat room not found', 404);
            }

            if (room.type !== 'support') {
                throw new AppError('Only support chats can be transferred', 400);
            }

            // Remove old admin
            await room.removeParticipant(fromAdminId);

            // Add new admin
            await room.addParticipant(toAdminId);

            // Update metadata
            room.metadata = {
                ...room.metadata,
                transferredAt: new Date(),
                transferredFrom: fromAdminId,
                transferredTo: toAdminId
            };
            await room.save();

            // Add system message
            const systemMessage = await ChatMessage.create({
                roomId,
                userId: toAdminId,
                content: `Chat telah ditransfer dari Admin sebelumnya ke Admin sekarang.`,
                type: 'system',
                metadata: {
                    transfer: {
                        from: fromAdminId,
                        to: toAdminId,
                        at: new Date()
                    }
                }
            });

            return {
                room,
                systemMessage
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Close chat room
     */
    static async closeChatRoom(roomId, closedBy, reason = '') {
        try {
            const room = await ChatRoom.findByPk(roomId);

            if (!room) {
                throw new AppError('Chat room not found', 404);
            }

            if (room.status === 'closed') {
                throw new AppError('Chat room already closed', 400);
            }

            room.status = 'closed';
            room.closedBy = closedBy;
            room.closedAt = new Date();
            room.metadata = {
                ...room.metadata,
                closedReason: reason
            };
            await room.save();

            // Add closure message
            const closureMessage = await ChatMessage.create({
                roomId,
                userId: closedBy,
                content: reason || 'Chat telah ditutup.',
                type: 'system',
                metadata: {
                    closure: {
                        by: closedBy,
                        reason,
                        at: new Date()
                    }
                }
            });

            return {
                room,
                closureMessage
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get chat statistics
     */
    static async getChatStats(timeframe = 'today') {
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
                default:
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            }

            const stats = await Promise.all([
                // Total messages
                ChatMessage.count({
                    where: {
                        createdAt: { [Op.gte]: startDate }
                    }
                }),

                // Active rooms
                ChatRoom.count({
                    where: {
                        status: 'active',
                        updatedAt: { [Op.gte]: startDate }
                    }
                }),

                // New support rooms
                ChatRoom.count({
                    where: {
                        type: 'support',
                        createdAt: { [Op.gte]: startDate }
                    }
                }),

                // Average response time (simplified)
                this.calculateAverageResponseTime(startDate)
            ]);

            return {
                timeframe,
                totalMessages: stats[0],
                activeRooms: stats[1],
                newSupportRooms: stats[2],
                averageResponseTime: stats[3],
                period: { start: startDate, end: now }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Calculate average response time
     */
    static async calculateAverageResponseTime(since) {
        try {
            // This is a simplified calculation
            // In production, you'd track response times more accurately

            const supportRooms = await ChatRoom.findAll({
                where: {
                    type: 'support',
                    createdAt: { [Op.gte]: since }
                },
                include: [{
                    model: ChatMessage,
                    as: 'messages',
                    order: [['createdAt', 'ASC']],
                    limit: 2
                }]
            });

            let totalResponseTime = 0;
            let responseCount = 0;

            supportRooms.forEach(room => {
                if (room.messages.length >= 2) {
                    const firstMessage = room.messages[0]; // User message
                    const secondMessage = room.messages[1]; // Admin response

                    const responseTime = secondMessage.createdAt - firstMessage.createdAt;
                    totalResponseTime += responseTime;
                    responseCount++;
                }
            });

            return responseCount > 0
                ? Math.round(totalResponseTime / responseCount / 1000 / 60) // Convert to minutes
                : 0;
        } catch (error) {
            console.error('Failed to calculate response time:', error);
            return 0;
        }
    }

    /**
     * Search chat messages
     */
    static async searchMessages(userId, query, filters = {}) {
        try {
            const { roomId, limit = 20, offset = 0 } = filters;

            const where = {
                content: { [Op.like]: `%${query}%` }
            };

            if (roomId) {
                where.roomId = roomId;
            }

            // Get rooms where user is a participant
            const userRooms = await ChatRoom.findAll({
                include: [{
                    model: User,
                    as: 'participants',
                    where: { id: userId },
                    attributes: [],
                    required: true
                }],
                attributes: ['id']
            });

            const userRoomIds = userRooms.map(room => room.id);
            where.roomId = userRoomIds;

            const messages = await ChatMessage.findAndCountAll({
                where,
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'avatar']
                    },
                    {
                        model: ChatRoom,
                        attributes: ['id', 'title']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                messages: messages.rows,
                pagination: {
                    page: Math.floor(offset / limit) + 1,
                    limit: parseInt(limit),
                    total: messages.count,
                    pages: Math.ceil(messages.count / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }
}

export default ChatService;
