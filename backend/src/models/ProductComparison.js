import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductComparison = sequelize.define('ProductComparison', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'product_comparisons',
    timestamps: true,
    underscored: true,
});

export default ProductComparison;
