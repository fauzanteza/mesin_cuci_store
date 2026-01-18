import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SiteSetting = sequelize.define('SiteSetting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING(20),
        defaultValue: 'string', // string, boolean, number, json
    },
}, {
    tableName: 'site_settings',
    timestamps: true,
    underscored: true,
});

export default SiteSetting;
