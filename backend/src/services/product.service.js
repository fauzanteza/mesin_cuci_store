import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import models from '../models/index.js';
import InventoryService from './inventory.service.js';
import cloudinary from '../config/cloudinary.js';
import AppError from '../utils/appError.js';
import NotificationService from './notification.service.js';

const { Product, Category, Brand, ProductImage, ProductVariant, Review, WishlistItem, Order, OrderItem, User, AuditLog } = models;

class ProductService {
    /**
     * Get all products with filters
     */
    static async getProducts(filters = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                category,
                brand,
                minPrice,
                maxPrice,
                search,
                sortBy = 'createdAt',
                sortOrder = 'DESC',
                inStock,
                featured,
                onSale
            } = filters;

            const offset = (page - 1) * limit;
            const where = { isActive: true };

            // Apply filters
            if (category) {
                where.categoryId = category;
            }

            if (brand) {
                where.brandId = brand;
            }

            if (minPrice || maxPrice) {
                where.price = {};
                if (minPrice) where.price.$gte = parseFloat(minPrice);
                if (maxPrice) where.price.$lte = parseFloat(maxPrice);
            }

            if (search) {
                where[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                    { sku: { [Op.like]: `%${search}%` } }
                ];
            }

            if (inStock === 'true') {
                where.stock = { [Op.gt]: 0 };
            }

            if (featured === 'true') {
                where.isFeatured = true;
            }

            if (onSale === 'true') {
                where.discountPrice = { [Op.ne]: null };
            }

            // Define sort
            const order = [];
            if (sortBy === 'price') {
                order.push(['price', sortOrder]);
            } else if (sortBy === 'name') {
                order.push(['name', sortOrder]);
            } else if (sortBy === 'rating') {
                order.push(['averageRating', sortOrder]);
            } else {
                order.push([sortBy, sortOrder]);
            }

            const products = await Product.findAndCountAll({
                where,
                include: [
                    {
                        model: Category,
                        attributes: ['id', 'name', 'slug']
                    },
                    {
                        model: Brand,
                        attributes: ['id', 'name', 'logo']
                    },
                    {
                        model: ProductImage,
                        as: 'images',
                        limit: 1
                    }
                ],
                order,
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true
            });

            // Calculate average ratings for each product
            const productsWithRatings = await Promise.all(
                products.rows.map(async (product) => {
                    const ratingData = await this.getProductRating(product.id);
                    return {
                        ...product.toJSON(),
                        rating: ratingData
                    };
                })
            );

