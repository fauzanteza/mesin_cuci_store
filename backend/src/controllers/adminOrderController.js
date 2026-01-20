// backend/src/controllers/adminOrderController.js
import adminOrderService from '../services/adminOrder.service.js';

class AdminOrderController {
    // GET /api/admin/orders
    async getOrders(req, res, next) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                status,
                paymentStatus,
                startDate,
                endDate,
                customerId,
                sortBy = 'createdAt',
                sortOrder = 'DESC'
            } = req.query;

            const orders = await adminOrderService.getOrders({
                page: parseInt(page),
                limit: parseInt(limit),
                search,
                status,
                paymentStatus,
                startDate,
                endDate,
                customerId,
                sortBy,
                sortOrder: sortOrder.toUpperCase()
            });

            res.json({
                success: true,
                data: orders.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: orders.count,
                    totalPages: Math.ceil(orders.count / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/admin/orders/:id
    async getOrder(req, res, next) {
        try {
            const order = await adminOrderService.getOrderById(req.params.id);
            res.json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/admin/orders
    async createOrder(req, res, next) {
        try {
            const order = await adminOrderService.createOrder(req.body);
            res.status(201).json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/admin/orders/:id
    async updateOrder(req, res, next) {
        try {
            const order = await adminOrderService.updateOrder(
                req.params.id,
                req.body
            );
            res.json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/admin/orders/:id
    async deleteOrder(req, res, next) {
        try {
            await adminOrderService.deleteOrder(req.params.id);
            res.json({ success: true, message: 'Order deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/admin/orders/:id/status
    async updateOrderStatus(req, res, next) {
        try {
            const { status, note, trackingNumber, courier, estimatedDelivery } = req.body;
            const order = await adminOrderService.updateOrderStatus(
                req.params.id,
                status,
                req.user.id,
                { note, trackingNumber, courier, estimatedDelivery }
            );
            res.json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/admin/orders/:id/payment
    async updatePaymentStatus(req, res, next) {
        try {
            const { status, note } = req.body;
            const order = await adminOrderService.updatePaymentStatus(
                req.params.id,
                status,
                note
            );
            res.json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/admin/orders/:id/notes
    async updateOrderNotes(req, res, next) {
        try {
            const { adminNotes } = req.body;
            const order = await adminOrderService.updateOrderNotes(
                req.params.id,
                adminNotes
            );
            res.json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/admin/orders/bulk-status
    async bulkUpdateOrderStatus(req, res, next) {
        try {
            const { orderIds, status } = req.body;
            const result = await adminOrderService.bulkUpdateOrderStatus(
                orderIds,
                status
            );
            res.json({
                success: true,
                message: `${result.updatedCount} orders updated`
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/admin/orders/export
    async exportOrders(req, res, next) {
        try {
            const { format = 'csv', startDate, endDate } = req.query;
            const fileBuffer = await adminOrderService.exportOrders(
                format,
                startDate,
                endDate
            );

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
            res.send(fileBuffer);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/admin/orders/stats
    async getOrderStats(req, res, next) {
        try {
            const { period = 'month' } = req.query;
            const stats = await adminOrderService.getOrderStats(period);
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminOrderController();
