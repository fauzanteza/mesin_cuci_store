import models from '../models/index.js';
import AppError from '../utils/appError.js';
import { paginate } from '../utils/pagination.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';

const { Product, Category, Brand, ProductImage, Review } = models;

// Get all products with filters
export const getAllProducts = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            brand,
            minPrice,
            maxPrice,
            search,
            sort = 'created_at',
            order = 'DESC',
            inStock,
            featured,
            categorySlug,
            brandSlug,
        } = req.query;

        // Build filter object
        const where = {};
        const include = [];

        // Search by keyword
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { short_description: { [Op.like]: `%${search}%` } },
            ];
        }

        // Filter by category ID
        if (category) {
            where.category_id = category;
        }

        // Filter by category slug
        if (categorySlug) {
            include.push({
                model: Category,
                as: 'category',
                where: { slug: categorySlug },
                attributes: [],
            });
        }

        // Filter by brand ID
        if (brand) {
            where.brand_id = brand;
        }

        // Filter by brand slug
        if (brandSlug) {
            include.push({
                model: Brand,
                as: 'brand',
                where: { slug: brandSlug },
                attributes: [],
            });
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
        }

        // Filter by stock
        if (inStock === 'true') {
            where.stock = { [Op.gt]: 0 };
            where.is_available = true;
        }

        // Filter featured products
        if (featured === 'true') {
            where.is_featured = true;
            where.is_available = true;
        }

        // Default: only show available products
        if (!req.user?.role === 'admin') {
            where.is_available = true;
        }

        // Sorting options
        let orderBy = [[sort, order]];
        if (sort === 'popular') {
            orderBy = [['sales_count', 'DESC']];
        } else if (sort === 'rating') {
            orderBy = [['rating', 'DESC']];
        } else if (sort === 'price_low') {
            orderBy = [['price', 'ASC']];
        } else if (sort === 'price_high') {
            orderBy = [['price', 'DESC']];
        } else if (sort === 'newest') {
            orderBy = [['created_at', 'DESC']];
        } else if (sort === 'oldest') {
            orderBy = [['created_at', 'ASC']];
        }

        // Include related models
        include.push(
            {
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'slug'],
            },
            {
                model: Brand,
                as: 'brand',
                attributes: ['id', 'name', 'slug', 'logo'],
            },
            {
                model: ProductImage,
                as: 'images',
                attributes: ['id', 'image_url', 'alt_text', 'is_primary', 'sort_order'],
                separate: true,
                order: [['sort_order', 'ASC'], ['is_primary', 'DESC']],
                limit: 5,
            }
        );

        // Execute query with pagination
        const result = await paginate(Product, {
            page: parseInt(page),
            limit: parseInt(limit),
            where,
            include,
            order: orderBy,
            distinct: true,
        });

        // Calculate discount percentage for each product
        const productsWithDiscount = result.data.map(product => {
            const productData = product.toJSON();
            if (productData.compare_price && productData.compare_price > productData.price) {
                productData.discount_percentage = Math.round(
                    ((productData.compare_price - productData.price) / productData.compare_price) * 100
                );
            } else {
                productData.discount_percentage = 0;
            }
            return productData;
        });

        res.status(200).json({
            status: 'success',
            data: {
                products: productsWithDiscount,
                pagination: result.pagination,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get single product by ID or slug
export const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if ID is a number (ID) or string (slug)
        const isNumericId = !isNaN(id);

        const where = isNumericId ? { id } : { slug: id };

        const product = await Product.findOne({
            where,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'slug', 'description'],
                },
                {
                    model: Brand,
                    as: 'brand',
                    attributes: ['id', 'name', 'slug', 'logo', 'description'],
                },
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['id', 'image_url', 'alt_text', 'is_primary', 'sort_order'],
                    order: [['sort_order', 'ASC'], ['is_primary', 'DESC']],
                },
                {
                    model: models.ProductVariant,
                    as: 'variants',
                    attributes: ['id', 'variant_name', 'variant_value', 'sku', 'price', 'stock'],
                    where: { stock: { [Op.gt]: 0 } },
                    required: false,
                },
                {
                    model: Review,
                    as: 'reviews',
                    attributes: ['id', 'rating', 'title', 'comment', 'created_at'],
                    include: [
                        {
                            model: models.User,
                            as: 'user',
                            attributes: ['id', 'name', 'avatar'],
                        },
                    ],
                    limit: 5,
                    order: [['created_at', 'DESC']],
                    required: false,
                },
            ],
        });

        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        // Increment view count
        await product.increment('views_count', { by: 1 });

        // Track product view for analytics
        if (req.user) {
            await models.ProductView.create({
                user_id: req.user.id,
                product_id: product.id,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
            });
        }

        // Calculate discount
        const productData = product.toJSON();
        if (productData.compare_price && productData.compare_price > productData.price) {
            productData.discount_percentage = Math.round(
                ((productData.compare_price - productData.price) / productData.compare_price) * 100
            );
        } else {
            productData.discount_percentage = 0;
        }

        // Get related products
        const relatedProducts = await Product.findAll({
            where: {
                category_id: product.category_id,
                id: { [Op.ne]: product.id },
                is_available: true,
            },
            include: [
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['image_url', 'alt_text', 'is_primary'],
                    where: { is_primary: true },
                    required: false,
                },
            ],
            limit: 4,
            order: [['created_at', 'DESC']],
        });

        res.status(200).json({
            status: 'success',
            data: {
                product: productData,
                relatedProducts,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Create new product (Admin only)
export const createProduct = async (req, res, next) => {
    try {
        const {
            name,
            description,
            short_description,
            price,
            compare_price,
            cost,
            stock,
            category_id,
            brand_id,
            specifications,
            features,
            warranty_months,
            weight_kg,
            dimensions,
            is_featured,
            seo_title,
            seo_description,
            seo_keywords,
        } = req.body;

        // Generate slug from name
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        // Generate SKU
        const sku = `MC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create product
        const product = await Product.create({
            name,
            slug,
            sku,
            description,
            short_description,
            price: parseFloat(price),
            compare_price: compare_price ? parseFloat(compare_price) : null,
            cost: cost ? parseFloat(cost) : null,
            stock: parseInt(stock),
            category_id: parseInt(category_id),
            brand_id: brand_id ? parseInt(brand_id) : null,
            specifications: specifications ? JSON.parse(specifications) : null,
            features: features ? JSON.parse(features) : null,
            warranty_months: warranty_months ? parseInt(warranty_months) : 12,
            weight_kg: weight_kg ? parseFloat(weight_kg) : null,
            dimensions: dimensions ? JSON.parse(dimensions) : null,
            is_featured: is_featured === 'true',
            seo_title,
            seo_description,
            seo_keywords,
        });

        // Handle image uploads
        if (req.files && req.files.images) {
            const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

            const imagePromises = images.map((file, index) => {
                return ProductImage.create({
                    product_id: product.id,
                    image_url: `/uploads/products/${file.filename}`,
                    alt_text: `${product.name} - Image ${index + 1}`,
                    is_primary: index === 0,
                    sort_order: index,
                });
            });

            await Promise.all(imagePromises);
        }

        // Get product with relations
        const createdProduct = await Product.findByPk(product.id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                },
                {
                    model: Brand,
                    as: 'brand',
                },
                {
                    model: ProductImage,
                    as: 'images',
                },
            ],
        });

        // Create audit log
        await models.AuditLog.create({
            user_id: req.user.id,
            action: 'CREATE_PRODUCT',
            entity_type: 'Product',
            entity_id: product.id,
            new_data: createdProduct.toJSON(),
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
        });

        res.status(201).json({
            status: 'success',
            data: {
                product: createdProduct,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Update product (Admin only)
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        // Store old data for audit log
        const oldData = product.toJSON();

        // Update fields
        const updatableFields = [
            'name', 'description', 'short_description', 'price', 'compare_price',
            'cost', 'stock', 'category_id', 'brand_id', 'specifications',
            'features', 'warranty_months', 'weight_kg', 'dimensions',
            'is_available', 'is_featured', 'seo_title', 'seo_description',
            'seo_keywords', 'low_stock_threshold',
        ];

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                if (field === 'specifications' || field === 'features' || field === 'dimensions') {
                    product[field] = JSON.parse(req.body[field]);
                } else if (field === 'price' || field === 'compare_price' || field === 'cost' || field === 'weight_kg') {
                    product[field] = parseFloat(req.body[field]);
                } else if (field === 'stock' || field === 'warranty_months' || field === 'low_stock_threshold' || field === 'category_id' || field === 'brand_id') {
                    product[field] = parseInt(req.body[field]);
                } else if (field === 'is_available' || field === 'is_featured') {
                    product[field] = req.body[field] === 'true';
                } else {
                    product[field] = req.body[field];
                }
            }
        });

        // Update slug if name changed
        if (req.body.name && req.body.name !== product.name) {
            product.slug = req.body.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
        }

        await product.save();

        // Handle image uploads
        if (req.files && req.files.images) {
            const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

            const imagePromises = images.map(async (file, index) => {
                return ProductImage.create({
                    product_id: product.id,
                    image_url: `/uploads/products/${file.filename}`,
                    alt_text: `${product.name} - Image ${index + 1}`,
                    is_primary: false,
                    sort_order: await ProductImage.count({ where: { product_id: product.id } }) + index,
                });
            });

            await Promise.all(imagePromises);
        }

        // Get updated product with relations
        const updatedProduct = await Product.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                },
                {
                    model: Brand,
                    as: 'brand',
                },
                {
                    model: ProductImage,
                    as: 'images',
                },
            ],
        });

        // Create audit log
        await models.AuditLog.create({
            user_id: req.user.id,
            action: 'UPDATE_PRODUCT',
            entity_type: 'Product',
            entity_id: product.id,
            old_data: oldData,
            new_data: updatedProduct.toJSON(),
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
        });

        res.status(200).json({
            status: 'success',
            data: {
                product: updatedProduct,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        // Store data for audit log
        const oldData = product.toJSON();

        // Soft delete
        await product.destroy();

        // Create audit log
        await models.AuditLog.create({
            user_id: req.user.id,
            action: 'DELETE_PRODUCT',
            entity_type: 'Product',
            entity_id: product.id,
            old_data: oldData,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
        });

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

// Search products
export const searchProducts = async (req, res, next) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.trim().length < 2) {
            return next(new AppError('Search query must be at least 2 characters', 400));
        }

        const products = await Product.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${q}%` } },
                    { description: { [Op.like]: `%${q}%` } },
                    { short_description: { [Op.like]: `%${q}%` } },
                    { sku: { [Op.like]: `%${q}%` } },
                ],
                is_available: true,
            },
            include: [
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['image_url', 'alt_text', 'is_primary'],
                    where: { is_primary: true },
                    required: false,
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'slug'],
                },
            ],
            limit: parseInt(limit),
            order: [['created_at', 'DESC']],
        });

        res.status(200).json({
            status: 'success',
            data: {
                products,
                count: products.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get featured products
export const getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll({
            where: {
                is_featured: true,
                is_available: true,
                stock: { [Op.gt]: 0 },
            },
            include: [
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['image_url', 'alt_text', 'is_primary'],
                    where: { is_primary: true },
                    required: false,
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'slug'],
                },
                {
                    model: Brand,
                    as: 'brand',
                    attributes: ['id', 'name', 'logo'],
                },
            ],
            limit: 8,
            order: [['created_at', 'DESC']],
        });

        res.status(200).json({
            status: 'success',
            data: {
                products,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get product reviews
export const getProductReviews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10, rating } = req.query;

        const where = { product_id: id };

        if (rating) {
            where.rating = parseInt(rating);
        }

        const result = await paginate(Review, {
            page: parseInt(page),
            limit: parseInt(limit),
            where,
            include: [
                {
                    model: models.User,
                    as: 'user',
                    attributes: ['id', 'name', 'avatar'],
                },
            ],
            order: [['created_at', 'DESC']],
        });

        // Calculate rating statistics
        const ratingStats = await Review.findAll({
            where: { product_id: id },
            attributes: [
                [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
                [models.sequelize.fn('AVG', models.sequelize.col('rating')), 'average'],
                [models.sequelize.fn('SUM', models.sequelize.literal('CASE WHEN rating = 5 THEN 1 ELSE 0 END')), 'five_star'],
                [models.sequelize.fn('SUM', models.sequelize.literal('CASE WHEN rating = 4 THEN 1 ELSE 0 END')), 'four_star'],
                [models.sequelize.fn('SUM', models.sequelize.literal('CASE WHEN rating = 3 THEN 1 ELSE 0 END')), 'three_star'],
                [models.sequelize.fn('SUM', models.sequelize.literal('CASE WHEN rating = 2 THEN 1 ELSE 0 END')), 'two_star'],
                [models.sequelize.fn('SUM', models.sequelize.literal('CASE WHEN rating = 1 THEN 1 ELSE 0 END')), 'one_star'],
            ],
            raw: true,
        });

        res.status(200).json({
            status: 'success',
            data: {
                reviews: result.data,
                pagination: result.pagination,
                statistics: ratingStats[0] || {
                    total: 0,
                    average: 0,
                    five_star: 0,
                    four_star: 0,
                    three_star: 0,
                    two_star: 0,
                    one_star: 0,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Update product images
export const updateProductImages = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { images } = req.body;

        const product = await Product.findByPk(id);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        // Delete existing images
        await ProductImage.destroy({ where: { product_id: id } });

        // Create new images
        if (images && Array.isArray(images)) {
            const imagePromises = images.map((image, index) => {
                return ProductImage.create({
                    product_id: id,
                    image_url: image.url,
                    alt_text: image.alt_text || `${product.name} - Image ${index + 1}`,
                    is_primary: image.is_primary || index === 0,
                    sort_order: image.sort_order || index,
                });
            });

            await Promise.all(imagePromises);
        }

        // Handle file uploads
        if (req.files && req.files.newImages) {
            const newImages = Array.isArray(req.files.newImages) ? req.files.newImages : [req.files.newImages];

            const existingCount = await ProductImage.count({ where: { product_id: id } });

            const uploadPromises = newImages.map((file, index) => {
                return ProductImage.create({
                    product_id: id,
                    image_url: `/uploads/products/${file.filename}`,
                    alt_text: `${product.name} - Image ${existingCount + index + 1}`,
                    is_primary: false,
                    sort_order: existingCount + index,
                });
            });

            await Promise.all(uploadPromises);
        }

        const updatedImages = await ProductImage.findAll({
            where: { product_id: id },
            order: [['sort_order', 'ASC'], ['is_primary', 'DESC']],
        });

        res.status(200).json({
            status: 'success',
            data: {
                images: updatedImages,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Bulk update products
export const bulkUpdateProducts = async (req, res, next) => {
    try {
        const { ids, updates } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return next(new AppError('Product IDs are required', 400));
        }

        if (!updates || typeof updates !== 'object') {
            return next(new AppError('Updates object is required', 400));
        }

        // Filter allowed fields
        const allowedFields = [
            'price', 'compare_price', 'stock', 'is_available', 'is_featured',
            'category_id', 'brand_id', 'low_stock_threshold',
        ];

        const filteredUpdates = {};
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        if (Object.keys(filteredUpdates).length === 0) {
            return next(new AppError('No valid fields to update', 400));
        }

        // Update products
        const [affectedCount] = await Product.update(filteredUpdates, {
            where: { id: ids },
        });

        // Create audit log
        await models.AuditLog.create({
            user_id: req.user.id,
            action: 'BULK_UPDATE_PRODUCTS',
            entity_type: 'Product',
            old_data: { ids, previous_values: 'Multiple products' },
            new_data: { ids, updates: filteredUpdates },
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
        });

        res.status(200).json({
            status: 'success',
            data: {
                affectedCount,
                message: `${affectedCount} products updated successfully`,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get low stock products
export const getLowStockProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll({
            where: {
                stock: {
                    [Op.lte]: models.sequelize.col('low_stock_threshold'),
                },
                is_available: true,
            },
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
                {
                    model: Brand,
                    as: 'brand',
                    attributes: ['id', 'name'],
                },
            ],
            order: [['stock', 'ASC']],
        });

        res.status(200).json({
            status: 'success',
            data: {
                products,
                count: products.length,
            },
        });
    } catch (error) {
        next(error);
    }
};
