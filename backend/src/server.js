import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import 'express-async-errors';

// Import routes
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import cartRoutes from './routes/cart.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import categoryRoutes from './routes/category.routes.js'; // Added
import reviewRoutes from './routes/review.routes.js';     // Added
import uploadRoutes from './routes/upload.routes.js';     // Added
// Add any other existing routes if needed based on file list, but these cover the main ones requested
// The user's request listed these specific ones.

// Import middleware
import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';
import loggerMiddleware from './middleware/logger.js'; // Default export in logger.js

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ========== MIDDLEWARE SETUP ==========
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));
app.use(loggerMiddleware);

// ========== STATIC FILES ==========
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ========== API ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/categories', categoryRoutes); // Added
app.use('/api/reviews', reviewRoutes);     // Added
app.use('/api/upload', uploadRoutes);       // Added

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ========== ROOT ENDPOINT ==========
app.get('/api', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to Mesin Cuci Store API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            orders: '/api/orders',
            users: '/api/users',
            cart: '/api/cart',
            payments: '/api/payments',
            admin: '/api/admin',
            categories: '/api/categories',
            reviews: '/api/reviews',
            upload: '/api/upload'
        }
    });
});

// ========== ERROR HANDLING ==========
app.use(notFound);
app.use(errorHandler);

// ========== START SERVER ==========
const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📚 Base URL: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
