import express from 'express';
import {
    getAllProducts,
    getProduct as getProductById, // Alias to match route logic
    searchProducts,
    getFeaturedProducts
} from '../controllers/productController.js';
import {
    getAllCategories,
    getCategory
} from '../controllers/categoryController.js';

const router = express.Router();

// Public product routes
router.get('/products', getAllProducts);
router.get('/products/search', searchProducts);
router.get('/products/featured', getFeaturedProducts);
router.get('/products/:id', getProductById);

// Map category param to query for filtration
router.get('/products/category/:categoryId', (req, res, next) => {
    req.query.category = req.params.categoryId;
    getAllProducts(req, res, next);
});

// Public category routes
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategory);

// Public brand routes (Commented out until controller exists)
// import { getAllBrands, getBrandById } from '../controllers/brandController.js';
// router.get('/brands', getAllBrands);
// router.get('/brands/:id', getBrandById);

// Public homepage data
router.get('/homepage', async (req, res) => {
    try {
        // Placeholder for homepage aggregation
        res.status(200).json({
            status: 'success',
            data: {
                message: 'Homepage data endpoint',
                banners: [],
                featuredProducts: [],
                newArrivals: [],
                categories: []
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

export default router;
