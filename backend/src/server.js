import app from './app.js';
import http from 'http';
import { connectDB } from './config/database.js';
import { initSocket } from './socket/socket.js';
import logger from './utils/logger.js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Connect to database
connectDB()
    .then(() => {
        logger.info('✅ Database connected successfully');

        // Initialize Socket.io
        initSocket(server);

        // Start server
        server.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`📚 API: http://localhost:${PORT}/api`);
            logger.info(`📊 Health: http://localhost:${PORT}/api/health`);
        });
    })
    .catch((error) => {
        logger.error('❌ Database connection failed:', error);
        process.exit(1);
    });

// Error handling
process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
    logger.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    logger.error(err.name, err.message);
    process.exit(1);
});

process.on('SIGTERM', () => {
    logger.info('👋 SIGTERM received. Shutting down gracefully');
    server.close(() => {
        logger.info('💥 Process terminated');
    });
});

export default server;
