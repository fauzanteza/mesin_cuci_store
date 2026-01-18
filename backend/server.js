const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if not exists
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
    fs.mkdirSync('./uploads/products');
    fs.mkdirSync('./uploads/users');
}

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'product_images') {
            cb(null, './uploads/products/');
        } else if (file.fieldname === 'avatar') {
            cb(null, './uploads/users/');
        } else {
            cb(null, './uploads/');
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mesin_cuci_store',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Connected to MySQL database');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    });

// JWT Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        // Check if user exists
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone || null, 'customer']
        );

        // Generate token
        const token = jwt.sign(
            {
                id: result.insertId,
                email,
                name,
                role: 'customer'
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: result.insertId,
                name,
                email,
                phone,
                role: 'customer'
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // For development/testing with plain passwords in database
        const isPlainPasswordValid = password === user.password;

        if (!isPasswordValid && !isPlainPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await pool.execute(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        // Generate token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, name, email, phone, role, avatar, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== PRODUCT ROUTES ====================

// Get all products with pagination and filtering
app.get('/api/products', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            brand,
            min_price,
            max_price,
            search,
            sort = 'newest'
        } = req.query;

        const offset = (page - 1) * limit;
        let query = `
            SELECT p.*, 
                   c.name as category_name,
                   b.name as brand_name,
                   (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.is_available = 1
        `;
        const params = [];

        // Add filters
        if (category) {
            query += ' AND p.category_id = ?';
            params.push(category);
        }
        if (brand) {
            query += ' AND p.brand_id = ?';
            params.push(brand);
        }
        if (min_price) {
            query += ' AND p.price >= ?';
            params.push(min_price);
        }
        if (max_price) {
            query += ' AND p.price <= ?';
            params.push(max_price);
        }
        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Add sorting
        switch (sort) {
            case 'price_asc':
                query += ' ORDER BY p.price ASC';
                break;
            case 'price_desc':
                query += ' ORDER BY p.price DESC';
                break;
            case 'popular':
                query += ' ORDER BY p.review_count DESC, p.rating DESC';
                break;
            case 'newest':
            default:
                query += ' ORDER BY p.created_at DESC';
        }

        // Add pagination
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        // Execute query
        const [products] = await pool.execute(query, params);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE p.is_available = 1';
        const countParams = [];

        if (category) {
            countQuery += ' AND p.category_id = ?';
            countParams.push(category);
        }
        if (brand) {
            countQuery += ' AND p.brand_id = ?';
            countParams.push(brand);
        }
        if (min_price) {
            countQuery += ' AND p.price >= ?';
            countParams.push(min_price);
        }
        if (max_price) {
            countQuery += ' AND p.price <= ?';
            countParams.push(max_price);
        }
        if (search) {
            countQuery += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)';
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm);
        }

        const [countResult] = await pool.execute(countQuery, countParams);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await pool.execute(
            `SELECT p.*, 
                    c.name as category_name,
                    b.name as brand_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN brands b ON p.brand_id = b.id
             WHERE p.id = ?`,
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Get product images
        const [images] = await pool.execute(
            'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order',
            [id]
        );

        // Get product variants
        const [variants] = await pool.execute(
            'SELECT * FROM product_variants WHERE product_id = ?',
            [id]
        );

        // Get related products
        const [related] = await pool.execute(
            `SELECT p.*, 
                    (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
             FROM products p
             WHERE p.category_id = ? AND p.id != ? AND p.is_available = 1
             LIMIT 4`,
            [products[0].category_id, id]
        );

        // Get reviews
        const [reviews] = await pool.execute(
            `SELECT r.*, u.name as user_name, u.avatar
             FROM reviews r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ?
             ORDER BY r.created_at DESC`,
            [id]
        );

        const product = {
            ...products[0],
            images,
            variants,
            related_products: related,
            reviews
        };

        // Increment product view count
        await pool.execute(
            'UPDATE products SET view_count = view_count + 1 WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Create product (Admin only)
app.post('/api/products', authenticateToken, authorizeAdmin, upload.array('product_images', 10), async (req, res) => {
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
            sku,
            warranty_months,
            weight_kg,
            specifications,
            features,
            dimensions,
            seo_title,
            seo_description,
            seo_keywords
        } = req.body;

        // Validate required fields
        if (!name || !price || !category_id || !sku) {
            return res.status(400).json({
                success: false,
                message: 'Name, price, category, and SKU are required'
            });
        }

        // Generate slug from name
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Insert product
            const [productResult] = await connection.execute(
                `INSERT INTO products (
                    name, slug, sku, description, short_description, 
                    price, compare_price, cost, stock, category_id, 
                    brand_id, warranty_months, weight_kg, specifications, 
                    features, dimensions, seo_title, seo_description, seo_keywords
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name, slug, sku, description || null, short_description || null,
                    parseFloat(price), compare_price ? parseFloat(compare_price) : null,
                    cost ? parseFloat(cost) : null, parseInt(stock || 0), parseInt(category_id),
                    brand_id ? parseInt(brand_id) : null, warranty_months ? parseInt(warranty_months) : 12,
                    weight_kg ? parseFloat(weight_kg) : null,
                    specifications || null, features || null, dimensions || null,
                    seo_title || null, seo_description || null, seo_keywords || null
                ]
            );

            const productId = productResult.insertId;

            // Handle product images
            if (req.files && req.files.length > 0) {
                const imageValues = req.files.map((file, index) => [
                    productId,
                    `/uploads/products/${file.filename}`,
                    file.originalname,
                    index === 0 ? 1 : 0, // First image as primary
                    index
                ]);

                await connection.execute(
                    'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES ?',
                    [imageValues]
                );
            }

            // Handle variants if provided
            if (req.body.variants) {
                const variants = JSON.parse(req.body.variants);
                if (Array.isArray(variants) && variants.length > 0) {
                    const variantValues = variants.map(variant => [
                        productId,
                        variant.variant_name,
                        variant.variant_value,
                        variant.sku || `${sku}-${variant.variant_value.toLowerCase()}`,
                        variant.price ? parseFloat(variant.price) : null,
                        parseInt(variant.stock || 0)
                    ]);

                    await connection.execute(
                        'INSERT INTO product_variants (product_id, variant_name, variant_value, sku, price, stock) VALUES ?',
                        [variantValues]
                    );
                }
            }

            await connection.commit();

            // Get created product with details
            const [products] = await pool.execute(
                `SELECT p.*, 
                        c.name as category_name,
                        b.name as brand_name
                 FROM products p
                 LEFT JOIN categories c ON p.category_id = c.id
                 LEFT JOIN brands b ON p.brand_id = b.id
                 WHERE p.id = ?`,
                [productId]
            );

            const [images] = await pool.execute(
                'SELECT * FROM product_images WHERE product_id = ?',
                [productId]
            );

            const [variants] = await pool.execute(
                'SELECT * FROM product_variants WHERE product_id = ?',
                [productId]
            );

            const product = {
                ...products[0],
                images,
                variants
            };

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update product (Admin only)
app.put('/api/products/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if product exists
        const [existing] = await pool.execute(
            'SELECT id FROM products WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Build update query dynamically
        const fields = [];
        const values = [];

        Object.keys(updateData).forEach(key => {
            if (key !== 'id' && updateData[key] !== undefined) {
                fields.push(`${key} = ?`);

                // Handle numeric values
                if (['price', 'compare_price', 'cost', 'stock', 'category_id', 'brand_id', 'warranty_months', 'weight_kg'].includes(key)) {
                    values.push(updateData[key] ? parseFloat(updateData[key]) : null);
                } else {
                    values.push(updateData[key]);
                }
            }
        });

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        values.push(id);

        await pool.execute(
            `UPDATE products SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );

        // Get updated product
        const [products] = await pool.execute(
            `SELECT p.*, 
                    c.name as category_name,
                    b.name as brand_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN brands b ON p.brand_id = b.id
             WHERE p.id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: products[0]
        });

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Delete product (Admin only)
app.delete('/api/products/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if product exists
        const [existing] = await pool.execute(
            'SELECT id FROM products WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Soft delete (set is_available to false)
        await pool.execute(
            'UPDATE products SET is_available = 0, updated_at = NOW() WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== CATEGORY ROUTES ====================

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await pool.execute(
            `SELECT c.*, 
                    COUNT(p.id) as product_count
             FROM categories c
             LEFT JOIN products p ON c.id = p.category_id AND p.is_available = 1
             GROUP BY c.id
             ORDER BY c.name`
        );

        res.json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== BRAND ROUTES ====================

// Get all brands
app.get('/api/brands', async (req, res) => {
    try {
        const [brands] = await pool.execute(
            `SELECT b.*, 
                    COUNT(p.id) as product_count
             FROM brands b
             LEFT JOIN products p ON b.id = p.brand_id AND p.is_available = 1
             GROUP BY b.id
             ORDER BY b.name`
        );

        res.json({
            success: true,
            data: brands
        });

    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== CART ROUTES ====================

// Get user cart
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const [cartItems] = await pool.execute(
            `SELECT ci.*, 
                    p.name as product_name,
                    p.price as product_price,
                    p.image_url as product_image,
                    p.stock as product_stock,
                    pv.variant_name,
                    pv.variant_value,
                    pv.price as variant_price
             FROM cart_items ci
             LEFT JOIN products p ON ci.product_id = p.id
             LEFT JOIN product_variants pv ON ci.variant_id = pv.id
             WHERE ci.user_id = ?`,
            [req.user.id]
        );

        // Calculate totals
        let subtotal = 0;
        const items = cartItems.map(item => {
            const price = item.variant_price || item.product_price;
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;

            return {
                ...item,
                price,
                total: itemTotal
            };
        });

        res.json({
            success: true,
            data: {
                items,
                subtotal,
                item_count: cartItems.length
            }
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Add to cart
app.post('/api/cart', authenticateToken, async (req, res) => {
    try {
        const { product_id, variant_id, quantity = 1 } = req.body;

        // Validate product exists and is available
        const [products] = await pool.execute(
            'SELECT id, stock, is_available FROM products WHERE id = ?',
            [product_id]
        );

        if (products.length === 0 || !products[0].is_available) {
            return res.status(404).json({
                success: false,
                message: 'Product not available'
            });
        }

        // Check variant if provided
        if (variant_id) {
            const [variants] = await pool.execute(
                'SELECT id, stock FROM product_variants WHERE id = ?',
                [variant_id]
            );

            if (variants.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Variant not found'
                });
            }
        }

        // Check if item already in cart
        const [existing] = await pool.execute(
            `SELECT id, quantity FROM cart_items 
             WHERE user_id = ? AND product_id = ? AND variant_id ${variant_id ? '= ?' : 'IS NULL'}`,
            [req.user.id, product_id, ...(variant_id ? [variant_id] : [])]
        );

        if (existing.length > 0) {
            // Update quantity
            const newQuantity = existing[0].quantity + parseInt(quantity);
            await pool.execute(
                'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
                [newQuantity, existing[0].id]
            );
        } else {
            // Add new item
            await pool.execute(
                'INSERT INTO cart_items (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
                [req.user.id, product_id, variant_id || null, parseInt(quantity)]
            );
        }

        // Get updated cart count
        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            message: 'Added to cart',
            cart_count: countResult[0].count
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update cart item
app.put('/api/cart/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        // Check if cart item exists and belongs to user
        const [existing] = await pool.execute(
            'SELECT id FROM cart_items WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            await pool.execute(
                'DELETE FROM cart_items WHERE id = ?',
                [id]
            );
        } else {
            // Update quantity
            await pool.execute(
                'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
                [parseInt(quantity), id]
            );
        }

        res.json({
            success: true,
            message: 'Cart updated'
        });

    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Remove from cart
app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.execute(
            'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        res.json({
            success: true,
            message: 'Removed from cart'
        });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Clear cart
app.delete('/api/cart', authenticateToken, async (req, res) => {
    try {
        await pool.execute(
            'DELETE FROM cart_items WHERE user_id = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            message: 'Cart cleared'
        });

    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== ORDER ROUTES ====================

// Create order
app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const { address_id, payment_method, shipping_method, notes, items } = req.body;

        // Validate required fields
        if (!address_id || !payment_method || !shipping_method || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Address, payment method, shipping method, and items are required'
            });
        }

        // Get user address
        const [addresses] = await pool.execute(
            'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
            [address_id, req.user.id]
        );

        if (addresses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            let subtotal = 0;
            const orderItems = [];

            // Validate each item and calculate totals
            for (const item of items) {
                const { product_id, variant_id, quantity } = item;

                // Get product details
                const [products] = await connection.execute(
                    'SELECT id, name, price, stock FROM products WHERE id = ? AND is_available = 1',
                    [product_id]
                );

                if (products.length === 0) {
                    throw new Error(`Product ${product_id} not available`);
                }

                const product = products[0];

                // Check variant if provided
                let variant = null;
                if (variant_id) {
                    const [variants] = await connection.execute(
                        'SELECT id, variant_name, variant_value, price, stock FROM product_variants WHERE id = ?',
                        [variant_id]
                    );

                    if (variants.length === 0) {
                        throw new Error(`Variant ${variant_id} not found`);
                    }
                    variant = variants[0];
                }

                // Check stock
                const stock = variant ? variant.stock : product.stock;
                if (stock < quantity) {
                    throw new Error(`Insufficient stock for product ${product.name}`);
                }

                // Calculate price
                const price = variant ? variant.price : product.price;
                const itemSubtotal = price * quantity;
                subtotal += itemSubtotal;

                orderItems.push({
                    product_id,
                    variant_id,
                    product_name: product.name,
                    price,
                    quantity,
                    subtotal: itemSubtotal
                });

                // Reduce stock
                if (variant) {
                    await connection.execute(
                        'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
                        [quantity, variant_id]
                    );
                } else {
                    await connection.execute(
                        'UPDATE products SET stock = stock - ? WHERE id = ?',
                        [quantity, product_id]
                    );
                }
            }

            // Calculate shipping cost (simplified)
            const shipping_cost = 25000; // Fixed for now
            const tax = subtotal * 0.10; // 10% tax
            const total = subtotal + shipping_cost + tax;

            // Generate order number
            const order_number = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

            // Create order
            const [orderResult] = await connection.execute(
                `INSERT INTO orders (
                    order_number, user_id, address_id, 
                    subtotal, shipping_cost, tax, total,
                    payment_method, shipping_method, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    order_number, req.user.id, address_id,
                    subtotal, shipping_cost, tax, total,
                    payment_method, shipping_method, notes || null
                ]
            );

            const orderId = orderResult.insertId;

            // Add order items
            for (const item of orderItems) {
                await connection.execute(
                    `INSERT INTO order_items (
                        order_id, product_id, variant_id, 
                        product_name, price, quantity, subtotal
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        orderId, item.product_id, item.variant_id || null,
                        item.product_name, item.price, item.quantity, item.subtotal
                    ]
                );
            }

            // Add order status history
            await connection.execute(
                'INSERT INTO order_status_history (order_id, status) VALUES (?, ?)',
                [orderId, 'pending']
            );

            // Clear user's cart
            await connection.execute(
                'DELETE FROM cart_items WHERE user_id = ?',
                [req.user.id]
            );

            await connection.commit();

            // Get created order with details
            const [orders] = await connection.execute(
                `SELECT o.*, 
                        a.*,
                        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
                 FROM orders o
                 LEFT JOIN addresses a ON o.address_id = a.id
                 WHERE o.id = ?`,
                [orderId]
            );

            const [orderItemsResult] = await connection.execute(
                `SELECT oi.*, 
                        p.image_url as product_image
                 FROM order_items oi
                 LEFT JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [orderId]
            );

            const order = {
                ...orders[0],
                items: orderItemsResult
            };

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: order
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Create order error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// Get user orders
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT o.*, 
                   COUNT(oi.id) as item_count,
                   (SELECT status FROM order_status_history WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as current_status
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ?
        `;
        const params = [req.user.id];

        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }

        query += ` GROUP BY o.id
                   ORDER BY o.created_at DESC
                   LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [orders] = await pool.execute(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
        const countParams = [req.user.id];

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        const [countResult] = await pool.execute(countQuery, countParams);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get single order
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [orders] = await pool.execute(
            `SELECT o.*, 
                    a.*,
                    p.transaction_id,
                    p.payment_method as payment_type,
                    p.status as payment_status,
                    p.paid_at
             FROM orders o
             LEFT JOIN addresses a ON o.address_id = a.id
             LEFT JOIN payments p ON o.id = p.order_id
             WHERE o.id = ? AND o.user_id = ?`,
            [id, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const [orderItems] = await pool.execute(
            `SELECT oi.*, 
                    p.image_url as product_image,
                    pv.variant_name,
                    pv.variant_value
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             LEFT JOIN product_variants pv ON oi.variant_id = pv.id
             WHERE oi.order_id = ?`,
            [id]
        );

        const [statusHistory] = await pool.execute(
            'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at',
            [id]
        );

        const order = {
            ...orders[0],
            items: orderItems,
            status_history: statusHistory
        };

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Cancel order
app.put('/api/orders/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Check if order exists and belongs to user
        const [orders] = await pool.execute(
            'SELECT id, status FROM orders WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const order = orders[0];

        // Check if order can be cancelled
        if (!['pending', 'processing'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }

        // Update order status
        await pool.execute(
            'UPDATE orders SET status = "cancelled", cancel_reason = ?, cancelled_at = NOW() WHERE id = ?',
            [reason || null, id]
        );

        // Add status history
        await pool.execute(
            'INSERT INTO order_status_history (order_id, status, notes) VALUES (?, ?, ?)',
            [id, 'cancelled', reason || 'Cancelled by customer']
        );

        // Return stock
        const [orderItems] = await pool.execute(
            'SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?',
            [id]
        );

        for (const item of orderItems) {
            if (item.variant_id) {
                await pool.execute(
                    'UPDATE product_variants SET stock = stock + ? WHERE id = ?',
                    [item.quantity, item.variant_id]
                );
            } else {
                await pool.execute(
                    'UPDATE products SET stock = stock + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }
        }

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });

    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== ADDRESS ROUTES ====================

// Get user addresses
app.get('/api/addresses', authenticateToken, async (req, res) => {
    try {
        const [addresses] = await pool.execute(
            'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
            [req.user.id]
        );

        res.json({
            success: true,
            data: addresses
        });

    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Add address
app.post('/api/addresses', authenticateToken, async (req, res) => {
    try {
        const {
            label,
            recipient_name,
            phone,
            address_line1,
            address_line2,
            city,
            province,
            postal_code,
            country = 'Indonesia',
            is_default
        } = req.body;

        // Validate required fields
        if (!label || !recipient_name || !phone || !address_line1 || !city || !province || !postal_code) {
            return res.status(400).json({
                success: false,
                message: 'All address fields are required'
            });
        }

        // If setting as default, unset other defaults
        if (is_default) {
            await pool.execute(
                'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
                [req.user.id]
            );
        }

        // Insert new address
        const [result] = await pool.execute(
            `INSERT INTO addresses (
                user_id, label, recipient_name, phone, 
                address_line1, address_line2, city, 
                province, postal_code, country, is_default
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id, label, recipient_name, phone,
                address_line1, address_line2 || null, city,
                province, postal_code, country, is_default ? 1 : 0
            ]
        );

        const [newAddress] = await pool.execute(
            'SELECT * FROM addresses WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: newAddress[0]
        });

    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update address
app.put('/api/addresses/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if address exists and belongs to user
        const [existing] = await pool.execute(
            'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // If setting as default, unset other defaults
        if (updateData.is_default) {
            await pool.execute(
                'UPDATE addresses SET is_default = 0 WHERE user_id = ? AND id != ?',
                [req.user.id, id]
            );
        }

        // Build update query
        const fields = [];
        const values = [];

        Object.keys(updateData).forEach(key => {
            if (key !== 'id' && updateData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
        });

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        values.push(id, req.user.id);

        await pool.execute(
            `UPDATE addresses SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ? AND user_id = ?`,
            values
        );

        // Get updated address
        const [addresses] = await pool.execute(
            'SELECT * FROM addresses WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Address updated successfully',
            data: addresses[0]
        });

    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Delete address
app.delete('/api/addresses/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if address exists and belongs to user
        const [existing] = await pool.execute(
            'SELECT id, is_default FROM addresses WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Don't allow deletion if it's the only address
        const [allAddresses] = await pool.execute(
            'SELECT COUNT(*) as count FROM addresses WHERE user_id = ?',
            [req.user.id]
        );

        if (allAddresses[0].count <= 1) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete the only address'
            });
        }

        await pool.execute(
            'DELETE FROM addresses WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        // If deleted address was default, set another as default
        if (existing[0].is_default) {
            const [newDefault] = await pool.execute(
                'SELECT id FROM addresses WHERE user_id = ? LIMIT 1',
                [req.user.id]
            );

            if (newDefault.length > 0) {
                await pool.execute(
                    'UPDATE addresses SET is_default = 1 WHERE id = ?',
                    [newDefault[0].id]
                );
            }
        }

        res.json({
            success: true,
            message: 'Address deleted successfully'
        });

    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== REVIEW ROUTES ====================

// Add review
app.post('/api/reviews', authenticateToken, async (req, res) => {
    try {
        const { product_id, order_item_id, rating, title, comment } = req.body;

        // Validate required fields
        if (!product_id || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Product ID and rating (1-5) are required'
            });
        }

        // Check if user has purchased the product
        if (order_item_id) {
            const [purchased] = await pool.execute(
                `SELECT oi.id FROM order_items oi
                 JOIN orders o ON oi.order_id = o.id
                 WHERE oi.id = ? AND o.user_id = ? AND o.status = 'delivered'`,
                [order_item_id, req.user.id]
            );

            if (purchased.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only review products you have purchased'
                });
            }
        }

        // Check if already reviewed
        const [existing] = await pool.execute(
            'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        // Insert review
        const [result] = await pool.execute(
            `INSERT INTO reviews (
                user_id, product_id, order_item_id, 
                rating, title, comment, is_verified
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id, product_id, order_item_id || null,
                parseInt(rating), title || null, comment || null,
                order_item_id ? 1 : 0
            ]
        );

        // Update product rating (trigger will handle this, but we'll do it here too)
        const [avgRating] = await pool.execute(
            'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ?',
            [product_id]
        );

        await pool.execute(
            'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
            [avgRating[0].avg_rating || 0, avgRating[0].count, product_id]
        );

        // Get created review with user info
        const [reviews] = await pool.execute(
            `SELECT r.*, u.name as user_name, u.avatar
             FROM reviews r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: reviews[0]
        });

    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get product reviews
app.get('/api/products/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10, rating } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT r.*, u.name as user_name, u.avatar
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
        `;
        const params = [id];

        if (rating) {
            query += ' AND r.rating = ?';
            params.push(parseInt(rating));
        }

        query += ` ORDER BY r.created_at DESC
                   LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [reviews] = await pool.execute(query, params);

        // Get total count and average
        let countQuery = 'SELECT COUNT(*) as total, AVG(rating) as average FROM reviews WHERE product_id = ?';
        const countParams = [id];

        if (rating) {
            countQuery += ' AND rating = ?';
            countParams.push(parseInt(rating));
        }

        const [stats] = await pool.execute(countQuery, countParams);
        const total = stats[0].total;
        const average = stats[0].average || 0;
        const totalPages = Math.ceil(total / limit);

        // Get rating distribution
        const [distribution] = await pool.execute(
            `SELECT rating, COUNT(*) as count 
             FROM reviews 
             WHERE product_id = ?
             GROUP BY rating
             ORDER BY rating DESC`,
            [id]
        );

        res.json({
            success: true,
            data: reviews,
            stats: {
                average: parseFloat(average).toFixed(1),
                total,
                distribution
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== WISHLIST ROUTES ====================

// Get user wishlist
app.get('/api/wishlist', authenticateToken, async (req, res) => {
    try {
        const [wishlist] = await pool.execute(
            `SELECT w.*, 
                    p.name as product_name,
                    p.price as product_price,
                    p.image_url as product_image,
                    p.stock as product_stock,
                    p.rating,
                    p.review_count
             FROM wishlist_items w
             LEFT JOIN products p ON w.product_id = p.id
             WHERE w.user_id = ?
             ORDER BY w.created_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: wishlist
        });

    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Add to wishlist
app.post('/api/wishlist', authenticateToken, async (req, res) => {
    try {
        const { product_id } = req.body;

        // Check if product exists
        const [products] = await pool.execute(
            'SELECT id FROM products WHERE id = ? AND is_available = 1',
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if already in wishlist
        const [existing] = await pool.execute(
            'SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        // Add to wishlist
        await pool.execute(
            'INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)',
            [req.user.id, product_id]
        );

        res.json({
            success: true,
            message: 'Added to wishlist'
        });

    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Remove from wishlist
app.delete('/api/wishlist/:product_id', authenticateToken, async (req, res) => {
    try {
        const { product_id } = req.params;

        await pool.execute(
            'DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?',
            [req.user.id, product_id]
        );

        res.json({
            success: true,
            message: 'Removed from wishlist'
        });

    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== ADMIN ROUTES ====================

// Get dashboard stats (Admin only)
app.get('/api/admin/dashboard', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        // Get stats for different time periods
        const today = new Date().toISOString().split('T')[0];
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Today's stats
        const [todayStats] = await pool.execute(
            `SELECT 
                COUNT(*) as orders_today,
                SUM(total) as revenue_today,
                AVG(total) as avg_order_today
             FROM orders 
             WHERE DATE(created_at) = ?`,
            [today]
        );

        // This week's stats
        const [weekStats] = await pool.execute(
            `SELECT 
                COUNT(*) as orders_week,
                SUM(total) as revenue_week,
                AVG(total) as avg_order_week
             FROM orders 
             WHERE created_at >= ?`,
            [lastWeek]
        );

        // This month's stats
        const [monthStats] = await pool.execute(
            `SELECT 
                COUNT(*) as orders_month,
                SUM(total) as revenue_month,
                AVG(total) as avg_order_month
             FROM orders 
             WHERE created_at >= ?`,
            [lastMonth]
        );

        // Total stats
        const [totalStats] = await pool.execute(
            `SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
                (SELECT COUNT(*) FROM products WHERE is_available = 1) as total_products,
                (SELECT COUNT(*) FROM orders) as total_orders,
                (SELECT SUM(total) FROM orders WHERE status = 'delivered') as total_revenue
             FROM dual`
        );

        // Recent orders
        const [recentOrders] = await pool.execute(
            `SELECT o.*, u.name as customer_name, u.email as customer_email
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC
             LIMIT 10`
        );

        // Top products
        const [topProducts] = await pool.execute(
            `SELECT p.id, p.name, p.sku, p.price,
                    COUNT(oi.id) as sold_count,
                    SUM(oi.quantity) as total_quantity,
                    SUM(oi.subtotal) as total_revenue
             FROM products p
             LEFT JOIN order_items oi ON p.id = oi.product_id
             LEFT JOIN orders o ON oi.order_id = o.id
             WHERE o.status = 'delivered'
             GROUP BY p.id
             ORDER BY total_quantity DESC
             LIMIT 10`
        );

        // Low stock products
        const [lowStock] = await pool.execute(
            `SELECT id, name, sku, price, stock
             FROM products 
             WHERE stock <= 5 AND stock > 0 AND is_available = 1
             ORDER BY stock ASC
             LIMIT 10`
        );

        // Chart data - daily revenue for last 7 days
        const [chartData] = await pool.execute(
            `SELECT 
                DATE(created_at) as date,
                COUNT(*) as order_count,
                SUM(total) as revenue
             FROM orders 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date`
        );

        res.json({
            success: true,
            data: {
                today: todayStats[0] || {},
                week: weekStats[0] || {},
                month: monthStats[0] || {},
                totals: totalStats[0] || {},
                recent_orders: recentOrders,
                top_products: topProducts,
                low_stock: lowStock,
                chart_data: chartData
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get all users (Admin only)
app.get('/api/admin/users', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT id, name, email, phone, role, 
                   created_at, last_login, is_active
            FROM users
            WHERE 1=1
        `;
        const params = [];

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        if (search) {
            query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ` ORDER BY created_at DESC
                   LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [users] = await pool.execute(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
        const countParams = [];

        if (role) {
            countQuery += ' AND role = ?';
            countParams.push(role);
        }

        if (search) {
            countQuery += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm);
        }

        const [countResult] = await pool.execute(countQuery, countParams);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Get user stats
        const [userStats] = await pool.execute(
            `SELECT 
                role,
                COUNT(*) as count,
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(DISTINCT DATE(created_at)) as active_days
             FROM users 
             GROUP BY role, DATE_FORMAT(created_at, '%Y-%m')
             ORDER BY month DESC`
        );

        res.json({
            success: true,
            data: users,
            stats: userStats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update user (Admin only)
app.put('/api/admin/users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role, is_active } = req.body;

        // Check if user exists
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user
        const updateData = {};
        if (role) updateData.role = role;
        if (is_active !== undefined) updateData.is_active = is_active;

        const fields = Object.keys(updateData).map(key => `${key} = ?`);
        const values = Object.values(updateData);

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        values.push(id);

        await pool.execute(
            `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );

        // Get updated user
        const [users] = await pool.execute(
            'SELECT id, name, email, phone, role, created_at, last_login, is_active FROM users WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'User updated successfully',
            data: users[0]
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get all orders (Admin only)
app.get('/api/admin/orders', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, start_date, end_date, search } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT o.*, 
                   u.name as customer_name,
                   u.email as customer_email,
                   u.phone as customer_phone,
                   COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }

        if (start_date) {
            query += ' AND DATE(o.created_at) >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND DATE(o.created_at) <= ?';
            params.push(end_date);
        }

        if (search) {
            query += ' AND (o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ` GROUP BY o.id
                   ORDER BY o.created_at DESC
                   LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [orders] = await pool.execute(query, params);

        // Get total count
        let countQuery = `
            SELECT COUNT(*) as total
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE 1=1
        `;
        const countParams = [];

        if (status) {
            countQuery += ' AND o.status = ?';
            countParams.push(status);
        }

        if (start_date) {
            countQuery += ' AND DATE(o.created_at) >= ?';
            countParams.push(start_date);
        }

        if (end_date) {
            countQuery += ' AND DATE(o.created_at) <= ?';
            countParams.push(end_date);
        }

        if (search) {
            countQuery += ' AND (o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm);
        }

        const [countResult] = await pool.execute(countQuery, countParams);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Get order stats
        const [orderStats] = await pool.execute(
            `SELECT 
                status,
                COUNT(*) as count,
                SUM(total) as revenue
             FROM orders 
             GROUP BY status
             ORDER BY FIELD(status, 'pending', 'processing', 'shipped', 'delivered', 'cancelled')`
        );

        res.json({
            success: true,
            data: orders,
            stats: orderStats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get admin orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update order status (Admin only)
app.put('/api/admin/orders/:id/status', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, tracking_number, notes } = req.body;

        // Check if order exists
        const [existing] = await pool.execute(
            'SELECT id, status FROM orders WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const order = existing[0];

        // Validate status transition
        const validTransitions = {
            'pending': ['processing', 'cancelled'],
            'processing': ['shipped', 'cancelled'],
            'shipped': ['delivered'],
            'delivered': [],
            'cancelled': []
        };

        if (!validTransitions[order.status]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from ${order.status} to ${status}`
            });
        }

        // Update order
        const updateData = { status };
        if (status === 'shipped' && tracking_number) {
            updateData.tracking_number = tracking_number;
            updateData.shipped_at = new Date();
        }
        if (status === 'delivered') {
            updateData.delivered_at = new Date();
        }
        if (status === 'cancelled') {
            updateData.cancelled_at = new Date();
            updateData.cancel_reason = notes || 'Cancelled by admin';
        }

        const fields = Object.keys(updateData).map(key => `${key} = ?`);
        const values = Object.values(updateData);

        values.push(id);

        await pool.execute(
            `UPDATE orders SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );

        // Add status history
        await pool.execute(
            'INSERT INTO order_status_history (order_id, status, notes) VALUES (?, ?, ?)',
            [id, status, notes || null]
        );

        // If cancelled, return stock
        if (status === 'cancelled') {
            const [orderItems] = await pool.execute(
                'SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?',
                [id]
            );

            for (const item of orderItems) {
                if (item.variant_id) {
                    await pool.execute(
                        'UPDATE product_variants SET stock = stock + ? WHERE id = ?',
                        [item.quantity, item.variant_id]
                    );
                } else {
                    await pool.execute(
                        'UPDATE products SET stock = stock + ? WHERE id = ?',
                        [item.quantity, item.product_id]
                    );
                }
            }
        }

        // Get updated order
        const [orders] = await pool.execute(
            `SELECT o.*, 
                    u.name as customer_name,
                    u.email as customer_email
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             WHERE o.id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: orders[0]
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== SEARCH ROUTES ====================

// Search products
app.get('/api/search', async (req, res) => {
    try {
        const { q, category, brand, min_price, max_price, sort = 'relevance' } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        let query = `
            SELECT p.*, 
                   c.name as category_name,
                   b.name as brand_name,
                   (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.is_available = 1 AND (
                p.name LIKE ? OR 
                p.description LIKE ? OR 
                p.sku LIKE ? OR
                c.name LIKE ? OR
                b.name LIKE ?
            )
        `;
        const searchTerm = `%${q}%`;
        const params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

        // Add filters
        if (category) {
            query += ' AND p.category_id = ?';
            params.push(category);
        }
        if (brand) {
            query += ' AND p.brand_id = ?';
            params.push(brand);
        }
        if (min_price) {
            query += ' AND p.price >= ?';
            params.push(min_price);
        }
        if (max_price) {
            query += ' AND p.price <= ?';
            params.push(max_price);
        }

        // Add sorting
        switch (sort) {
            case 'price_asc':
                query += ' ORDER BY p.price ASC';
                break;
            case 'price_desc':
                query += ' ORDER BY p.price DESC';
                break;
            case 'rating':
                query += ' ORDER BY p.rating DESC, p.review_count DESC';
                break;
            case 'newest':
                query += ' ORDER BY p.created_at DESC';
                break;
            case 'relevance':
            default:
                query += ` ORDER BY 
                CASE 
                    WHEN p.name LIKE ? THEN 1
                    WHEN p.sku LIKE ? THEN 2
                    WHEN p.description LIKE ? THEN 3
                    ELSE 4
                END,
                p.rating DESC, p.review_count DESC`;
                const exactSearch = `%${q}%`;
                params.push(exactSearch, exactSearch, exactSearch);
        }

        query += ' LIMIT 50';

        const [products] = await pool.execute(query, params);

        // Get search suggestions
        const [suggestions] = await pool.execute(
            `SELECT DISTINCT p.name, p.sku
             FROM products p
             WHERE p.is_available = 1 AND (
                 p.name LIKE ? OR p.sku LIKE ?
             )
             LIMIT 10`,
            [`${q}%`, `${q}%`]
        );

        // Get filter options
        const [categories] = await pool.execute(
            `SELECT DISTINCT c.id, c.name
             FROM categories c
             JOIN products p ON c.id = p.category_id
             WHERE p.is_available = 1 AND (
                 p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?
             )`,
            [searchTerm, searchTerm, searchTerm]
        );

        const [brands] = await pool.execute(
            `SELECT DISTINCT b.id, b.name
             FROM brands b
             JOIN products p ON b.id = p.brand_id
             WHERE p.is_available = 1 AND (
                 p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?
             )`,
            [searchTerm, searchTerm, searchTerm]
        );

        res.json({
            success: true,
            data: {
                products,
                suggestions: suggestions.map(s => s.name),
                filters: {
                    categories,
                    brands,
                    price_range: {
                        min: products.reduce((min, p) => p.price < min ? p.price : min, products[0]?.price || 0),
                        max: products.reduce((max, p) => p.price > max ? p.price : max, 0)
                    }
                }
            }
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', async (req, res) => {
    try {
        // Check database connection
        await pool.execute('SELECT 1');

        res.json({
            success: true,
            message: 'API is healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'API health check failed',
            error: error.message
        });
    }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);

    // Handle multer file size error
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB'
            });
        }
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation:`);
    console.log(`   - Health check: GET /api/health`);
    console.log(`   - Products: GET /api/products`);
    console.log(`   - Categories: GET /api/categories`);
    console.log(`   - Auth: POST /api/auth/login`);
    console.log(`   - Cart: GET /api/cart (authenticated)`);
    console.log(`   - Orders: GET /api/orders (authenticated)`);
    console.log(`   - Admin: GET /api/admin/dashboard (admin only)`);
});


