import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PromoCode = sequelize.define('PromoCode', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false,
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    max_discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    min_purchase: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    used_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'promo_codes',
    timestamps: true,
    underscored: true,
});

export default PromoCode;
