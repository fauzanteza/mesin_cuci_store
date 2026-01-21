import { Op } from 'sequelize';
import InventoryTransaction from '../models/InventoryTransaction.js';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import NotificationService from './notification.service.js';
import AppError from '../utils/appError.js';
import sequelize from '../config/database.js';
import User from '../models/User.js';

class InventoryService {
    /**
     * Check product stock
     */
    static async checkStock(productId, variantId = null) {
        try {
            if (variantId) {
                const variant = await ProductVariant.findByPk(variantId);
                if (!variant) return { quantity: 0, status: 'out_of_stock' };

                return {
                    quantity: variant.stock,
                    status: this.getStockStatus(variant.stock, variant.lowStockThreshold)
                };
            }

            const product = await Product.findByPk(productId);
            if (!product) return { quantity: 0, status: 'out_of_stock' };

            return {
                quantity: product.stock,
                status: this.getStockStatus(product.stock, product.lowStockThreshold)
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get stock status based on quantity and threshold
     */
    static getStockStatus(quantity, threshold = 5) {
        if (quantity <= 0) return 'out_of_stock';
        if (quantity <= threshold) return 'low_stock';
        return 'in_stock';
    }

    /**
     * Update stock with transaction
     */
    static async updateStock(productId, quantity, type, notes = '', userId = null, transaction = null) {
        // If no external transaction provided, manage local transaction
        const t = transaction || await sequelize.transaction();
        const commitLocally = !transaction;

        try {
            const product = await Product.findByPk(productId, { transaction: t });
            if (!product) throw new AppError('Produk tidak ditemukan', 404);

            const oldStock = product.stock;
            const newStock = oldStock + quantity;

            if (newStock < 0) {
                throw new AppError(`Stok tidak mencukupi for ${product.name}`, 400);
            }

            // Update product stock
            product.stock = newStock;
            await product.save({ transaction: t });

            // Create inventory transaction record
            await InventoryTransaction.create({
                productId,
                type,
                quantity,
                previousStock: oldStock,
                currentStock: newStock,
                notes,
                createdBy: userId,
                transactionDate: new Date()
            }, { transaction: t });

            // Commit if we started the transaction
            if (commitLocally) await t.commit();

            // Check for low stock alerts (outside transaction)
            if (newStock <= product.lowStockThreshold) {
                await NotificationService.sendLowStockAlert(product);
            } else if (newStock === 0) {
                await NotificationService.sendOutOfStockAlert(product);
            }

            return { previousStock: oldStock, currentStock: newStock };
        } catch (error) {
            if (commitLocally) await t.rollback();
            throw error;
        }
    }

    /**
     * Bulk update stock
     */
    static async bulkUpdateStock(updates, userId) {
        const transaction = await sequelize.transaction();
        const results = [];

        try {
            for (const update of updates) {
                const { productId, quantity, type, notes } = update;

                const result = await this.updateStock(
                    productId,
                    quantity,
                    type,
                    notes,
                    userId,
                    transaction
                );

                results.push({ productId, ...result });
            }

            await transaction.commit();
            return results;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Get inventory history/transactions
     */
    static async getInventoryHistory(filters = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                productId,
                type,
                startDate,
                endDate
            } = filters;

            const offset = (page - 1) * limit;
            const where = {};

            if (productId) where.productId = productId;
            if (type) where.type = type;

            if (startDate && endDate) {
                where.transactionDate = {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                };
            }

            const history = await InventoryTransaction.findAndCountAll({
                where,
                include: [
                    {
                        model: Product,
                        attributes: ['id', 'name', 'sku']
                    },
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name']
                    }
                ],
                order: [['transactionDate', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                transactions: history.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: history.count,
                    pages: Math.ceil(history.count / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get low stock products
     */
    static async getLowStockProducts(limit = 20) {
        try {
            const products = await Product.findAll({
                where: {
                    isActive: true,
                    stock: {
                        [Op.lte]: sequelize.col('lowStockThreshold')
                    }
                },
                order: [['stock', 'ASC']],
                limit
            });

            return products;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get inventory summary
     */
    static async getInventorySummary() {
        try {
            const totalProducts = await Product.count({ where: { isActive: true } });

            const lowStockCount = await Product.count({
                where: {
                    isActive: true,
                    stock: { [Op.lte]: sequelize.col('lowStockThreshold'), [Op.gt]: 0 }
                }
            });

            const outOfStockCount = await Product.count({
                where: {
                    isActive: true,
                    stock: 0
                }
            });

            const totalValue = await Product.sum('price', {
                where: { isActive: true }
                // Note: This is simplified. Real inventory value should be price * stock
            });

            // Calculate real total inventory value
            const products = await Product.findAll({
                where: { isActive: true },
                attributes: ['price', 'stock']
            });

            const realTotalValue = products.reduce(
                (sum, p) => sum + (p.price * p.stock),
                0
            );

            return {
                totalProducts,
                lowStockCount,
                outOfStockCount,
                inStockCount: totalProducts - lowStockCount - outOfStockCount,
                totalInventoryValue: realTotalValue
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create inventory record (initial)
     */
    static async createInventoryRecord(data) {
        try {
            const { productId, initialStock, type = 'INITIAL', notes = '' } = data;

            await InventoryTransaction.create({
                productId,
                type,
                quantity: initialStock,
                previousStock: 0,
                currentStock: initialStock,
                notes,
                transactionDate: new Date()
            });
        } catch (error) {
            throw error;
        }
    }
}

export default InventoryService;