            return {
                products: productsWithRatings,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: products.count,
                    pages: Math.ceil(products.count / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get single product by ID or slug
     */
    static async getProductByIdentifier(identifier) {
        try {
            const where = { isActive: true };
            if (isNaN(identifier)) {
                where.slug = identifier;
            } else {
                where.id = parseInt(identifier);
            }

            const product = await Product.findOne({
                where,
                include: [
                    {
                        model: Category,
                        attributes: ['id', 'name', 'slug', 'description']
                    },
                    {
                        model: Brand,
                        attributes: ['id', 'name', 'logo', 'description']
                    },
                    {
                        model: ProductImage,
                        as: 'images',
                        order: [['sortOrder', 'ASC']]
                    },
                    {
                        model: ProductVariant,
                        as: 'variants',
                        where: { isActive: true },
                        required: false
                    }
                ]
            });

            if (!product) {
                throw new AppError('Produk tidak ditemukan', 404);
            }

            // Increment view count
            await product.increment('viewCount');

            // Get rating and reviews
            const rating = await this.getProductRating(product.id);
            const reviews = await this.getProductReviews(product.id, { limit: 5 });

            // Check if in stock
            const stockInfo = await InventoryService.checkStock(product.id);

            // Get related products
            const relatedProducts = await this.getRelatedProducts(product.id, product.categoryId);

            return {
                ...product.toJSON(),
                rating,
                reviews,
                stock: stockInfo,
                relatedProducts
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create new product
     */
    static async createProduct(productData, images = []) {
        try {
            // Generate slug from name
            const slug = productData.name
                .toLowerCase()
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, '-');

            // Check if slug exists
            const existingProduct = await Product.findOne({ where: { slug } });
            if (existingProduct) {
                throw new AppError('Produk dengan nama serupa sudah ada', 400);
            }

            // Create product
            const product = await Product.create({
                ...productData,
                slug,
                sku: productData.sku || this.generateSKU()
            });

            // Upload images if provided
            if (images.length > 0) {
                await this.uploadProductImages(product.id, images);
            }

            // Create initial inventory record
            await InventoryService.createInventoryRecord({
                productId: product.id,
                initialStock: productData.stock || 0,
                type: 'INITIAL',
                notes: 'Initial stock from product creation'
            });

            // Log activity
            const AuditLog = require('../models/AuditLog');
            await AuditLog.create({
                userId: productData.createdBy,
                action: 'CREATE_PRODUCT',
                description: 'Created new product',
                metadata: JSON.stringify({ productId: product.id, name: product.name })
            });

            return product;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update product
     */
    static async updateProduct(productId, updateData, userId) {
        try {
            const product = await Product.findByPk(productId);

            if (!product) {
                throw new AppError('Produk tidak ditemukan', 404);
            }

            // Generate new slug if name changed
            if (updateData.name && updateData.name !== product.name) {
                const slug = updateData.name
                    .toLowerCase()
                    .replace(/[^\w\s]/gi, '')
                    .replace(/\s+/g, '-');

                // Check if new slug exists
                const existingProduct = await Product.findOne({
                    where: { slug, id: { $ne: productId } }
                });

                if (existingProduct) {
                    throw new AppError('Produk dengan nama serupa sudah ada', 400);
                }

                updateData.slug = slug;
            }

            // Track stock changes for inventory
            const oldStock = product.stock;
            await product.update(updateData);

            // Log stock changes
            if (updateData.stock !== undefined && updateData.stock !== oldStock) {
                const stockChange = updateData.stock - oldStock;
                await InventoryService.createInventoryRecord({
                    productId,
                    quantity: stockChange,
                    type: stockChange > 0 ? 'STOCK_IN' : 'STOCK_OUT',
                    notes: 'Stock adjustment from product update',
                    userId
                });
            }

            // Log activity
            const AuditLog = require('../models/AuditLog');
            await AuditLog.create({
                userId,
                action: 'UPDATE_PRODUCT',
                description: 'Updated product',
                metadata: JSON.stringify({ productId, changes: Object.keys(updateData) })
            });

            return product;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete product (soft delete)
     */
    static async deleteProduct(productId, userId) {
        try {
            const product = await Product.findByPk(productId);

            if (!product) {
                throw new AppError('Produk tidak ditemukan', 404);
            }

            // Soft delete
            product.isActive = false;
            product.deletedAt = new Date();
            await product.save();

            // Log activity
            const AuditLog = require('../models/AuditLog');
            await AuditLog.create({
                userId,
                action: 'DELETE_PRODUCT',
                description: 'Deleted product',
                metadata: JSON.stringify({ productId, name: product.name })
            });

            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Upload product images
     */
    static async uploadProductImages(productId, images) {
        try {
            const uploadedImages = [];

            for (const image of images) {
                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(image.path, {
                    folder: `products/${productId}`,
                    transformation: [
                        { width: 800, height: 800, crop: 'limit' },
                        { quality: 'auto' },
                        { format: 'webp' }
                    ]
                });

                // Create thumbnail
                const thumbnailResult = await cloudinary.uploader.upload(image.path, {
                    folder: `products/${productId}/thumbnails`,
                    width: 300,
                    height: 300,
                    crop: 'fill',
                    quality: 'auto',
                    format: 'webp'
                });

                const productImage = await ProductImage.create({
                    productId,
                    imageUrl: result.secure_url,
                    thumbnailUrl: thumbnailResult.secure_url,
                    altText: `Image of product ${productId}`,
                    sortOrder: uploadedImages.length,
                    publicId: result.public_id,
                    thumbnailPublicId: thumbnailResult.public_id
                });

                uploadedImages.push(productImage);
            }

            return uploadedImages;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete product image
     */
    static async deleteProductImage(imageId, userId) {
        try {
            const image = await ProductImage.findByPk(imageId);

            if (!image) {
                throw new AppError('Gambar tidak ditemukan', 404);
            }

            // Delete from Cloudinary
            await cloudinary.uploader.destroy(image.publicId);
            if (image.thumbnailPublicId) {
                await cloudinary.uploader.destroy(image.thumbnailPublicId);
            }

            await image.destroy();

            // Log activity
            const AuditLog = require('../models/AuditLog');
            await AuditLog.create({
                userId,
                action: 'DELETE_PRODUCT_IMAGE',
                description: 'Deleted product image',
                metadata: JSON.stringify({ imageId, productId: image.productId })
            });

            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get product rating
     */
    static async getProductRating(productId) {
        try {
            const reviews = await Review.findAll({
                where: { productId, status: 'approved' },
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('rating')), 'average'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                raw: true
            });

            return {
                average: parseFloat(reviews[0]?.average || 0).toFixed(1),
                count: parseInt(reviews[0]?.count || 0)
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get product reviews
     */
    static async getProductReviews(productId, filters = {}) {
        try {
            const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = filters;
            const offset = (page - 1) * limit;

            const reviews = await Review.findAndCountAll({
                where: { productId, status: 'approved' },
                include: [{
                    model: require('../models/User'),
                    attributes: ['id', 'name', 'avatar']
                }],
                order: [[sortBy, sortOrder]],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                reviews: reviews.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: reviews.count,
                    pages: Math.ceil(reviews.count / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Add product review
     */
    static async addReview(userId, productId, reviewData) {
        try {
            // Check if user has purchased the product
            const OrderItem = require('../models/OrderItem');
            const Order = require('../models/Order');

            const hasPurchased = await OrderItem.findOne({
                include: [{
                    model: Order,
                    where: { userId, status: 'delivered' }
                }],
                where: { productId }
            });

            if (!hasPurchased) {
                throw new AppError('Anda harus membeli produk ini sebelum memberikan review', 400);
            }

            // Check if user already reviewed this product
            const existingReview = await Review.findOne({
                where: { userId, productId }
            });

            if (existingReview) {
                throw new AppError('Anda sudah memberikan review untuk produk ini', 400);
            }

            const review = await Review.create({
                ...reviewData,
                userId,
                productId,
                status: 'pending' // Admin will approve
            });

            // Update product average rating
            await this.updateProductRating(productId);

            // Notify admin about new review
            const NotificationService = require('./notification.service');
            await NotificationService.notifyAdminNewReview(review);

            return review;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update product rating
     */
    static async updateProductRating(productId) {
        try {
            const ratingData = await this.getProductRating(productId);

            await Product.update(
                {
                    averageRating: parseFloat(ratingData.average),
                    reviewCount: ratingData.count
                },
                { where: { id: productId } }
            );
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get related products
     */
    static async getRelatedProducts(productId, categoryId, limit = 4) {
        try {
            const products = await Product.findAll({
                where: {
                    categoryId,
                    id: { $ne: productId },
                    isActive: true,
                    stock: { $gt: 0 }
                },
                include: [{
                    model: ProductImage,
                    as: 'images',
                    limit: 1
                }],
                order: sequelize.random(),
                limit
            });

            return products;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Search products
     */
    static async searchProducts(query, limit = 10) {
        try {
            const products = await Product.findAll({
                where: {
                    isActive: true,
                    [Op.or]: [
                        { name: { [Op.like]: `%${query}%` } },
                        { description: { [Op.like]: `%${query}%` } },
                        { sku: { [Op.like]: `%${query}%` } }
                    ]
                },
                include: [
                    {
                        model: ProductImage,
                        as: 'images',
                        limit: 1
                    },
                    {
                        model: Category,
                        attributes: ['id', 'name']
                    }
                ],
                limit
            });

            return products;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get featured products
     */
    static async getFeaturedProducts(limit = 8) {
        try {
            const products = await Product.findAll({
                where: {
                    isActive: true,
                    isFeatured: true,
                    stock: { $gt: 0 }
                },
                include: [{
                    model: ProductImage,
                    as: 'images',
                    limit: 1
                }],
                order: [['createdAt', 'DESC']],
                limit
            });

            return products;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get products on sale
     */
    static async getProductsOnSale(limit = 8) {
        try {
            const products = await Product.findAll({
                where: {
                    isActive: true,
                    discountPrice: { $ne: null },
                    stock: { $gt: 0 }
                },
                include: [{
                    model: ProductImage,
                    as: 'images',
                    limit: 1
                }],
                order: [['discountPercentage', 'DESC']],
                limit
            });

            return products;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Generate SKU
     */
    static generateSKU() {
        const prefix = 'MC';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }

    /**
     * Get product variants
     */
    static async getProductVariants(productId) {
        try {
            const variants = await ProductVariant.findAll({
                where: { productId, isActive: true },
                order: [['sortOrder', 'ASC']]
            });

            return variants;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update stock quantity
     */
    static async updateStock(productId, quantity, type = 'ADJUSTMENT', notes = '', userId = null) {
        try {
            const product = await Product.findByPk(productId);

            if (!product) {
                throw new AppError('Produk tidak ditemukan', 404);
            }

            const newStock = product.stock + quantity;
            if (newStock < 0) {
                throw new AppError('Stok tidak mencukupi', 400);
            }

            product.stock = newStock;
            await product.save();

            // Create inventory record
            await InventoryService.createInventoryRecord({
                productId,
                quantity,
                type,
                notes,
                userId
            });

            // Send low stock alert if needed
            if (newStock <= product.lowStockThreshold) {
                await NotificationService.sendLowStockAlert(product);
            }

            return {
                productId,
                oldStock: product.stock - quantity,
                newStock,
                change: quantity
            };
        } catch (error) {
            throw error;
        }
    }
}

export default ProductService;
