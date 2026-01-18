import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ReturnRequest = sequelize.define('ReturnRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
        defaultValue: 'pending',
    },
    admin_response: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    requested_items: {
        type: DataTypes.JSON, // Array of {order_item_id, quantity}
        allowNull: false,
    },
}, {
    tableName: 'return_requests',
    timestamps: true,
    underscored: true,
});

export default ReturnRequest;
