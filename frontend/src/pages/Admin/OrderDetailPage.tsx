import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Button,
    Card,
    LoadingSpinner,
    Modal,
    Badge
} from '../../components/UI';
import { toast } from 'react-hot-toast';
import OrderStatusBadge from '../../components/Admin/OrderStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface OrderItem {
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
}

interface OrderStatusHistory {
    status: string;
    note?: string;
    updatedBy: string;
    updatedAt: string;
}

interface Order {
    id: string;
    orderNumber: string;
    customer: {
        id: string;
        name: string;
        email: string;
        phone: string;
        avatar?: string;
    };
    items: OrderItem[];
    totalAmount: number;
    shippingCost: number;
    discount: number;
    tax: number;
    grandTotal: number;
    paymentMethod: 'transfer' | 'cod' | 'credit_card';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: {
        name: string;
        phone: string;
        address: string;
        city: string;
        province: string;
        postalCode: string;
        notes?: string;
    };
    billingAddress?: {
        name: string;
        phone: string;
        address: string;
        city: string;
        province: string;
        postalCode: string;
    };
    notes?: string;
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
    estimatedDelivery?: string;
    trackingNumber?: string;
    courier?: string;
    shippingLabel?: string;
    paymentProof?: string;
    statusHistory: OrderStatusHistory[];
}

const AdminOrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [paymentNote, setPaymentNote] = useState('');

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            // Mock data - in real app, fetch from API
            const mockOrder: Order = {
                id: '1',
                orderNumber: 'ORD-2024-001',
                customer: {
                    id: 'cust1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '081234567890',
                    avatar: '/images/avatars/user1.jpg'
                },
                items: [
                    {
                        productId: 'prod1',
                        name: 'Mesin Cuci LG 8kg Front Loading',
                        sku: 'LG-WM-8KG',
                        quantity: 1,
                        price: 3500000,
                        total: 3500000,
                        image: '/images/products/washing-machine-1.jpg'
                    },
                    {
                        productId: 'prod5',
                        name: 'Dryer Electrolux 8kg',
                        sku: 'EL-DR-8KG',
                        quantity: 1,
                        price: 5200000,
                        total: 5200000,
                        image: '/images/products/dryer-1.jpg'
                    }
                ],
                totalAmount: 8700000,
                shippingCost: 50000,
                discount: 200000,
                tax: 0,
                grandTotal: 8550000,
                paymentMethod: 'transfer',
                paymentStatus: 'paid',
                orderStatus: 'processing',
                shippingAddress: {
                    name: 'John Doe',
                    phone: '081234567890',
                    address: 'Jl. Contoh No. 123, RT 01/RW 02, Kelurahan Contoh, Kecamatan Sample',
                    city: 'Jakarta',
                    province: 'DKI Jakarta',
                    postalCode: '12345',
                    notes: 'Please deliver before 5 PM'
                },
                billingAddress: {
                    name: 'John Doe',
                    phone: '081234567890',
                    address: 'Jl. Kantor No. 456, Lantai 3',
                    city: 'Jakarta',
                    province: 'DKI Jakarta',
                    postalCode: '12345'
                },
                notes: 'Please include installation guide',
                adminNotes: 'Customer requested quick delivery',
                createdAt: '2024-02-15T10:30:00',
                updatedAt: '2024-02-15T11:45:00',
                estimatedDelivery: '2024-02-18',
                trackingNumber: 'JNE123456789',
                courier: 'JNE',
                paymentProof: '/images/payments/proof-1.jpg',
                statusHistory: [
                    {
                        status: 'pending',
                        note: 'Order placed by customer',
                        updatedBy: 'System',
                        updatedAt: '2024-02-15T10:30:00'
                    },
                    {
                        status: 'confirmed',
                        note: 'Payment verified',
                        updatedBy: 'Admin User',
                        updatedAt: '2024-02-15T11:00:00'
                    },
                    {
                        status: 'processing',
                        note: 'Preparing for shipment',
                        updatedBy: 'Warehouse Staff',
                        updatedAt: '2024-02-15T11:45:00'
                    }
                ]
            };

            setOrder(mockOrder);
        } catch (error) {
            toast.error('Failed to load order details');
            navigate('/admin/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!order || !newStatus) return;

        try {
            setUpdating(true);
            // In real app: Call API to update order status
            const updatedOrder = {
                ...order,
                orderStatus: newStatus as any,
                updatedAt: new Date().toISOString(),
                statusHistory: [
                    ...order.statusHistory,
                    {
                        status: newStatus,
                        note: 'Status updated by admin',
                        updatedBy: 'Admin User',
                        updatedAt: new Date().toISOString()
                    }
                ]
            };

            setOrder(updatedOrder);
            toast.success(`Order status updated to ${newStatus}`);
            setShowStatusModal(false);
            setNewStatus('');
        } catch (error) {
            toast.error('Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdatePayment = async (status: string) => {
        if (!order) return;

        try {
            setUpdating(true);
            // In real app: Call API to update payment status
            const updatedOrder = {
                ...order,
                paymentStatus: status as any,
                updatedAt: new Date().toISOString()
            };

            setOrder(updatedOrder);
            toast.success(`Payment status updated to ${status}`);
            setShowPaymentModal(false);
            setPaymentNote('');
        } catch (error) {
            toast.error('Failed to update payment status');
        } finally {
            setUpdating(false);
        }
    };

    const handlePrintInvoice = () => {
        // In real app: Generate and print invoice
        toast('Invoice printing feature will be implemented');
    };

    const handleSendTracking = () => {
        if (!order?.trackingNumber) {
            toast.error('No tracking number available');
            return;
        }

        toast.success(`Tracking info sent to ${order.customer.email}`);
    };

    const getPaymentStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            paid: { variant: 'success', icon: 'check-circle' },
            pending: { variant: 'warning', icon: 'clock' },
            failed: { variant: 'danger', icon: 'times-circle' },
            refunded: { variant: 'info', icon: 'undo' }
        };

        const config = variants[status] || { variant: 'warning', icon: 'question-circle' };

        return (
            <Badge variant={config.variant}>
                <i className={`fas fa-${config.icon} mr-1`}></i>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            transfer: 'Bank Transfer',
            cod: 'Cash on Delivery',
            credit_card: 'Credit Card'
        };
        return labels[method] || method;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-800">Order not found</h2>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/orders')}
                        className="mt-4"
                    >
                        Back to Orders
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/admin/orders')}
                                icon="arrow-left"
                            >
                                Back
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Order #{order.orderNumber}
                                </h1>
                                <p className="text-gray-600">
                                    Placed on {formatDate(order.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            onClick={handlePrintInvoice}
                            icon="print"
                        >
                            Print Invoice
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowStatusModal(true)}
                            icon="sync"
                        >
                            Update Status
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowPaymentModal(true)}
                            icon="credit-card"
                        >
                            Payment
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Status Card */}
                    <Card className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Order Status</h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <OrderStatusBadge status={order.orderStatus as any} size="lg" />
                                    <span className="text-gray-600">
                                        Last updated: {formatDate(order.updatedAt)}
                                    </span>
                                </div>
                            </div>

                            {order.trackingNumber && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <i className="fas fa-truck text-blue-600"></i>
                                        <span className="font-medium">Tracking Info</span>
                                    </div>
                                    <div className="text-sm">
                                        <div>{order.courier}: {order.trackingNumber}</div>
                                        {order.estimatedDelivery && (
                                            <div className="text-gray-600">
                                                Est. delivery: {formatDate(order.estimatedDelivery)}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="text"
                                        size="sm"
                                        onClick={handleSendTracking}
                                        className="mt-2 text-blue-600 hover:text-blue-800"
                                    >
                                        <i className="fas fa-paper-plane mr-2"></i>
                                        Send to Customer
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Status Timeline */}
                        <div className="border-t pt-6">
                            <h4 className="font-bold text-gray-700 mb-4">Status History</h4>
                            <div className="space-y-4">
                                {order.statusHistory.map((history, index) => (
                                    <div key={index} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full ${history.status === 'delivered' ? 'bg-green-500' :
                                                history.status === 'shipped' ? 'bg-blue-500' :
                                                    history.status === 'processing' ? 'bg-purple-500' :
                                                        history.status === 'confirmed' ? 'bg-yellow-500' :
                                                            'bg-gray-300'
                                                }`}></div>
                                            {index < order.statusHistory.length - 1 && (
                                                <div className="w-0.5 h-8 bg-gray-200 mt-1"></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="font-medium capitalize">{history.status}</span>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(history.updatedAt)}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {history.note} • By {history.updatedBy}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Order Items */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Order Items</h3>

                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex gap-4 p-4 border rounded-lg">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.image || '/images/placeholder/product.jpg'}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <div>
                                                <h4 className="font-medium">{item.name}</h4>
                                                <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">
                                                    Rp {formatCurrency(item.total)}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Rp {formatCurrency(item.price)} × {item.quantity}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 mt-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/admin/products/${item.productId}`)}
                                                icon="external-link-alt"
                                            >
                                                View Product
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toast('Return/refund feature coming soon')}
                                                icon="undo"
                                            >
                                                Return/Refund
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="border-t mt-6 pt-6">
                            <h4 className="font-bold text-gray-700 mb-4">Order Summary</h4>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span>Rp {formatCurrency(order.totalAmount)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping:</span>
                                    <span>Rp {formatCurrency(order.shippingCost)}</span>
                                </div>

                                {order.discount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Discount:</span>
                                        <span className="text-green-600">-Rp {formatCurrency(order.discount)}</span>
                                    </div>
                                )}

                                {order.tax > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax:</span>
                                        <span>Rp {formatCurrency(order.tax)}</span>
                                    </div>
                                )}

                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total:</span>
                                        <span>Rp {formatCurrency(order.grandTotal)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Notes */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Notes</h3>

                        <div className="space-y-4">
                            {order.notes && (
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Customer Notes</h4>
                                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                        {order.notes}
                                    </p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Admin Notes</h4>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Add internal notes about this order..."
                                    defaultValue={order.adminNotes}
                                ></textarea>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => toast.success('Notes saved')}
                                >
                                    Save Notes
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Customer & Payment Info */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h3>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                                <img
                                    src={order.customer.avatar || '/images/avatars/default.jpg'}
                                    alt={order.customer.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h4 className="font-bold">{order.customer.name}</h4>
                                <p className="text-sm text-gray-600">{order.customer.email}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Phone:</span>
                                <span>{order.customer.phone}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Customer ID:</span>
                                <span>{order.customer.id}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => navigate(`/admin/customers/${order.customer.id}`)}
                                icon="user"
                            >
                                View Profile
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => toast('Message feature coming soon')}
                                icon="envelope"
                            >
                                Message
                            </Button>
                        </div>
                    </Card>

                    {/* Payment Information */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Information</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method:</span>
                                <span className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Status:</span>
                                {getPaymentStatusBadge(order.paymentStatus)}
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-bold">Rp {formatCurrency(order.grandTotal)}</span>
                            </div>

                            {order.paymentProof && (
                                <div>
                                    <span className="text-gray-600 block mb-2">Payment Proof:</span>
                                    <div className="relative group">
                                        <img
                                            src={order.paymentProof}
                                            alt="Payment proof"
                                            className="w-full h-32 object-cover rounded-lg border"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(order.paymentProof, '_blank')}
                                                className="bg-white"
                                            >
                                                <i className="fas fa-expand mr-2"></i>
                                                View Full
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button
                                variant="success"
                                onClick={() => handleUpdatePayment('paid')}
                                disabled={updating}
                                icon="check-circle"
                            >
                                Verify Payment
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => toast('Refund feature coming soon')}
                                disabled={updating}
                                icon="undo"
                            >
                                Process Refund
                            </Button>
                        </div>
                    </Card>

                    {/* Shipping Address */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h3>

                        <div className="space-y-2">
                            <div>
                                <span className="font-medium">{order.shippingAddress.name}</span>
                                <div className="text-gray-600">{order.shippingAddress.phone}</div>
                            </div>

                            <div className="text-gray-700">
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                                <p>Postal Code: {order.shippingAddress.postalCode}</p>
                            </div>

                            {order.shippingAddress.notes && (
                                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        <i className="fas fa-exclamation-circle mr-2"></i>
                                        {order.shippingAddress.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4"
                            onClick={() => toast('Shipping label feature coming soon')}
                            icon="truck"
                        >
                            Print Shipping Label
                        </Button>
                    </Card>

                    {/* Billing Address */}
                    {order.billingAddress && (
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Billing Address</h3>

                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium">{order.billingAddress.name}</span>
                                    <div className="text-gray-600">{order.billingAddress.phone}</div>
                                </div>

                                <div className="text-gray-700">
                                    <p>{order.billingAddress.address}</p>
                                    <p>{order.billingAddress.city}, {order.billingAddress.province}</p>
                                    <p>Postal Code: {order.billingAddress.postalCode}</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Update Status Modal */}
            <Modal
                isOpen={showStatusModal}
                onClose={() => {
                    setShowStatusModal(false);
                    setNewStatus('');
                }}
                title="Update Order Status"
            >
                <div className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Order:</span>
                            <span className="font-bold">#{order.orderNumber}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Current Status:</span>
                            <OrderStatusBadge status={order.orderStatus as any} />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Status
                        </label>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select new status</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        {newStatus === 'shipped' && (
                            <div className="mt-4 space-y-3">
                                <input
                                    type="text"
                                    placeholder="Tracking Number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="">Select Courier</option>
                                    <option value="jne">JNE</option>
                                    <option value="tiki">TIKI</option>
                                    <option value="pos">POS Indonesia</option>
                                </select>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowStatusModal(false);
                                setNewStatus('');
                            }}
                            className="flex-1"
                            disabled={updating}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUpdateStatus}
                            loading={updating}
                            disabled={!newStatus || updating}
                            className="flex-1"
                        >
                            Update Status
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false);
                    setPaymentNote('');
                }}
                title="Manage Payment"
            >
                <div className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Order:</span>
                            <span className="font-bold">#{order.orderNumber}</span>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-medium">Current Status:</span>
                            {getPaymentStatusBadge(order.paymentStatus)}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="text-center text-lg font-bold">
                                Rp {formatCurrency(order.grandTotal)}
                            </div>
                            <div className="text-center text-gray-600">
                                {getPaymentMethodLabel(order.paymentMethod)}
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={paymentNote}
                            onChange={(e) => setPaymentNote(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            rows={3}
                            placeholder="Add notes about this payment..."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <Button
                            variant="success"
                            onClick={() => handleUpdatePayment('paid')}
                            disabled={updating}
                            icon="check-circle"
                        >
                            Mark as Paid
                        </Button>
                        <Button
                            variant="text"
                            className="bg-yellow-500 text-white hover:bg-yellow-600"
                            onClick={() => handleUpdatePayment('pending')}
                            disabled={updating}
                            icon="clock"
                        >
                            Mark as Pending
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => handleUpdatePayment('failed')}
                            disabled={updating}
                            icon="times-circle"
                        >
                            Mark as Failed
                        </Button>
                        <Button
                            variant="text"
                            className="bg-blue-400 text-white hover:bg-blue-500"
                            onClick={() => handleUpdatePayment('refunded')}
                            disabled={updating}
                            icon="undo"
                        >
                            Mark as Refunded
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setShowPaymentModal(false)}
                        className="w-full"
                        disabled={updating}
                    >
                        Cancel
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminOrderDetailPage;
