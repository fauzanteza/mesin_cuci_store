const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TokenBlacklist = sequelize.define('TokenBlacklist', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    token: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at'
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

module.exports = TokenBlacklist;
