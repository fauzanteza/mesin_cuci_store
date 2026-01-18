import { prisma } from '../config/database.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    // Build filter object
    const where = {};

    if (req.query.search) {
        where.name = {
            contains: req.query.search,
            // mode: 'insensitive', // MySQL default is often insensitive, but Prisma might need this if configured
        };
    }

    if (req.query.category) {
        where.category = {
            slug: req.query.category,
        };
    }

    if (req.query.brand) {
        where.brand = {
            slug: req.query.brand,
        };
    }

    if (req.query.minPrice || req.query.maxPrice) {
        where.price = {};
        if (req.query.minPrice) where.price.gte = Number(req.query.minPrice);
        if (req.query.maxPrice) where.price.lte = Number(req.query.maxPrice);
    }

    // Determine sorting
    let orderBy = { createdAt: 'desc' };
    if (req.query.sort) {
        switch (req.query.sort) {
            case 'price_asc':
                orderBy = { price: 'asc' };
                break;
            case 'price_desc':
                orderBy = { price: 'desc' };
                break;
            case 'newest':
                orderBy = { createdAt: 'desc' };
                break;
            // Add 'popular' via reviewCount or similar if needed
        }
    }

    const count = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
        where,
        orderBy,
        take: pageSize,
        skip: pageSize * (page - 1),
        include: {
            images: true,
            category: true,
            brand: true,
        },
    });

    res.json({
        success: true,
        data: products,
        meta: {
            page,
            pages: Math.ceil(count / pageSize),
            total: count,
        },
    });
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    const product = await prisma.product.findFirst({
        where: {
            OR: [
                { id: req.params.id },
                { slug: req.params.id }
            ]
        },
        include: {
            images: true,
            category: true,
            brand: true,
            variants: true,
            reviews: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true
                        }
                    }
                },
                take: 5
            }
        },
    });

    if (product) {
        res.json({ success: true, data: product });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    // Basic implementation - in real app would handle image uploads via middleware first
    const {
        name, slug, sku, price, categoryId, brandId, description
    } = req.body;

    const product = await prisma.product.create({
        data: {
            name,
            slug,
            sku,
            price,
            categoryId,
            brandId,
            description,
            // Add other fields as needed
        },
    });

    res.status(201).json({ success: true, data: product });
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    const { name, price, description, stock } = req.body;

    // Check if exists
    const exists = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!exists) {
        res.status(404);
        throw new Error('Product not found');
    }

    const product = await prisma.product.update({
        where: { id: req.params.id },
        data: {
            name,
            price,
            description,
            stock
        },
    });

    res.json({ success: true, data: product });
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });

    if (product) {
        await prisma.product.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};
