import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductVariant = sequelize.define('ProductVariant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    variant_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    variant_value: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    sku: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true, // If null, use product price
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'product_variants',
    timestamps: true,
    underscored: true,
});

export default ProductVariant;
