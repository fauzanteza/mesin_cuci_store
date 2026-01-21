import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const InventoryTransaction = sequelize.define('InventoryTransaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id',
        references: {
            model: 'products',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('INITIAL', 'STOCK_IN', 'STOCK_OUT', 'RESERVED', 'RELEASED', 'ADJUSTMENT', 'RESTOCK'),
        allowNull: false,
        defaultValue: 'ADJUSTMENT'
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    previousStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'previous_stock'
    },
    currentStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'current_stock'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'created_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    transactionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'transaction_date'
    }
}, {
    tableName: 'inventory_transactions',
    timestamps: true,
    underscored: true
});

export default InventoryTransaction;
