const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');
const Product = require('../models/Product');
const ProductView = require('../models/ProductView');
const AbandonedCart = require('../models/AbandonedCart');

class AnalyticsService {
    /**
     * Get comprehensive dashboard analytics
     */
    static async getDashboardAnalytics(period = 'month') {
        try {
            const { startDate, previousStartDate, endDate } = this.getDateRange(period);

            // Parallel data fetching for performance
            const [
                customStats,
                revenueStats,
                productStats,
                visitorStats
            ] = await Promise.all([
                this.getCustomerStats(startDate, endDate),
                this.getRevenueStats(startDate, endDate, previousStartDate),
                this.getProductPerformance(startDate, endDate),
                this.getVisitorStats(startDate, endDate)
            ]);

            return {
                period,
                dateRange: { start: startDate, end: endDate },
                revenue: revenueStats,
                customers: customStats,
                products: productStats,
                visitors: visitorStats
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get revenue statistics with comparison
     */
    static async getRevenueStats(startDate, endDate, previousStartDate) {
        try {
            // Current period revenue
            const currentRevenue = await Order.sum('totalAmount', {
                where: {
                    createdAt: { [Op.between]: [startDate, endDate] },
                    status: { [Op.notIn]: ['cancelled', 'pending'] }
                }
            }) || 0;

            // Previous period revenue
            const previousRevenue = await Order.sum('totalAmount', {
                where: {
                    createdAt: { [Op.between]: [previousStartDate, startDate] },
                    status: { [Op.notIn]: ['cancelled', 'pending'] }
                }
            }) || 0;

            // Calculate growth
            const growth = previousRevenue === 0 ? 100 :
                ((currentRevenue - previousRevenue) / previousRevenue) * 100;

            // Get revenue chart data (daily/monthly based on period)
            const chartData = await this.getRevenueChartData(startDate, endDate);

            return {
                total: currentRevenue,
                previousTotal: previousRevenue,
                growth: parseFloat(growth.toFixed(2)),
                chartData
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get customer statistics
     */
    static async getCustomerStats(startDate, endDate) {
        try {
            const newCustomers = await User.count({
                where: { createdAt: { [Op.between]: [startDate, endDate] } }
            });

            const totalCustomers = await User.count();

            const activeCustomers = await User.count({
                where: {
                    lastLogin: { [Op.between]: [startDate, endDate] }
                }
            });

            return {
                new: newCustomers,
                total: totalCustomers,
                active: activeCustomers
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get product performance analytics
     */
    static async getProductPerformance(startDate, endDate) {
        try {
            // Top selling products
            const topSelling = await OrderItem.findAll({
                attributes: [
                    'productId',
                    'productName',
                    [sequelize.fn('SUM', sequelize.col('quantity')), 'soldQuantity'],
                    [sequelize.fn('SUM', sequelize.col('total')), 'revenue']
                ],
                include: [{
                    model: Order,
                    where: {
                        createdAt: { [Op.between]: [startDate, endDate] },
                        status: { [Op.notIn]: ['cancelled', 'pending'] }
                    },
                    attributes: []
                }],
                group: ['productId', 'productName'],
                order: [[sequelize.fn('SUM', sequelize.col('total')), 'DESC']],
                limit: 5
            });

            // Most viewed products
            const mostViewed = await ProductView.findAll({
                attributes: [
                    'productId',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'views']
                ],
                where: { createdAt: { [Op.between]: [startDate, endDate] } },
                include: [{
                    model: Product,
                    attributes: ['name', 'price', 'image']
                }],
                group: ['productId', 'Product.id'],
                order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
                limit: 5
            });

            return {
                topSelling,
                mostViewed
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get visitor/traffic statistics (Simulated if no real analytics tool)
     */
    static async getVisitorStats(startDate, endDate) {
        try {
            // Implementation depends on tracking mechanism
            // This calculates from recorded ProductViews for approximation

            const pageViews = await ProductView.count({
                where: { createdAt: { [Op.between]: [startDate, endDate] } }
            });

            const uniqueVisitors = await ProductView.count({
                distinct: true,
                col: 'sessionId', // Assuming sessionId is tracked
                where: { createdAt: { [Op.between]: [startDate, endDate] } }
            });

            return {
                pageViews,
                uniqueVisitors
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Helper to get date ranges
     */
    static getDateRange(period) {
        const now = new Date();
        const endDate = new Date(now);
        let startDate = new Date(now);
        let previousStartDate = new Date(now);

        switch (period) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                previousStartDate.setDate(now.getDate() - 14);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                previousStartDate.setMonth(now.getMonth() - 2);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                previousStartDate.setFullYear(now.getFullYear() - 2);
                break;
            default: // Month
                startDate.setMonth(now.getMonth() - 1);
                previousStartDate.setMonth(now.getMonth() - 2);
        }

        return { startDate, previousStartDate, endDate };
    }

    /**
     * Get revenue chart data formatted for frontend
     */
    static async getRevenueChartData(startDate, endDate) {
        // Group by day for the selected period
        const rawData = await Order.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('SUM', sequelize.col('totalAmount')), 'amount']
            ],
            where: {
                createdAt: { [Op.between]: [startDate, endDate] },
                status: { [Op.notIn]: ['cancelled', 'pending'] }
            },
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });

        // Fill in missing dates with 0
        const chartData = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const found = rawData.find(item => item.getDataValue('date') === dateStr);

            chartData.push({
                name: dateStr, // X-axis label
                value: found ? parseFloat(found.getDataValue('amount')) : 0
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return chartData;
    }
}

module.exports = AnalyticsService;
