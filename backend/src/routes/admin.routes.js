import express from 'express';
import adminController from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Ensure path is correct
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// Protect all admin routes
router.use(authMiddleware.protect);
// router.use(requireAdmin); // Temporarily commented out for testing if role middleware not ready

// Dashboard routes
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/recent-orders', adminController.getRecentOrders);
router.get('/dashboard/sales-report', adminController.getSalesReport);
router.get('/dashboard/inventory-alerts', adminController.getInventoryAlerts);
router.get('/dashboard/top-products', adminController.getTopProducts);

// Product Management Routes
import adminProductController from '../controllers/adminProductController.js';
import { uploadProductImages, upload } from '../middleware/upload.js';

// List & Detail
router.get('/products', adminProductController.getProducts);
router.get('/products/export', adminProductController.exportProducts); // Specific route before :id
router.get('/products/:id', adminProductController.getProduct);

// Create, Update, Delete
router.post('/products', uploadProductImages, adminProductController.createProduct);
router.put('/products/:id', uploadProductImages, adminProductController.updateProduct);
router.delete('/products/:id', adminProductController.deleteProduct);

// Specific Actions
router.patch('/products/:id/status', adminProductController.updateProductStatus);
router.patch('/products/:id/stock', adminProductController.updateProductStock);
router.post('/products/bulk', adminProductController.bulkUpdateProducts);
router.post('/products/import', upload.single('file'), adminProductController.importProducts);

// Order Management Routes
import adminOrderController from '../controllers/adminOrderController.js';

router.get('/orders', adminOrderController.getOrders);
router.get('/orders/export', adminOrderController.exportOrders);
router.get('/orders/stats', adminOrderController.getOrderStats);
router.get('/orders/:id', adminOrderController.getOrder);
router.post('/orders', adminOrderController.createOrder); // Admin create order
router.put('/orders/:id', adminOrderController.updateOrder);
router.delete('/orders/:id', adminOrderController.deleteOrder);

// Order Specific Actions
router.patch('/orders/:id/status', adminOrderController.updateOrderStatus);
router.patch('/orders/:id/payment', adminOrderController.updatePaymentStatus);
router.patch('/orders/:id/notes', adminOrderController.updateOrderNotes);
router.patch('/orders/bulk-status', adminOrderController.bulkUpdateOrderStatus);

// Category Management Routes
import adminCategoryController from '../controllers/adminCategoryController.js';

router.get('/categories', adminCategoryController.getCategories);
router.get('/categories/tree', adminCategoryController.getCategoryTree);
router.get('/categories/stats', adminCategoryController.getCategoryStats);
router.get('/categories/:id', adminCategoryController.getCategory);
router.post('/categories', adminCategoryController.createCategory);
router.put('/categories/:id', adminCategoryController.updateCategory);
router.delete('/categories/:id', adminCategoryController.deleteCategory);
router.patch('/categories/:id/status', adminCategoryController.updateCategoryStatus);
router.patch('/categories/:id/featured', adminCategoryController.updateCategoryFeatured);
router.patch('/categories/reorder', adminCategoryController.reorderCategories); // Specific route
router.post('/categories/bulk-update', adminCategoryController.bulkUpdateCategories); // Adjusted path
router.post('/categories/:id/image', upload.single('image'), adminCategoryController.uploadCategoryImage);


// User Management Routes
import adminUserController from '../controllers/adminUserController.js';

router.get('/users', adminUserController.getUsers);
router.get('/users/:id', adminUserController.getUser);
router.post('/users', adminUserController.createUser);
router.put('/users/:id', adminUserController.updateUser);
router.delete('/users/:id', adminUserController.deleteUser);
router.patch('/users/:id/status', adminUserController.updateUserStatus);

export default router;
