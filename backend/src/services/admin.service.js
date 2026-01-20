import models from '../models/index.js';
import { Op } from 'sequelize';

const { Order, User, Product, OrderItem, Sequelize } = models;

class AdminService {
    async getDashboardStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Get current month stats
        const currentMonthOrders = await Order.sum('totalAmount', {
            where: {
                createdAt: { [Op.gte]: startOfMonth },
                status: { [Op.ne]: 'cancelled' }
            }
        });

        const prevMonthOrders = await Order.sum('totalAmount', {
            where: {
                createdAt: { [Op.between]: [startOfPrevMonth, endOfPrevMonth] },
                status: { [Op.ne]: 'cancelled' }
            }
        });

        // Calculate revenue change
        const revenueChange = prevMonthOrders > 0
            ? ((currentMonthOrders - prevMonthOrders) / prevMonthOrders) * 100
            : 0;

        // Get order counts
        const orderCount = await Order.count({
            where: {
                createdAt: { [Op.gte]: startOfMonth },
                status: { [Op.ne]: 'cancelled' }
            }
        });

        const prevOrderCount = await Order.count({
            where: {
                createdAt: { [Op.between]: [startOfPrevMonth, endOfPrevMonth] },
                status: { [Op.ne]: 'cancelled' }
            }
        });

        const orderChange = prevOrderCount > 0
            ? ((orderCount - prevOrderCount) / prevOrderCount) * 100
            : 0;

        // Get new customers
        const newCustomers = await User.count({
            where: {
                role: 'customer',
                createdAt: { [Op.gte]: startOfMonth }
            }
        });

        const prevNewCustomers = await User.count({
            where: {
                role: 'customer',
                createdAt: { [Op.between]: [startOfPrevMonth, endOfPrevMonth] }
            }
        });

        const customerChange = prevNewCustomers > 0
            ? ((newCustomers - prevNewCustomers) / prevNewCustomers) * 100
            : 0;

        // Get average order value
        const avgOrderValue = orderCount > 0 ? currentMonthOrders / orderCount : 0;
        const prevAvgOrderValue = prevOrderCount > 0 ? prevMonthOrders / prevOrderCount : 0;

        const avgOrderChange = prevAvgOrderValue > 0
            ? ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100
            : 0;

        return {
            totalRevenue: {
                value: currentMonthOrders || 0,
                change: parseFloat(revenueChange.toFixed(1))
            },
            totalOrders: {
                value: orderCount || 0,
                change: parseFloat(orderChange.toFixed(1))
            },
            newCustomers: {
                value: newCustomers || 0,
                change: parseFloat(customerChange.toFixed(1))
            },
            avgOrderValue: {
                value: Math.round(avgOrderValue) || 0,
                change: parseFloat(avgOrderChange.toFixed(1))
            }
        };
    }

    async getSalesReport(period = 'monthly', startDate, endDate) {
        let groupByFormat;
        let dateFormat;

        switch (period) {
            case 'daily':
                dateFormat = '%Y-%m-%d';
                groupByFormat = 'DATE(createdAt)';
                break;
            case 'weekly':
                dateFormat = '%Y-%W';
                groupByFormat = 'YEARWEEK(createdAt)';
                break;
            default: // monthly
                dateFormat = '%Y-%m';
                groupByFormat = 'DATE_FORMAT(createdAt, "%Y-%m")';
                break;
        }

        const report = await Order.findAll({
            attributes: [
                [Sequelize.literal(groupByFormat), 'period'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'orderCount'],
                [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalRevenue'],
                [Sequelize.fn('AVG', Sequelize.col('totalAmount')), 'avgOrderValue']
            ],
            where: {
                status: { [Op.ne]: 'cancelled' },
                ...(startDate && endDate && {
                    createdAt: {
                        [Op.between]: [new Date(startDate), new Date(endDate)]
                    }
                })
            },
            group: ['period'],
            order: [[Sequelize.literal('period'), 'ASC']],
            raw: true
        });

        return report;
    }

    async getInventoryAlerts() {
        const products = await Product.findAll({
            where: {
                stock: {
                    [Op.lt]: Sequelize.literal('minimumStock * 1.5') // Warning threshold
                }
            },
            order: [
                [Sequelize.literal('stock / minimumStock'), 'ASC'] // Most critical first
            ]
        });

        return products.map(product => {
            const stockRatio = product.stock / product.minimumStock;
            let status = 'normal';

            if (stockRatio <= 0.5) status = 'critical';
            else if (stockRatio <= 1) status = 'warning';

            return {
                id: product.id,
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                currentStock: product.stock,
                minStock: product.minimumStock,
                status,
                supplier: product.supplier
            };
        });
    }

    async getCustomerStats() {
        const totalCustomers = await User.count({
            where: { role: 'customer' }
        });

        const newCustomers = await User.count({
            where: {
                role: 'customer',
                createdAt: {
                    [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30))
                }
            }
        });

        const activeCustomers = await Order.count({
            distinct: true,
            col: 'userId',
            where: {
                createdAt: {
                    [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 90))
                }
            }
        });

        return {
            totalCustomers,
            newCustomers,
            activeCustomers,
            customerGrowth: newCustomers > 0 ? (newCustomers / totalCustomers * 100).toFixed(1) : 0
        };
    }
}

export default new AdminService();
