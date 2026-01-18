import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'order_status_history',
    timestamps: true,
    underscored: true,
});

export default OrderStatusHistory;
