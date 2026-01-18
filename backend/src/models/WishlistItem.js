import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WishlistItem = sequelize.define('WishlistItem', {
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
    tableName: 'wishlist_items',
    timestamps: true,
    underscored: true,
});

export default WishlistItem;
