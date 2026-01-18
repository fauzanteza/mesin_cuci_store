import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AbandonedCart = sequelize.define('AbandonedCart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cart_data: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    email_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'abandoned_carts',
    timestamps: true,
    underscored: true,
});

export default AbandonedCart;
