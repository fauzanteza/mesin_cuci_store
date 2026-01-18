import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Banner = sequelize.define('Banner', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    image_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    link_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'banners',
    timestamps: true,
    underscored: true,
});

export default Banner;
