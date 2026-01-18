import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Address = sequelize.define('Address', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    recipient_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    address_line1: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    address_line2: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    province: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    postal_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'addresses',
    timestamps: true,
    underscored: true,
});

export default Address;
