import express from 'express';
import {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getFeaturedProducts,
    getProductReviews,
    updateProductImages,
    bulkUpdateProducts,
    getLowStockProducts,
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadProductImages } from '../middleware/upload.js';
import { validateCreateProduct, validateUpdateProduct } from '../validators/product.validator.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);
router.get('/:id/reviews', getProductReviews);

// Protected routes (Admin only)
router.use(protect, restrictTo('admin'));

router.post(
    '/',
    uploadProductImages,
    validateCreateProduct,
    createProduct
);

router.put(
    '/:id',
    uploadProductImages,
    validateUpdateProduct,
    updateProduct
);

router.patch('/:id/images', uploadProductImages, updateProductImages);
router.delete('/:id', deleteProduct);
router.post('/bulk-update', bulkUpdateProducts);
router.get('/inventory/low-stock', getLowStockProducts);

export default router;
