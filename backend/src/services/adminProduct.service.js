import models from '../models/index.js';
import { Op } from 'sequelize';

const { Product, Category, Brand, ProductImage, ProductVariant, Sequelize } = models;

class AdminProductService {
    async getProducts({
        page,
        limit,
        search,
        category,
        brand,
        status,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder
    }) {
        const offset = (page - 1) * limit;

        const where = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { sku: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        if (status) {
            where.status = status;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price[Op.gte] = minPrice;
            if (maxPrice !== undefined) where.price[Op.lte] = maxPrice;
        }

        const include = [];

        // Note: Assuming Category and Brand models exist and relationships are defined
        include.push({
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
        });

        if (category) {
            // Filter by category if ID provided (adjust if needed to filter on included model)
            where.category_id = category;
        }

        include.push({
            model: Brand,
            as: 'brand',
            attributes: ['id', 'name']
        });

        if (brand) {
            // Filter by brand if ID provided
            where.brand_id = brand;
        }

        include.push({
            model: ProductImage,
            as: 'images',
            attributes: ['id', 'url', 'isPrimary'],
            limit: 1
        });

        const order = [];
        if (sortBy === 'price') {
            order.push(['price', sortOrder]);
        } else if (sortBy === 'stock') {
            order.push(['stock', sortOrder]);
        } else if (sortBy === 'name') {
            order.push(['name', sortOrder]);
        } else if (sortBy === 'soldCount') {
            order.push(['soldCount', sortOrder]);
        } else {
            order.push(['createdAt', sortOrder]);
        }

        const { rows, count } = await Product.findAndCountAll({
            where,
            include,
            order,
            limit,
            offset,
            distinct: true
        });

        return { rows, count };
    }

    async getProductById(id) {
        const product = await Product.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: Brand,
                    as: 'brand',
                    attributes: ['id', 'name']
                },
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['id', 'url', 'publicId', 'isPrimary']
                },
                {
                    model: ProductVariant,
                    as: 'variants',
                    attributes: ['id', 'name', 'price', 'stock', 'sku']
                }
            ]
        });

        if (!product) {
            throw new Error('Product not found');
        }

        return product;
    }

    async createProduct(productData, images = []) {
        const transaction = await models.sequelize.transaction();

        try {
            // Create product
            const product = await Product.create(productData, { transaction });

            // Create images
            if (images.length > 0) {
                const productImages = images.map(img => ({
                    ...img,
                    productId: product.id
                }));
                await ProductImage.bulkCreate(productImages, { transaction });
            }

            // Create variants if any
            if (productData.variants && productData.variants.length > 0) {
                const variants = productData.variants.map(variant => ({
                    ...variant,
                    productId: product.id
                }));
                await ProductVariant.bulkCreate(variants, { transaction });
            }

            await transaction.commit();

            // Return product with associations
            return await this.getProductById(product.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateProduct(id, updateData, newImages = []) {
        const transaction = await models.sequelize.transaction();

        try {
            const product = await Product.findByPk(id, { transaction });

            if (!product) {
                throw new Error('Product not found');
            }

            // Update product
            await product.update(updateData, { transaction });

            // Handle images
            if (updateData.imagesToDelete && updateData.imagesToDelete.length > 0) {
                await ProductImage.destroy({
                    where: {
                        id: { [Op.in]: updateData.imagesToDelete }
                    },
                    transaction
                });
            }

            if (newImages && newImages.length > 0) {
                const productImages = newImages.map(img => ({
                    url: img.secure_url,
                    publicId: img.public_id,
                    productId: product.id,
                    isPrimary: false // Don't set new images as primary
                }));
                await ProductImage.bulkCreate(productImages, { transaction });
            }

            // Handle variants
            if (updateData.variants) {
                // Delete existing variants
                await ProductVariant.destroy({
                    where: { productId: id },
                    transaction
                });

                // Create new variants
                if (updateData.variants.length > 0) {
                    const variants = updateData.variants.map(variant => ({
                        ...variant,
                        productId: id
                    }));
                    await ProductVariant.bulkCreate(variants, { transaction });
                }
            }

            await transaction.commit();

            return await this.getProductById(id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async deleteProduct(id) {
        const transaction = await models.sequelize.transaction();

        try {
            const product = await Product.findByPk(id, {
                include: [{
                    model: ProductImage,
                    as: 'images',
                    attributes: ['publicId']
                }],
                transaction
            });

            if (!product) {
                throw new Error('Product not found');
            }

            // Note: Cloudinary delete logic would go here

            // Delete product (cascade will delete images and variants)
            await product.destroy({ transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateProductStatus(id, status) {
        const product = await Product.findByPk(id);

        if (!product) {
            throw new Error('Product not found');
        }

        await product.update({ status });
        return product;
    }

    async updateProductStock(id, stock, operation = 'set') {
        const product = await Product.findByPk(id);

        if (!product) {
            throw new Error('Product not found');
        }

        let newStock = stock;

        if (operation === 'increment') {
            newStock = product.stock + stock;
        } else if (operation === 'decrement') {
            newStock = product.stock - stock;
        }

        if (newStock < 0) {
            throw new Error('Stock cannot be negative');
        }

        await product.update({ stock: newStock });
        return product;
    }

    async bulkUpdateProducts(productIds, action, data) {
        const where = { id: { [Op.in]: productIds } };

        let updateData = {};

        switch (action) {
            case 'activate':
                updateData.status = 'active';
                break;
            case 'deactivate':
                updateData.status = 'inactive';
                break;
            case 'feature':
                updateData.featured = true;
                break;
            case 'unfeature':
                updateData.featured = false;
                break;
            case 'update-price':
                if (data.price !== undefined) {
                    updateData.price = data.price;
                }
                if (data.discountPrice !== undefined) {
                    updateData.discountPrice = data.discountPrice;
                }
                break;
            case 'update-stock':
                if (data.stock !== undefined) {
                    updateData.stock = data.stock;
                }
                break;
            default:
                throw new Error('Invalid bulk action');
        }

        const [updatedCount] = await Product.update(updateData, { where });

        return { updatedCount };
    }

    async exportProducts(format = 'csv') {
        const products = await Product.findAll({
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name']
                },
                {
                    model: Brand,
                    as: 'brand',
                    attributes: ['name']
                }
            ],
            attributes: [
                'id', 'name', 'sku', 'price', 'discountPrice', 'stock', 'status',
                'featured', 'newArrival', 'weight', 'dimensions', 'warranty',
                'minimumStock', 'createdAt', 'updatedAt'
            ]
        });

        // Convert to CSV
        const headers = [
            'ID', 'Name', 'SKU', 'Category', 'Brand', 'Price', 'Discount Price',
            'Stock', 'Status', 'Featured', 'New Arrival', 'Weight', 'Dimensions',
            'Warranty', 'Minimum Stock', 'Created At', 'Updated At'
        ];

        const rows = products.map(p => [
            p.id,
            `"${p.name}"`,
            p.sku,
            p.category?.name || '',
            p.brand?.name || '',
            p.price,
            p.discountPrice || '',
            p.stock,
            p.status,
            p.featured ? 'Yes' : 'No',
            p.newArrival ? 'Yes' : 'No',
            p.weight,
            p.dimensions,
            p.warranty,
            p.minimumStock,
            p.createdAt,
            p.updatedAt
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        return Buffer.from(csv, 'utf-8');
    }

    async importProducts(file) {
        // Parse CSV/Excel file and import products
        // This is a simplified version

        // Implementation depends on CSV/Excel parsing library
        // For now, return mock result

        return {
            created: 10,
            updated: 5,
            failed: 2,
            errors: ['SKU duplicate found on row 15', 'Invalid price on row 20']
        };
    }
}

export default new AdminProductService();
