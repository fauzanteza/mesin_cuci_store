import sequelize from '../../config/database.js';
import ChatMessage from '../../models/ChatMessage.js';
import ChatRoom from '../../models/ChatRoom.js';
import User from '../../models/User.js';
import ChatService from '../../services/chat.service.js';
import { Op } from 'sequelize';

class ChatHandler {
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;
        this.userId = null;
        this.userRole = null;
        this.currentRoom = null;

        // Bind methods
        this.setupHandlers = this.setupHandlers.bind(this);
        this.handleJoinRoom = this.handleJoinRoom.bind(this);
        this.handleLeaveRoom = this.handleLeaveRoom.bind(this);
        this.handleSendMessage = this.handleSendMessage.bind(this);
        this.handleTyping = this.handleTyping.bind(this);
        this.handleStopTyping = this.handleStopTyping.bind(this);
        this.handleReadMessages = this.handleReadMessages.bind(this);
        this.handleGetMessages = this.handleGetMessages.bind(this);
        this.handleGetRooms = this.handleGetRooms.bind(this);
        this.handleCreateRoom = this.handleCreateRoom.bind(this);
        this.handleCloseRoom = this.handleCloseRoom.bind(this);
        this.handleTransferToAdmin = this.handleTransferToAdmin.bind(this);
        this.handleGetUnreadCount = this.handleGetUnreadCount.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
    }

    setupHandlers(userId, userRole) {
        this.userId = userId;
        this.userRole = userRole;

        this.socket.join(`chat_user_${userId}`);

        if (userRole === 'admin') {
            this.socket.join('chat_admin_support');
        }

        this.socket.on('chat:join_room', this.handleJoinRoom);
        this.socket.on('chat:leave_room', this.handleLeaveRoom);
        this.socket.on('chat:send_message', this.handleSendMessage);
        this.socket.on('chat:typing', this.handleTyping);
        this.socket.on('chat:stop_typing', this.handleStopTyping);
        this.socket.on('chat:read_messages', this.handleReadMessages);
        this.socket.on('chat:get_messages', this.handleGetMessages);
        this.socket.on('chat:get_rooms', this.handleGetRooms);
        this.socket.on('chat:create_room', this.handleCreateRoom);
        this.socket.on('chat:close_room', this.handleCloseRoom);
        this.socket.on('chat:transfer_to_admin', this.handleTransferToAdmin);
        this.socket.on('chat:get_unread_count', this.handleGetUnreadCount);
        this.socket.on('chat:upload_file', this.handleUploadFile);

        this.sendWelcomeMessage();

        console.log(`💬 Chat handlers setup for user ${userId} (${userRole})`);
    }

    async handleJoinRoom(data) {
        try {
            const { roomId } = data;

            if (!roomId) throw new Error('Room ID is required');

            const room = await ChatRoom.findByPk(roomId, {
                include: [{
                    model: User,
                    as: 'participants',
                    attributes: ['id']
                }]
            });

            if (!room) throw new Error('Room not found');

            const isParticipant = room.participants.some(p => p.id === this.userId);
            const isAdmin = this.userRole === 'admin';

            if (!isParticipant && !isAdmin) throw new Error('Access denied to this room');

            if (this.currentRoom) {
                this.socket.leave(`chat_room_${this.currentRoom}`);
            }

            this.currentRoom = roomId;
            this.socket.join(`chat_room_${roomId}`);

            await ChatService.updateUserLastSeen(roomId, this.userId);

            this.socket.emit('chat:room_joined', {
                success: true,
                roomId,
                room: room.toJSON()
            });

            this.socket.to(`chat_room_${roomId}`).emit('chat:user_joined', {
                userId: this.userId,
                roomId,
                timestamp: new Date()
            });

            await this.markMessagesAsRead(roomId);

            console.log(`User ${this.userId} joined room ${roomId}`);
        } catch (error) {
            this.socket.emit('chat:error', {
                error: 'Failed to join room',
                details: error.message
            });
        }
    }

    async handleLeaveRoom(data) {
        try {
            const { roomId } = data;

            if (!roomId) throw new Error('Room ID is required');

            this.socket.leave(`chat_room_${roomId}`);

            if (this.currentRoom === roomId) {
                this.currentRoom = null;
            }

            await ChatService.updateUserLastSeen(roomId, this.userId);

            this.socket.emit('chat:room_left', { success: true, roomId });

            this.socket.to(`chat_room_${roomId}`).emit('chat:user_left', {
                userId: this.userId,
                roomId,
                timestamp: new Date()
            });

            console.log(`User ${this.userId} left room ${roomId}`);
        } catch (error) {
            this.socket.emit('chat:error', {
                error: 'Failed to leave room',
                details: error.message
            });
        }
    }

    async handleSendMessage(data) {
        try {
            const { roomId, content, type = 'text', metadata = {} } = data;

            if (!roomId || !content) throw new Error('Room ID and content are required');

            const room = await ChatRoom.findByPk(roomId, {
                include: [{
                    model: User,
                    as: 'participants',
                    attributes: ['id']
                }]
            });

            if (!room) throw new Error('Room not found');

            const isParticipant = room.participants.some(p => p.id === this.userId);
            const isAdmin = this.userRole === 'admin';

            if (!isParticipant && !isAdmin) throw new Error('Access denied to this room');

            const message = await ChatMessage.create({
                roomId,
                userId: this.userId,
                content,
                type,
                metadata,
                status: 'delivered'
            });

            const populatedMessage = await ChatMessage.findByPk(message.id, {
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'avatar', 'role']
                }]
            });

            this.io.to(`chat_room_${roomId}`).emit('chat:new_message', {
                message: populatedMessage.toJSON(),
                roomId
            });

            room.lastMessage = content;
            room.lastMessageAt = new Date();
            room.unreadCount = (room.unreadCount || 0) + 1;
            await room.save();

            await this.updateUnreadCounts(roomId, this.userId);

            await this.notifyOfflineParticipants(room, populatedMessage);

            console.log(`Message sent to room ${roomId} by user ${this.userId}`);
        } catch (error) {
            this.socket.emit('chat:error', {
                error: 'Failed to send message',
                details: error.message
            });
        }
    }

    async handleTyping(data) {
        try {
            const { roomId } = data;
            if (!roomId) return;
            this.socket.to(`chat_room_${roomId}`).emit('chat:user_typing', {
                userId: this.userId,
                roomId
            });
        } catch (error) {
            console.error('Failed to handle typing:', error);
        }
    }

    async handleStopTyping(data) {
        try {
            const { roomId } = data;
            if (!roomId) return;
            this.socket.to(`chat_room_${roomId}`).emit('chat:user_stopped_typing', {
                userId: this.userId,
                roomId
            });
        } catch (error) {
            console.error('Failed to handle stop typing:', error);
        }
    }

    async handleReadMessages(data) {
        try {
            const { roomId, messageIds = [] } = data;
            if (!roomId) throw new Error('Room ID is required');

            await ChatMessage.update(
                { status: 'read', readAt: new Date() },
                {
                    where: {
                        id: messageIds.length > 0 ? messageIds : { [Op.in]: [] },
                        roomId,
                        userId: { [Op.ne]: this.userId },
                        status: 'delivered'
                    }
                }
            );

            const room = await ChatRoom.findByPk(roomId);
            if (room) {
                room.unreadCount = Math.max(0, (room.unreadCount || 0) - messageIds.length);
                await room.save();
            }

            this.socket.emit('chat:messages_read', {
                success: true,
                roomId,
                messageIds,
                timestamp: new Date()
            });

            if (messageIds.length > 0) {
                const messages = await ChatMessage.findAll({
                    where: { id: messageIds },
                    attributes: ['userId']
                });

                const senderIds = [...new Set(messages.map(m => m.userId))];
                senderIds.forEach(senderId => {
                    this.io.to(`chat_user_${senderId}`).emit('chat:messages_read_by_others', {
                        roomId,
                        readerId: this.userId,
                        messageIds,
                        timestamp: new Date()
                    });
                });
            }
        } catch (error) {
            this.socket.emit('chat:error', {
                error: 'Failed to mark messages as read',
                details: error.message
            });
        }
    }

    async handleGetMessages(data) {
        try {
            const { roomId, limit = 50, offset = 0 } = data;
            if (!roomId) throw new Error('Room ID is required');

            const messages = await ChatMessage.findAll({
                where: { roomId },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'avatar', 'role']
                }],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            const total = await ChatMessage.count({ where: { roomId } });

            this.socket.emit('chat:messages', {
                messages: messages.reverse(),
                roomId,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total,
                    hasMore: offset + messages.length < total
                }
            });
        } catch (error) {
            this.socket.emit('chat:error', {
                error: 'Failed to get messages',
                details: error.message
            });
        }
    }

    async handleGetRooms() {
        try {
            const rooms = await ChatService.getUserRooms(this.userId, this.userRole);
            this.socket.emit('chat:rooms', { rooms, timestamp: new Date() });
        } catch (error) {
            this.socket.emit('chat:error', {
                error: 'Failed to get rooms',
                details: error.message
            });
        }
    }

    async handleCreateRoom(data) {
        try {
            const { participantIds, title, type = 'private', metadata = {} } = data;

            if (!participantIds || participantIds.length === 0) throw new Error('At least one participant is required');

            const allParticipants = [...new Set([this.userId, ...participantIds])];

            const room = await ChatRoom.create({
                title: title || `Chat with ${allParticipants.length} participants`,
                type,
                createdBy: this.userId,
                metadata
            });

            await room.addParticipants(allParticipants);

            const populatedRoom = await ChatRoom.findByPk(room.id, {
                include: [{
                    model: User,
                    as: 'participants',
                    attributes: ['id', 'name', 'avatar', 'role']
                }]
            });

            await this.handleJoinRoom({ roomId: room.id });

            allParticipants.forEach(participantId => {
                this.io.to(`chat_user_${participantId}`).emit('chat:room_created', {
                    room: populatedRoom.toJSON(),
                    createdBy: this.userId
                });
            });

            this.socket.emit('chat:room_created', {
                success: true,
                room: populatedRoom.toJSON()
            });

            console.log(`Room ${room.id} created by user ${this.userId}`);
        } catch (error) {
            this.socket.emit('chat:error', {
                error: 'Failed to create room',
                details: error.message
            });
        }
    }

    async handleCloseRoom(data) {
        try {
            const { roomId } = data;
            if (!roomId) throw new Error('Room ID is required');

            const room = await ChatRoom.findByPk(roomId);
            if (!room) throw new Error('Room not found');

            if (this.userRole !== 'admin' && room.createdBy !== this.userId) throw new Error('Permission denied');

            room.status = 'closed';
            room.closedAt = new Date();
            room.closedBy = this.userId;
            await room.save();

            this.io.to(`chat_room_${roomId}`).emit('chat:room_closed', {
                roomId,
                closedBy: this.userId,
                timestamp: new Date()
            });

            this.socket.leave(`chat_room_${roomId}`);
            if (this.currentRoom === roomId) {
                this.currentRoom = null;
            }

            this.socket.emit('chat:room_closed', { success: true, roomId });

            console.log(`Room ${roomId} closed by user ${this.userId}`);
        } catch (error) {
            this.socket.emit('chat:error', {
                error: 'Failed to close room',
                details: error.message
            });
        }
    }

    async handleTransferToAdmin(data) {
        try {
            const { roomId, adminId } = data;
            if (!roomId) throw new Error('Room ID is required');

            const room = await ChatRoom.findByPk(roomId, {
                include: [{
                    model: User,
                    as: 'participants',
                    attributes: ['id', 'role']
                }]
            });

            if (!room) throw new Error('Room not found');

            let targetAdminId = adminId;
            if (!targetAdminId) {
                const admin = await User.findOne({
                    where: { role: 'admin', isActive: true },
                    order: sequelize.random(),
                    attributes: ['id']
                });
                if (!admin) throw new Error('No admin available');
                targetAdminId = admin.id;
            }

            await room.addParticipant(targetAdminId);

            this.io.to(`chat_user_${targetAdminId}`).emit('chat:room_transferred', {
                roomId,
                transferredBy: this.userId,
                timestamp: new Date()
            });

            this.io.to(`chat_room_${roomId}`).emit('chat:admin_joined', {
                roomId,
                adminId: targetAdminId,
                timestamp: new Date()
            });

            this.socket.emit('chat:transferred_to_admin', {
                success: true,
                roomId,
                adminId: targetAdminId
            });

            console.log(`Room ${roomId} transferred to admin ${targetAdminId}`);
        } catch (error) {
            this.socket.emit('chat:error', {
                error: 'Failed to transfer to admin',
                details: error.message
            });
        }
    }

    async handleGetUnreadCount() {
        try {
            const count = await ChatService.getUnreadCount(this.userId);
            this.socket.emit('chat:unread_count', { count, timestamp: new Date() });
        } catch (error) {
            this.socket.emit('chat:error', {
                error: 'Failed to get unread count',
                details: error.message
            });
        }
    }

    async handleUploadFile(data) {
        try {
            const { roomId, file, fileName, fileType, fileSize } = data;
            if (!roomId || !file) throw new Error('Room ID and file are required');

            const fileUrl = await this.uploadFileToStorage(file, { fileName, fileType, fileSize });

            await this.handleSendMessage({
                roomId,
                content: fileName,
                type: 'file',
                metadata: { fileUrl, fileName, fileType, fileSize, uploadedAt: new Date() }
            });

            this.socket.emit('chat:file_uploaded', { success: true, fileUrl, fileName });
        } catch (error) {
            this.socket.emit('chat:error', {
                error: 'Failed to upload file',
                details: error.message
            });
        }
    }

    async sendWelcomeMessage() {
        try {
            const user = await User.findByPk(this.userId);
            if (user && this.userRole === 'customer') {
                let room = await ChatRoom.findOne({
                    where: { type: 'support', '$participants.id$': this.userId },
                    include: [{ model: User, as: 'participants', where: { role: 'admin' }, required: false }]
                });

                if (!room) {
                    const admin = await User.findOne({
                        where: { role: 'admin', isActive: true },
                        order: sequelize.random(),
                        attributes: ['id']
                    });

                    if (admin) {
                        room = await ChatRoom.create({
                            title: `Support Chat - ${user.name}`,
                            type: 'support',
                            createdBy: this.userId,
                            metadata: { initiatedBy: 'system' }
                        });

                        await room.addParticipants([this.userId, admin.id]);

                        const welcomeMessage = await ChatMessage.create({
                            roomId: room.id,
                            userId: admin.id,
                            content: 'Halo! Selamat datang di layanan dukungan Mesin Cuci Store. Ada yang bisa saya bantu?',
                            type: 'text',
                            metadata: { isSystemMessage: true }
                        });

                        await this.handleJoinRoom({ roomId: room.id });

                        this.io.to(`chat_room_${room.id}`).emit('chat:new_message', {
                            message: {
                                ...welcomeMessage.toJSON(),
                                user: { id: admin.id, name: 'Admin Support', role: 'admin' }
                            },
                            roomId: room.id
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Failed to send welcome message:', error);
        }
    }

    async markMessagesAsRead(roomId) {
        try {
            await ChatMessage.update(
                { status: 'read', readAt: new Date() },
                { where: { roomId, userId: { [Op.ne]: this.userId }, status: 'delivered' } }
            );
            const room = await ChatRoom.findByPk(roomId);
            if (room) {
                room.unreadCount = 0;
                await room.save();
            }
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
        }
    }

    async updateUnreadCounts(roomId, excludeUserId) {
        try {
            const room = await ChatRoom.findByPk(roomId, {
                include: [{ model: User, as: 'participants', attributes: ['id'] }]
            });

            if (room && room.participants) {
                room.participants.forEach(async (participant) => {
                    if (participant.id !== excludeUserId) {
                        const unreadCount = await ChatMessage.count({
                            where: { roomId, userId: { [Op.ne]: participant.id }, status: 'delivered' }
                        });
                        this.io.to(`chat_user_${participant.id}`).emit('chat:unread_count_update', {
                            roomId,
                            count: unreadCount
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Failed to update unread counts:', error);
        }
    }

    async notifyOfflineParticipants(room, message) {
        try {
            const offlineParticipants = room.participants.filter(participant => {
                return participant.id !== this.userId && !this.isUserOnline(participant.id);
            });

            offlineParticipants.forEach(async (participant) => {
                await this.sendPushNotification(participant.id, {
                    title: `Pesan baru dari ${message.user.name}`,
                    body: message.content.substring(0, 100),
                    data: { roomId: room.id, messageId: message.id, type: 'chat_message' }
                });
            });
        } catch (error) {
            console.error('Failed to notify offline participants:', error);
        }
    }

    isUserOnline(userId) {
        const adapter = this.io.of('/').adapter;
        const room = adapter.rooms.get(`chat_user_${userId}`);
        return room && room.size > 0;
    }

    async uploadFileToStorage(file, metadata) {
        return `https://storage.mesincu.cu/chat-files/${Date.now()}-${metadata.fileName}`;
    }

    async sendPushNotification(userId, notification) {
        console.log(`Push notification to user ${userId}:`, notification);
    }

    cleanup() {
        if (this.currentRoom) {
            this.socket.leave(`chat_room_${this.currentRoom}`);
        }
        this.socket.leave(`chat_user_${this.userId}`);
        this.socket.leave('chat_admin_support');

        if (this.currentRoom) {
            ChatService.updateUserLastSeen(this.currentRoom, this.userId).catch(console.error);
        }

        this.socket.removeAllListeners('chat:join_room');
        this.socket.removeAllListeners('chat:leave_room');
        this.socket.removeAllListeners('chat:send_message');
        this.socket.removeAllListeners('chat:typing');
        this.socket.removeAllListeners('chat:stop_typing');
        this.socket.removeAllListeners('chat:read_messages');
        this.socket.removeAllListeners('chat:get_messages');
        this.socket.removeAllListeners('chat:get_rooms');
        this.socket.removeAllListeners('chat:create_room');
        this.socket.removeAllListeners('chat:close_room');
        this.socket.removeAllListeners('chat:transfer_to_admin');
        this.socket.removeAllListeners('chat:get_unread_count');
        this.socket.removeAllListeners('chat:upload_file');

        if (this.currentRoom) {
            this.socket.to(`chat_room_${this.currentRoom}`).emit('chat:user_offline', {
                userId: this.userId,
                roomId: this.currentRoom,
                timestamp: new Date()
            });
        }
        console.log(`💬 Chat handlers cleaned up for user ${this.userId}`);
    }
}

export default ChatHandler;
