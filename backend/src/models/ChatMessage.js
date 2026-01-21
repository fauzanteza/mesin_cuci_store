import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ChatMessage = sequelize.define('ChatMessage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    roomId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'chat_rooms',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER, // User ID is Integer in existing models
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('text', 'image', 'file', 'system'),
        defaultValue: 'text'
    },
    status: {
        type: DataTypes.ENUM('sent', 'delivered', 'read', 'failed'),
        defaultValue: 'sent'
    },
    readAt: {
        type: DataTypes.DATE
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
}, {
    timestamps: true,
    tableName: 'chat_messages',
    underscored: true,
    indexes: [
        {
            fields: ['roomId']
        },
        {
            fields: ['userId']
        },
        {
            fields: ['created_at'] // underscored
        }
    ]
});

export default ChatMessage;
