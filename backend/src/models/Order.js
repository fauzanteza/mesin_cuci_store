import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    address_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'addresses',
            key: 'id',
        },
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
        defaultValue: 'pending',
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending',
    },
    payment_method: {
        type: DataTypes.ENUM('bank_transfer', 'credit_card', 'e_wallet', 'cod'),
        allowNull: false,
    },
    shipping_method: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    shipping_cost: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            isDecimal: true,
            min: 0,
        },
    },
    tracking_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0,
        },
    },
    tax: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            isDecimal: true,
            min: 0,
        },
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            isDecimal: true,
            min: 0,
        },
    },
    total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0,
        },
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    shipped_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    delivered_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    cancel_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    promo_code_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'promo_codes',
            key: 'id',
        },
    },
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    hooks: {
        beforeCreate: async (order) => {
            if (!order.order_number) {
                const year = new Date().getFullYear();
                const month = String(new Date().getMonth() + 1).padStart(2, '0');
                const count = await Order.count({
                    where: sequelize.where(
                        sequelize.fn('DATE', sequelize.col('created_at')),
                        '=',
                        new Date().toISOString().split('T')[0]
                    ),
                });
                order.order_number = `ORD-${year}${month}-${String(count + 1).padStart(6, '0')}`;
            }
        },
    },
});

// Instance methods
Order.prototype.updateStatus = async function (newStatus, notes = '') {
    const oldStatus = this.status;
    this.status = newStatus;

    // Update timestamps based on status
    const now = new Date();
    switch (newStatus) {
        case 'shipped':
            this.shipped_at = now;
            break;
        case 'delivered':
            this.delivered_at = now;
            break;
        case 'cancelled':
            this.cancelled_at = now;
            break;
    }

    await this.save();

    // Create status history
    const OrderStatusHistory = sequelize.models.OrderStatusHistory;
    await OrderStatusHistory.create({
        order_id: this.id,
        status: newStatus,
        notes: notes || `Status changed from ${oldStatus} to ${newStatus}`,
    });

    return this;
};

Order.prototype.calculateTotals = function (items, shippingCost = 0, taxRate = 0.1) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax + shippingCost - (this.discount || 0);

    this.subtotal = subtotal;
    this.tax = tax;
    this.shipping_cost = shippingCost;
    this.total = total;

    return this;
};

Order.prototype.canBeCancelled = function () {
    const nonCancellableStatuses = ['shipped', 'delivered', 'cancelled'];
    return !nonCancellableStatuses.includes(this.status);
};

export default Order;
