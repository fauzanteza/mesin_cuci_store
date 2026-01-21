import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ChatRoom = sequelize.define('ChatRoom', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('private', 'group', 'support'),
        defaultValue: 'private'
    },
    status: {
        type: DataTypes.ENUM('active', 'closed', 'archived'),
        defaultValue: 'active'
    },
    lastMessage: {
        type: DataTypes.TEXT
    },
    lastMessageAt: {
        type: DataTypes.DATE,
        field: 'last_message_at'
    },
    unreadCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'unread_count'
    },
    createdBy: {
        type: DataTypes.INTEGER, // User ID is Integer
        allowNull: false,
        field: 'created_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    closedBy: {
        type: DataTypes.INTEGER, // User ID is Integer
        field: 'closed_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    closedAt: {
        type: DataTypes.DATE,
        field: 'closed_at'
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
}, {
    timestamps: true,
    tableName: 'chat_rooms',
    underscored: true,
    indexes: [
        {
            fields: ['type']
        },
        {
            fields: ['status']
        },
        {
            fields: ['last_message_at'] // underscored
        }
    ]
});

export default ChatRoom;
