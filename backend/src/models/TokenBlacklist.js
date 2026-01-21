import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TokenBlacklist = sequelize.define('TokenBlacklist', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at'
    },
    reason: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'token_blacklist',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['token']
        }
    ]
});

export default TokenBlacklist;
