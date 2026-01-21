import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ShippingUpdate = sequelize.define('ShippingUpdate', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.INTEGER, // Order ID matches Order model (usually Integer if autoincrement)
        allowNull: false,
        field: 'order_id',
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    trackingNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'tracking_number'
    },
    carrier: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM(
            'pending',
            'label_created',
            'picked_up',
            'in_transit',
            'out_for_delivery',
            'delivered',
            'failed',
            'returned'
        ),
        defaultValue: 'pending'
    },
    location: {
        type: DataTypes.STRING
    },
    estimatedDelivery: {
        type: DataTypes.DATE,
        field: 'estimated_delivery'
    },
    notes: {
        type: DataTypes.TEXT
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
}, {
    timestamps: true,
    tableName: 'shipping_updates',
    underscored: true,
    indexes: [
        {
            fields: ['order_id']
        },
        {
            fields: ['tracking_number']
        },
        {
            fields: ['status']
        },
        {
            fields: ['updated_at']
        }
    ]
});

export default ShippingUpdate;
