import models from '../models/index.js';
import adminService from '../services/admin.service.js';

const { Order, User, Product, Review, Sequelize } = models;

class AdminController {
    async getDashboardStats(req, res, next) {
        try {
            const stats = await adminService.getDashboardStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    async getRecentOrders(req, res, next) {
        try {
            const { limit = 10 } = req.query;

            const orders = await Order.findAll({
                include: [{
                    model: User,
                    as: 'customer',
                    attributes: ['id', 'name', 'email']
                }],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit)
            });

            res.json({ success: true, data: orders });
        } catch (error) {
            next(error);
        }
    }

    async getSalesReport(req, res, next) {
        try {
            const { period = 'monthly', startDate, endDate } = req.query;

            const report = await adminService.getSalesReport(period, startDate, endDate);
            res.json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    async getInventoryAlerts(req, res, next) {
        try {
            const alerts = await adminService.getInventoryAlerts();
            res.json({ success: true, data: alerts });
        } catch (error) {
            next(error);
        }
    }

    async getTopProducts(req, res, next) {
        try {
            const { limit = 10 } = req.query;

            const products = await Product.findAll({
                order: [['soldCount', 'DESC']],
                limit: parseInt(limit),
                attributes: ['id', 'name', 'price', 'soldCount', 'stock']
            });

            res.json({ success: true, data: products });
        } catch (error) {
            next(error);
        }
    }

    async getCustomerStats(req, res, next) {
        try {
            const stats = await adminService.getCustomerStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminController();
