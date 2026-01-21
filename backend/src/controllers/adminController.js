import { Op } from 'sequelize'; // Need Op for search
import sequelize from '../config/database.js'; // Need sequelize for fn/col
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import OrderItem from '../models/OrderItem.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
export const getDashboardStats = asyncHandler(async (req, res, next) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Get total counts
    const totalUsers = await User.count();
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();

    // Get monthly stats
    const monthlyOrders = await Order.count({
        where: {
            createdAt: {
                [Op.gte]: startOfMonth,
                [Op.lte]: today
            }
        }
    });

    const monthlyRevenue = await Order.sum('totalAmount', {
        where: {
            createdAt: {
                [Op.gte]: startOfMonth,
                [Op.lte]: today
            },
            status: 'completed'
        }
    });

    // Get top selling products
    const topProducts = await OrderItem.findAll({
        attributes: [
            'productId',
            [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold']
        ],
        include: [{ model: Product, attributes: ['name', 'price'] }],
        group: ['productId'],
        order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
        limit: 5
    });

    // Get recent orders
    const recentOrders = await Order.findAll({
        include: [{ model: User, attributes: ['name', 'email'] }],
        order: [['createdAt', 'DESC']],
        limit: 10
    });

    // Get pending reviews
    const pendingReviews = await Review.count({
        where: { status: 'pending' }
    });

    res.status(200).json({
        success: true,
        data: {
            totals: {
                users: totalUsers,
                products: totalProducts,
                orders: totalOrders,
                pendingReviews
            },
            monthly: {
                orders: monthlyOrders,
                revenue: monthlyRevenue || 0
            },
            topProducts,
            recentOrders
        }
    });
});

/**
 * @desc    Get all users (for admin)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = {};
    if (search) {
        whereCondition[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } }
        ];
    }

    const users = await User.findAndCountAll({
        where: whereCondition,
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        data: users.rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: users.count,
            pages: Math.ceil(users.count / limit)
        }
    });
});

/**
 * @desc    Update user status (activate/deactivate)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private/Admin
 */
export const updateUserStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: user
    });
});

/**
 * @desc    Get system logs
 * @route   GET /api/admin/logs
 * @access  Private/Admin
 */
export const getSystemLogs = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 50, type, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = {};

    if (type) {
        whereCondition.logType = type;
    }

    if (startDate && endDate) {
        whereCondition.createdAt = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    }

    const logs = await AuditLog.findAndCountAll({
        where: whereCondition,
        include: [{
            model: User,
            attributes: ['id', 'name', 'email'],
            required: false
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        data: logs.rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: logs.count,
            pages: Math.ceil(logs.count / limit)
        }
    });
});

export default {
    getDashboardStats,
    getAllUsers,
    updateUserStatus,
    getSystemLogs
};
