import { prisma } from '../config/database.js';

// @desc    Process payment (Mock)
// @route   POST /api/payments/process
// @access  Private
export const processPayment = async (req, res) => {
    const { orderId, method, amount } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.status !== 'PENDING') {
        res.status(400);
        throw new Error('Order is not in pending state');
    }

    // Ensure payment amount matches
    if (Number(order.total) !== Number(amount)) {
        res.status(400);
        throw new Error('Payment amount mismatch');
    }

    // In a real app, integrate with Stripe/Midtrans here.
    // We will simulate a successful payment for now or "pending" if Bank Transfer.

    let paymentStatus = 'PAID';
    if (method === 'BANK_TRANSFER') {
        paymentStatus = 'PENDING'; // Waits for manual verification or callback
    }

    // Update Payment
    await prisma.payment.update({
        where: { orderId },
        data: {
            status: paymentStatus,
            method,
            transactionId: `TRX-${Date.now()}`
        }
    });

    // Update Order Status if mock paid
    if (paymentStatus === 'PAID') {
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: 'PAID',
                status: 'PROCESSING',
                statusHistory: {
                    create: { status: 'PROCESSING', notes: 'Payment successful' }
                }
            }
        });
    }

    res.json({ success: true, message: 'Payment processed', status: paymentStatus });
};
