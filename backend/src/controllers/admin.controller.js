import { prisma } from '../config/database.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count();

    const sales = await prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID' }
    });

    res.json({
        success: true,
        data: {
            users: totalUsers,
            orders: totalOrders,
            products: totalProducts,
            revenue: sales._sum.total || 0
        }
    });
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true, name: true, email: true, role: true, createdAt: true
        }
    });
    res.json({ success: true, data: users });
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    const { status, trackingNumber } = req.body;
    const { id } = req.params;

    const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
            status,
            trackingNumber,
            statusHistory: {
                create: { status, notes: `Admin updated to ${status}` }
            }
        }
    });

    res.json({ success: true, data: updatedOrder });
};
