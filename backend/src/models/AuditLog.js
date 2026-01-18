import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    action: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    entity_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    entity_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    old_data: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    new_data: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    ip_address: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    user_agent: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    tableName: 'audit_logs',
    timestamps: true,
    underscored: true,
});

export default AuditLog;
