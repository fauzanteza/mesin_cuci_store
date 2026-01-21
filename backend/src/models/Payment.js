import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'challenge', 'cancelled', 'completed'),
        defaultValue: 'pending',
    },
    payment_type: {
        type: DataTypes.STRING(50),
        allowNull: true, // e.g. 'credit_card', 'gopay', 'manual'
    },
    bank_destination: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    proof_image: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    rejection_reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    response: {
        type: DataTypes.TEXT, // Store JSON string of gateway response
        allowNull: true,
    },
    verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'payments',
    timestamps: true,
    underscored: true,
});

export default Payment;
