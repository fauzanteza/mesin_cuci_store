import { snap, coreApi } from '../config/payment.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js'; // Ensure Payment model exists or remove this line if provided later but User prompt implied creating it. Wait, user prompt "Create payment record... const Payment = require('../models/Payment');" implies it might not be imported at top level or trying to dynamically require. I will import it.

class PaymentService {
    /**
     * Create Midtrans transaction
     */
    static async createTransaction(order, user) {
        try {
            const orderDetails = await Order.findByPk(order.id, {
                include: ['items']
            });

            const parameter = {
                transaction_details: {
                    order_id: order.orderNumber,
                    gross_amount: order.totalAmount
                },
                customer_details: {
                    first_name: user.name.split(' ')[0],
                    last_name: user.name.split(' ').slice(1).join(' ') || '',
                    email: user.email,
                    phone: user.phone,
                    billing_address: {
                        first_name: user.name.split(' ')[0],
                        last_name: user.name.split(' ').slice(1).join(' ') || '',
                        email: user.email,
                        phone: user.phone,
                        address: order.shippingAddress,
                        city: order.shippingCity,
                        postal_code: order.shippingPostalCode
                    },
                    shipping_address: {
                        first_name: user.name.split(' ')[0],
                        last_name: user.name.split(' ').slice(1).join(' ') || '',
                        email: user.email,
                        phone: user.phone,
                        address: order.shippingAddress,
                        city: order.shippingCity,
                        postal_code: order.shippingPostalCode
                    }
                },
                item_details: orderDetails.items.map(item => ({
                    id: item.productId,
                    price: item.price,
                    quantity: item.quantity,
                    name: item.productName,
                    brand: item.productBrand,
                    category: item.productCategory
                })),
                callbacks: {
                    finish: `${process.env.FRONTEND_URL}/checkout/success`,
                    error: `${process.env.FRONTEND_URL}/checkout/error`,
                    pending: `${process.env.FRONTEND_URL}/checkout/pending`
                },
                enabled_payments: [
                    'credit_card',
                    'bca_va',
                    'bni_va',
                    'bri_va',
                    'permata_va',
                    'cimb_va',
                    'mandiri_va',
                    'gopay',
                    'shopeepay',
                    'dana',
                    'ovo',
                    'linkaja',
                    'qris',
                    'alfamart',
                    'indomaret'
                ],
                expiry: {
                    unit: 'hours',
                    duration: 24
                }
            };

            const transaction = await snap.createTransaction(parameter);
            return {
                token: transaction.token,
                redirect_url: transaction.redirect_url
            };
        } catch (error) {
            console.error('Midtrans Error:', error);
            throw new Error(`Payment gateway error: ${error.message}`);
        }
    }

    /**
     * Handle payment notification from Midtrans
     */
    static async handleNotification(notification) {
        try {
            const statusResponse = await coreApi.transaction.notification(notification);

            const orderId = statusResponse.order_id;
            const transactionStatus = statusResponse.transaction_status;
            const fraudStatus = statusResponse.fraud_status;

            console.log(`Payment notification: Order ${orderId}, Status: ${transactionStatus}, Fraud: ${fraudStatus}`);

            // Find order by order number
            const order = await Order.findOne({
                where: { orderNumber: orderId }
            });

            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }

            let orderStatus = 'pending';

            if (transactionStatus === 'capture') {
                if (fraudStatus === 'challenge') {
                    orderStatus = 'challenge';
                } else if (fraudStatus === 'accept') {
                    orderStatus = 'paid';
                }
            } else if (transactionStatus === 'settlement') {
                orderStatus = 'paid';
            } else if (transactionStatus === 'deny') {
                orderStatus = 'failed';
            } else if (transactionStatus === 'cancel' || transactionStatus === 'expire') {
                orderStatus = 'cancelled';
            } else if (transactionStatus === 'pending') {
                orderStatus = 'pending';
            }

            // Update order status
            order.status = orderStatus;
            order.paymentStatus = orderStatus === 'paid' ? 'completed' : orderStatus;
            order.paymentMethod = statusResponse.payment_type;

            if (statusResponse.settlement_time) {
                order.paidAt = statusResponse.settlement_time;
            }

            await order.save();

            // Create payment record
            await Payment.create({
                orderId: order.id,
                paymentMethod: statusResponse.payment_type,
                amount: parseFloat(statusResponse.gross_amount),
                status: orderStatus,
                transactionId: statusResponse.transaction_id,
                response: JSON.stringify(statusResponse)
            });

            return {
                success: true,
                orderId: order.id,
                status: orderStatus,
                message: `Order ${orderId} updated to ${orderStatus}`
            };
        } catch (error) {
            console.error('Notification handling error:', error);
            throw error;
        }
    }

    /**
     * Check transaction status
     */
    static async checkStatus(orderNumber) {
        try {
            const statusResponse = await coreApi.transaction.status(orderNumber);
            return statusResponse;
        } catch (error) {
            console.error('Status check error:', error);
            throw error;
        }
    }

    /**
     * Cancel transaction
     */
    static async cancelTransaction(orderNumber) {
        try {
            const cancelResponse = await coreApi.transaction.cancel(orderNumber);
            return cancelResponse;
        } catch (error) {
            console.error('Cancel error:', error);
            throw error;
        }
    }
}

export default PaymentService;
