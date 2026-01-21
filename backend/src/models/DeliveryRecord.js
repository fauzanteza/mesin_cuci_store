import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DeliveryRecord = sequelize.define('DeliveryRecord', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.INTEGER, // Order ID
        allowNull: false,
        field: 'order_id',
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    deliveredAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'delivered_at'
    },
    receivedBy: {
        type: DataTypes.STRING,
        field: 'received_by'
    },
    deliveryAgent: {
        type: DataTypes.STRING,
        field: 'delivery_agent'
    },
    notes: {
        type: DataTypes.TEXT
    },
    signatureUrl: {
        type: DataTypes.STRING,
        field: 'signature_url'
    },
    proofUrl: {
        type: DataTypes.STRING,
        field: 'proof_url'
    }
}, {
    timestamps: true,
    tableName: 'delivery_records',
    underscored: true
});

export default DeliveryRecord;
