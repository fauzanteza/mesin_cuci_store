import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const sequelize = new Sequelize(
    process.env.DB_NAME || 'mesin_cuci_store',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        dialectModule: mysql2,
        logging: process.env.NODE_ENV === 'development' ?
            (msg) => logger.debug(msg) : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            timestamps: true,
            underscored: true,
            paranoid: true, // Soft deletes
        },
        timezone: '+07:00', // WIB
    }
);

// Test database connection
export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info('✅ Database connection established successfully.');

        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            logger.info('✅ Database models synchronized.');
        }

        return sequelize;
    } catch (error) {
        logger.error('❌ Unable to connect to the database:', error);
        throw error;
    }
};

// Export sequelize instance
export default sequelize;
