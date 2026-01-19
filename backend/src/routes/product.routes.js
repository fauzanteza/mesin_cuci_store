import express from 'express';
import {
    getAllProducts, // Was getProducts in user request, checking outline, outline has getAllProducts
    getProduct,     // Was getProductById in user request, outline has getProduct
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductImages, // Was uploadProductImages in user request (which confused with middleware), outline has updateProductImages
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middleware/auth.js'; // Map authenticate -> protect, authorize -> restrictTo
import { upload } from '../middleware/upload.js'; // Correct named import

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProduct);

// Protected routes (Admin only)
// Using middleware chain properly as in original file or user request
router.post('/', protect, restrictTo('admin'), createProduct);
router.put('/:id', protect, restrictTo('admin'), updateProduct);
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

// Image upload route
// User wanted: router.post('/:id/images', authenticate, authorize('admin'), upload.array('images', 5), uploadProductImages);
// Correcting to:
router.post(
    '/:id/images',
    protect,
    restrictTo('admin'),
    upload.array('images', 5),
    updateProductImages
);

export default router;
