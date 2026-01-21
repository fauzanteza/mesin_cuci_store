import express from 'express';

// Import all routes
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
// import brandRoutes from './brand.routes.js'; // Missing controller
import orderRoutes from './order.routes.js';
import cartRoutes from './cart.routes.js';
import paymentRoutes from './payment.routes.js';
import reviewRoutes from './review.routes.js';
import adminRoutes from './admin.routes.js';
import uploadRoutes from './upload.routes.js';
// import reportRoutes from './report.routes.js'; // Check if exists, user list implied it
import publicRoutes from './public.routes.js';
import addressRoutes from './address.routes.js';

const router = express.Router();

// Root endpoint for health check
router.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: '🚀 MesinCuci Store API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            docs: '/api-docs',
            auth: '/api/auth',
            products: '/api/products',
            users: '/api/users',
            orders: '/api/orders',
            admin: '/api/admin'
        }
    });
});

// API Documentation redirect
router.get('/api-docs', (req, res) => {
    // Replace with actual docs link if available
    res.redirect('https://documenter.getpostman.com/view/your-docs-link');
});

// Mount routes
// Note: We are using /api/* structure directly here if mounted at / in app.js
// OR we can mount these as sub-routes if app.js uses /api.
// The user request suggests app.js uses app.use('/', routes) and routes define /api/...
// Let's use the router.use('/api/resource', ...) pattern as requested.

router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/products', productRoutes);
router.use('/api/categories', categoryRoutes);
// router.use('/api/brands', brandRoutes);
router.use('/api/orders', orderRoutes);
router.use('/api/cart', cartRoutes);
router.use('/api/payments', paymentRoutes);
router.use('/api/reviews', reviewRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/upload', uploadRoutes);
// router.use('/api/reports', reportRoutes);
router.use('/api/public', publicRoutes);
router.use('/api/addresses', addressRoutes);

export default router;
