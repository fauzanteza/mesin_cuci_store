import express from 'express';
const router = express.Router();

// Import all route files
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import brandRoutes from './brand.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import reviewRoutes from './review.routes.js';
import adminRoutes from './admin.routes.js';
import uploadRoutes from './upload.routes.js';
import reportRoutes from './report.routes.js';

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
    });
});

// API version prefix
const apiPrefix = '/api/v1';

// Mount routes
router.use(`${apiPrefix}/auth`, authRoutes);
router.use(`${apiPrefix}/users`, userRoutes);
router.use(`${apiPrefix}/products`, productRoutes);
router.use(`${apiPrefix}/categories`, categoryRoutes);
router.use(`${apiPrefix}/brands`, brandRoutes);
router.use(`${apiPrefix}/cart`, cartRoutes);
router.use(`${apiPrefix}/orders`, orderRoutes);
router.use(`${apiPrefix}/payments`, paymentRoutes);
router.use(`${apiPrefix}/reviews`, reviewRoutes);
router.use(`${apiPrefix}/admin`, adminRoutes);
router.use(`${apiPrefix}/upload`, uploadRoutes);
router.use(`${apiPrefix}/reports`, reportRoutes);

// 404 handler for undefined routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

export default router;
