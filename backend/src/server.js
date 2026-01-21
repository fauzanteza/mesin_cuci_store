import 'express-async-errors';
import dotenv from 'dotenv';
import app from './app.js';
import models from './models/index.js'; // Import default export which is { sequelize, ... }
import logger from './utils/logger.js';

dotenv.config();

const { sequelize } = models;
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Test database connection
const testDatabaseConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info('✅ Database connection established successfully.');

        // Sync models (use carefully in production)
        // if (NODE_ENV === 'development') {
        //   await sequelize.sync({ alter: true });
        //   logger.info('🔄 Database models synchronized.');
        // }
    } catch (error) {
        logger.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
};

const startServer = async () => {
    try {
        await testDatabaseConnection();

        const server = app.listen(PORT, () => {
            logger.info(`
        ====================================
        🚀 SERVER STARTED SUCCESSFULLY
        ====================================
        🔗 URL: http://localhost:${PORT}
        🌍 Environment: ${NODE_ENV}
        🗄️ Database: ${process.env.DB_NAME || 'mesin_cuci_store'}
        ⏰ Time: ${new Date().toLocaleString()}
        ====================================
      `);

            // Log available endpoints
            logger.info('📋 Available Endpoints:');
            logger.info(`   GET  /          - API Health Check`);
            logger.info(`   GET  /api-docs  - API Documentation`);
            logger.info(`   POST /api/auth/register - Register User`);
            logger.info(`   POST /api/auth/login    - Login User`);
            logger.info(`   GET  /api/products      - Get Products`);
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`❌ Port ${PORT} is already in use`);
                process.exit(1);
            } else {
                logger.error('❌ Server error:', error);
            }
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('👋 SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                logger.info('💤 Process terminated.');
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
