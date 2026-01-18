import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductView = sequelize.define('ProductView', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    tableName: 'product_views',
    timestamps: true,
    underscored: true,
});

export default ProductView;
