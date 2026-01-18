import { prisma } from '../config/database.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    const {
        items,
        addressId,
        paymentMethod,
        shippingMethod,
        shippingCost,
        notes
    } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = [];

    // Verify products and stock (simplified for now)
    for (const item of items) {
        const product = await prisma.product.findUnique({
            where: { id: item.productId }
        });

        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${item.productId}`);
        }

        const price = Number(product.price);
        subtotal += price * item.quantity;

        orderItemsData.push({
            productId: item.productId,
            variantId: item.variantId,
            name: product.name,
            price: price,
            quantity: item.quantity,
            subtotal: price * item.quantity
        });
    }

    const total = subtotal + Number(shippingCost || 0);

    // Create Order with Transaction
    try {
        const result = await prisma.$transaction(async (prisma) => {
            // Generate Order Number
            const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
            const count = await prisma.order.count();
            const orderNumber = `ORD-${dateStr}-${(count + 1).toString().padStart(6, '0')}`;

            // Create Order Header
            const order = await prisma.order.create({
                data: {
                    orderNumber,
                    userId: req.user.id,
                    addressId,
                    paymentMethod,
                    shippingMethod,
                    shippingCost: shippingCost || 0,
                    subtotal,
                    total,
                    notes,
                    items: {
                        create: orderItemsData
                    },
                    payment: {
                        create: {
                            method: paymentMethod,
                            amount: total,
                            status: 'PENDING'
                        }
                    },
                    statusHistory: {
                        create: {
                            status: 'PENDING',
                            notes: 'Order created'
                        }
                    }
                },
                include: {
                    items: true,
                    payment: true
                }
            });

            return order;
        });

        res.status(201).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error('Order creation failed');
    }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req, res) => {
    const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: {
            items: {
                include: { product: { select: { images: true } } }
            },
            payment: true
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: orders });
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: {
            user: { select: { name: true, email: true } },
            address: true,
            items: {
                include: { product: { select: { images: true } } }
            },
            payment: true,
            statusHistory: true
        }
    });

    if (order) {
        // Allow admin or order owner
        if (req.user.role === 'ADMIN' || order.userId === req.user.id) {
            res.json({ success: true, data: order });
        } else {
            res.status(401);
            throw new Error('Not authorized');
        }
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Cancel Order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
    const { reason } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(401);
        throw new Error('Not authorized');
    }

    if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
        res.status(400);
        throw new Error(`Cannot cancel order in ${order.status} status`);
    }

    const updatedOrder = await prisma.order.update({
        where: { id: req.params.id },
        data: {
            status: 'CANCELLED',
            canceledAt: new Date(),
            cancelReason: reason, // Ensure schema has this
            statusHistory: {
                create: {
                    status: 'CANCELLED',
                    notes: reason || 'User requesting cancellation'
                }
            }
        }
    });

    res.json({ success: true, data: updatedOrder });
};
