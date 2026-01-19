// frontend/src/pages/User/OrderDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, LoadingSpinner, Alert, Modal, Badge } from '../../components/UI';
import { PriceDisplay } from '../../components/Shared';
import orderService from '../../services/orderService';
import { useAuth } from '../../hooks/useAuth';

const UserOrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [confirmingDelivery, setConfirmingDelivery] = useState(false);

    useEffect(() => {
        if (id) {
            loadOrderDetails();
        }
    }, [id]);

    const loadOrderDetails = async () => {
        setLoading(true);
        try {
            // In real app: const data = await orderService.getOrderById(id);
            // Mock data
            const mockOrder = {
                id: id || 'ORD-001',
                orderNumber: id || 'ORD-001',
                date: '2024-01-15T10:30:00Z',
                status: 'shipped',
                statusHistory: [
                    { status: 'pending', date: '2024-01-15T10:30:00Z', notes: 'Pesanan dibuat' },
                    { status: 'confirmed', date: '2024-01-15T11:00:00Z', notes: 'Pembayaran dikonfirmasi' },
                    { status: 'processing', date: '2024-01-16T09:00:00Z', notes: 'Pesanan diproses' },
                    { status: 'shipped', date: '2024-01-17T14:30:00Z', notes: 'Pesanan dikirim' },
                ],
                items: [
                    {
                        id: '1',
                        productId: 'prod-001',
                        productName: 'Mesin Cuci LG 8kg Front Loading',
                        productSku: 'LG-FL8-2024',
                        price: 3500000,
                        quantity: 1,
                        subtotal: 3500000,
                        imageUrl: '/images/products/lg-8kg.jpg',
                    },
                    {
                        id: '2',
                        productId: 'prod-002',
                        productName: 'Pipa Pembuangan Mesin Cuci',
                        productSku: 'PIPE-001',
                        price: 150000,
                        quantity: 1,
                        subtotal: 150000,
                        imageUrl: '/images/products/pipa.jpg',
                    },
                ],
                shippingAddress: {
                    name: 'Rumah',
                    recipient: 'John Doe',
                    phone: '081234567890',
                    address: 'Jl. Merdeka No. 123, RT 01/RW 02',
                    city: 'Jakarta Pusat',
                    province: 'DKI Jakarta',
                    postalCode: '10110',
                },
                billingAddress: {
                    name: 'Rumah',
                    recipient: 'John Doe',
                    phone: '081234567890',
                    address: 'Jl. Merdeka No. 123, RT 01/RW 02',
                    city: 'Jakarta Pusat',
                    province: 'DKI Jakarta',
                    postalCode: '10110',
                },
                shippingMethod: 'JNE Express',
                shippingProvider: 'JNE',
                shippingCost: 25000,
                paymentMethod: 'Bank Transfer - BCA',
                paymentProvider: 'BCA',
                subtotal: 3650000,
                tax: 401500,
                total: 4071500,
                discount: 0,
                notes: 'Tolong antar sebelum jam 2 siang',
                trackingNumber: 'JNE123456789ID',
                trackingUrl: 'https://tracking.jne.co.id',
                estimatedDelivery: '2024-01-20',
                deliveredAt: null,
                cancellationReason: null,
            };

            setOrder(mockOrder);
        } catch (error: any) {
            // Alert.error(error.message || 'Gagal memuat detail pesanan');
            console.error(error);
            navigate('/user/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            // Alert.error('Harap berikan alasan pembatalan');
            alert('Harap berikan alasan pembatalan');
            return;
        }

        setCancelling(true);
        try {
            // In real app: await orderService.cancelOrder(id, cancelReason);
            // Alert.success('Pesanan berhasil dibatalkan');
            alert('Pesanan berhasil dibatalkan');
            setShowCancelModal(false);
            loadOrderDetails(); // Refresh data
        } catch (error: any) {
            // Alert.error(error.message || 'Gagal membatalkan pesanan');
            alert(error.message || 'Gagal membatalkan pesanan');
        } finally {
            setCancelling(false);
            setCancelReason('');
        }
    };

    const handleConfirmDelivery = async () => {
        setConfirmingDelivery(true);
        try {
            // In real app: await orderService.confirmDelivery(id);
            // Alert.success('Terima kasih! Pesanan telah dikonfirmasi diterima');
            alert('Terima kasih! Pesanan telah dikonfirmasi diterima');
            loadOrderDetails(); // Refresh data
        } catch (error: any) {
            // Alert.error('Gagal mengkonfirmasi penerimaan');
            alert('Gagal mengkonfirmasi penerimaan');
        } finally {
            setConfirmingDelivery(false);
        }
    };

    const handleDownloadInvoice = () => {
        setShowInvoiceModal(true);
        // In real app: Generate and download PDF invoice
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    const handleContactSupport = () => {
        navigate('/contact', { state: { orderNumber: order?.orderNumber } });
    };

    const handleReorder = () => {
        // Add all items to cart
        // navigate('/cart');
        // Alert.info('Fitur reorder akan segera tersedia');
        alert('Fitur reorder akan segera tersedia');
    };

    const handleLeaveReview = (productId: string) => {
        navigate(`/products/${productId}#reviews`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'yellow';
            case 'confirmed': return 'blue';
            case 'processing': return 'purple';
            case 'shipped': return 'indigo'; // Assuming indigo is mapped or uses default
            case 'delivered': return 'green';
            case 'cancelled': return 'red';
            default: return 'gray';
        }
    };

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: 'Menunggu Pembayaran',
            confirmed: 'Dikonfirmasi',
            processing: 'Diproses',
            shipped: 'Dikirim',
            delivered: 'Sampai',
            cancelled: 'Dibatalkan',
        };
        return statusMap[status] || status;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return 'clock';
            case 'confirmed': return 'check-circle';
            case 'processing': return 'cog';
            case 'shipped': return 'truck';
            case 'delivered': return 'check-double';
            case 'cancelled': return 'times-circle';
            default: return 'question-circle';
        }
    };

    const canCancelOrder = order && ['pending', 'confirmed', 'processing'].includes(order.status);
    const canConfirmDelivery = order && order.status === 'shipped' && !order.deliveredAt;
    const canReviewOrder = order && order.status === 'delivered';

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 mx-auto mb-6 text-gray-300">
                        <i className="fas fa-exclamation-triangle text-5xl"></i>
                    </div>
                    <h1 className="text-2xl font-bold mb-4">Pesanan Tidak Ditemukan</h1>
                    <p className="text-gray-600 mb-8">
                        Pesanan yang Anda cari tidak ditemukan atau telah dihapus.
                    </p>
                    <Link to="/user/orders">
                        <Button variant="primary">
                            Kembali ke Daftar Pesanan
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="user-order-detail">
            {/* Print Styles */}
            <style>
                {`
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { background: white !important; }
            .container { max-width: 100% !important; padding: 0 !important; }
          }
          .print-only { display: none; }
        `}
            </style>

            {/* Header */}
            <div className="bg-gray-50 py-6 no-print">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <nav className="flex items-center text-sm text-gray-600 mb-2">
                                <Link to="/user/dashboard" className="hover:text-blue-600">Dashboard</Link>
                                <i className="fas fa-chevron-right mx-2 text-xs"></i>
                                <Link to="/user/orders" className="hover:text-blue-600">Pesanan Saya</Link>
                                <i className="fas fa-chevron-right mx-2 text-xs"></i>
                                <span className="text-gray-900 font-medium">{order.orderNumber}</span>
                            </nav>
                            <h1 className="text-2xl font-bold">Detail Pesanan</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/user/orders')}
                                icon="arrow-left"
                            >
                                Kembali
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleDownloadInvoice}
                                icon="file-invoice"
                            >
                                Invoice
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Order Details */}
                    <div className="lg:col-span-2">
                        {/* Order Status Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-bold">{order.orderNumber}</h2>
                                        <Badge variant={getStatusColor(order.status) as any}>
                                            <i className={`fas fa-${getStatusIcon(order.status)} mr-2`}></i>
                                            {getStatusText(order.status)}
                                        </Badge>
                                    </div>
                                    <p className="text-gray-600">
                                        Tanggal: {new Date(order.date).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <div className="text-3xl font-bold text-blue-600">
                                        Rp {order.total.toLocaleString()}
                                    </div>
                                    <p className="text-sm text-gray-600">Total pembayaran</p>
                                </div>
                            </div>

                            {/* Order Timeline */}
                            <div className="border-t pt-6">
                                <h3 className="font-bold text-lg mb-4">Status Pesanan</h3>
                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 ml-4"></div>

                                    {/* Timeline Items */}
                                    <div className="space-y-6">
                                        {order.statusHistory.map((history: any, index: number) => (
                                            <div key={index} className="relative flex items-start">
                                                <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center z-10 mr-4
                          ${history.status === order.status ? 'bg-blue-600' : 'bg-gray-300'}
                        `}>
                                                    {history.status === order.status ? (
                                                        <i className="fas fa-check text-white text-xs"></i>
                                                    ) : (
                                                        <span className="text-gray-600 text-xs">{index + 1}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <h4 className="font-medium">
                                                            {getStatusText(history.status)}
                                                        </h4>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(history.date).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    {history.notes && (
                                                        <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <h2 className="text-xl font-bold mb-6">Produk yang Dipesan</h2>

                            <div className="space-y-6">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="border-b pb-6 last:border-0 last:pb-0">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            {/* Product Image */}
                                            <div className="flex-shrink-0">
                                                <Link to={`/products/${item.productId}`}>
                                                    <div className="w-24 h-24 rounded-lg overflow-hidden border">
                                                        {item.imageUrl ? (
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={item.productName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                                <i className="fas fa-washing-machine text-gray-400 text-2xl"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between">
                                                    <div className="flex-1">
                                                        <Link to={`/products/${item.productId}`}>
                                                            <h3 className="font-bold text-lg text-gray-900 hover:text-blue-600">
                                                                {item.productName}
                                                            </h3>
                                                        </Link>
                                                        <p className="text-sm text-gray-600 mt-1">SKU: {item.productSku}</p>
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <span className="text-gray-700">
                                                                {item.quantity} × <PriceDisplay price={item.price} />
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 md:mt-0 text-right">
                                                        <div className="text-xl font-bold">
                                                            Rp {(item.price * item.quantity).toLocaleString()}
                                                        </div>
                                                        <div className="text-sm text-gray-600">Subtotal</div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-wrap gap-3 mt-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/products/${item.productId}`)}
                                                    >
                                                        <i className="fas fa-eye mr-2"></i>
                                                        Lihat Produk
                                                    </Button>

                                                    {canReviewOrder && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleLeaveReview(item.productId)}
                                                        >
                                                            <i className="fas fa-star mr-2"></i>
                                                            Beri Ulasan
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="text"
                                                        size="sm"
                                                        onClick={() => {/* Add to cart logic */ }}
                                                    >
                                                        <i className="fas fa-shopping-cart mr-2"></i>
                                                        Beli Lagi
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping & Payment Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Shipping Address */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <i className="fas fa-map-marker-alt text-blue-600"></i>
                                    Alamat Pengiriman
                                </h3>
                                <div className="space-y-2">
                                    <p className="font-medium">{order.shippingAddress.recipient}</p>
                                    <p className="text-gray-700">{order.shippingAddress.address}</p>
                                    <p className="text-gray-700">
                                        {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                                    </p>
                                    <p className="text-gray-700">
                                        <i className="fas fa-phone mr-2"></i>
                                        {order.shippingAddress.phone}
                                    </p>
                                </div>
                            </div>

                            {/* Payment & Shipping Method */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <i className="fas fa-truck text-green-600"></i>
                                    Pengiriman & Pembayaran
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Metode Pengiriman</p>
                                        <p className="font-medium">{order.shippingMethod}</p>
                                        {order.trackingNumber && (
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-600">Nomor Resi</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{order.trackingNumber}</p>
                                                    {order.trackingUrl && (
                                                        <a
                                                            href={order.trackingUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                                        >
                                                            <i className="fas fa-external-link-alt"></i> Lacak
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Metode Pembayaran</p>
                                        <p className="font-medium">{order.paymentMethod}</p>
                                    </div>

                                    {order.estimatedDelivery && (
                                        <div>
                                            <p className="text-sm text-gray-600">Estimasi Sampai</p>
                                            <p className="font-medium">
                                                {new Date(order.estimatedDelivery).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Notes */}
                        {order.notes && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                                <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                                    <i className="fas fa-sticky-note"></i>
                                    Catatan Pesanan
                                </h3>
                                <p className="text-yellow-700">{order.notes}</p>
                            </div>
                        )}

                        {/* Order Actions */}
                        <div className="bg-white rounded-xl shadow-lg p-6 no-print">
                            <h3 className="font-bold text-lg mb-4">Aksi</h3>
                            <div className="flex flex-wrap gap-3">
                                {canCancelOrder && (
                                    <Button
                                        variant="danger"
                                        onClick={() => setShowCancelModal(true)}
                                        icon="times-circle"
                                    >
                                        Batalkan Pesanan
                                    </Button>
                                )}

                                {canConfirmDelivery && (
                                    <Button
                                        variant="success"
                                        onClick={handleConfirmDelivery}
                                        loading={confirmingDelivery}
                                        icon="check-double"
                                    >
                                        Konfirmasi Diterima
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    onClick={handleReorder}
                                    icon="redo"
                                >
                                    Pesan Ulang
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={handleContactSupport}
                                    icon="headset"
                                >
                                    Bantuan
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={handlePrintInvoice}
                                    icon="print"
                                >
                                    Cetak
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                            <h2 className="text-xl font-bold mb-6">Ringkasan Pesanan</h2>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal Produk</span>
                                    <span className="font-medium">Rp {order.subtotal.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Biaya Pengiriman</span>
                                    <span className="font-medium">Rp {order.shippingCost.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">PPN (11%)</span>
                                    <span className="font-medium">Rp {order.tax.toLocaleString()}</span>
                                </div>

                                {order.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Diskon</span>
                                        <span className="font-medium">- Rp {order.discount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Grand Total */}
                            <div className="border-t pt-4 mb-6">
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span className="text-blue-600">Rp {order.total.toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Sudah termasuk PPN</p>
                            </div>

                            {/* Payment Info */}
                            <div className="border-t pt-6">
                                <h3 className="font-bold mb-3">Informasi Pembayaran</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status Pembayaran:</span>
                                        <Badge variant={order.status === 'pending' ? 'warning' : 'success'}>
                                            {order.status === 'pending' ? 'Menunggu' : 'Lunas'}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Invoice:</span>
                                        <span className="font-medium">{order.orderNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tanggal Invoice:</span>
                                        <span className="font-medium">
                                            {new Date(order.date).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Need Help */}
                            <div className="border-t pt-6 mt-6">
                                <h3 className="font-bold mb-3">Butuh Bantuan?</h3>
                                <div className="space-y-2">
                                    <a
                                        href={`tel:1500123`}
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                    >
                                        <i className="fas fa-phone-alt"></i>
                                        <span>1500-123 (24/7)</span>
                                    </a>
                                    <a
                                        href={`mailto:support@mesincucistore.com?subject=Bantuan Pesanan ${order.orderNumber}`}
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                    >
                                        <i className="fas fa-envelope"></i>
                                        <span>support@mesincucistore.com</span>
                                    </a>
                                    <Link
                                        to="/contact"
                                        state={{ orderNumber: order.orderNumber }}
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                    >
                                        <i className="fas fa-headset"></i>
                                        <span>Live Chat</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Order Modal */}
            <Modal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                title="Batalkan Pesanan"
            >
                <div className="p-6">
                    <div className="mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-center mb-2">
                            Yakin ingin membatalkan pesanan?
                        </h3>
                        <p className="text-gray-600 text-center mb-4">
                            Pesanan {order.orderNumber} akan dibatalkan. Tindakan ini tidak dapat dibatalkan.
                        </p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alasan Pembatalan *
                        </label>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Mohon berikan alasan pembatalan..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelModal(false)}
                            className="flex-1"
                            disabled={cancelling}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleCancelOrder}
                            loading={cancelling}
                            disabled={cancelling || !cancelReason.trim()}
                            className="flex-1"
                        >
                            Ya, Batalkan Pesanan
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Invoice Modal */}
            <Modal
                isOpen={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                title="Invoice Pesanan"
                size="lg"
            >
                <div className="p-6">
                    {/* Invoice Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                        <p className="text-gray-600">MesinCuciStore - Toko Mesin Cuci Terlengkap</p>
                    </div>

                    {/* Invoice Info */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <h3 className="font-bold mb-2">Dikirim Kepada:</h3>
                            <p className="font-medium">{order.shippingAddress.recipient}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                            <p>{order.shippingAddress.postalCode}</p>
                            <p>{order.shippingAddress.phone}</p>
                        </div>

                        <div className="text-right">
                            <h3 className="font-bold mb-2">Informasi Invoice:</h3>
                            <p><strong>No. Invoice:</strong> {order.orderNumber}</p>
                            <p><strong>Tanggal:</strong> {new Date(order.date).toLocaleDateString('id-ID')}</p>
                            <p><strong>Status:</strong> {getStatusText(order.status)}</p>
                            <p><strong>Metode Bayar:</strong> {order.paymentMethod}</p>
                        </div>
                    </div>

                    {/* Invoice Items Table */}
                    <div className="mb-8">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-3 text-left">Produk</th>
                                    <th className="border p-3 text-center">Qty</th>
                                    <th className="border p-3 text-right">Harga</th>
                                    <th className="border p-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item: any) => (
                                    <tr key={item.id}>
                                        <td className="border p-3">{item.productName}</td>
                                        <td className="border p-3 text-center">{item.quantity}</td>
                                        <td className="border p-3 text-right">Rp {item.price.toLocaleString()}</td>
                                        <td className="border p-3 text-right">Rp {(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Invoice Total */}
                    <div className="text-right">
                        <div className="inline-block text-left">
                            <div className="flex justify-between gap-8 mb-2">
                                <span>Subtotal:</span>
                                <span>Rp {order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-8 mb-2">
                                <span>Pengiriman:</span>
                                <span>Rp {order.shippingCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-8 mb-2">
                                <span>PPN (11%):</span>
                                <span>Rp {order.tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-8 text-xl font-bold border-t pt-2 mt-2">
                                <span>TOTAL:</span>
                                <span className="text-blue-600">Rp {order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Footer */}
                    <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
                        <p>Terima kasih telah berbelanja di MesinCuciStore</p>
                        <p>Invoice ini sah secara hukum dan dapat digunakan sebagai bukti pembayaran</p>
                        <p className="mt-4">www.mesincucistore.com • support@mesincucistore.com • 1500-123</p>
                    </div>

                    {/* Invoice Actions */}
                    <div className="flex gap-3 mt-8">
                        <Button
                            variant="outline"
                            onClick={() => setShowInvoiceModal(false)}
                            className="flex-1"
                        >
                            Tutup
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handlePrintInvoice}
                            className="flex-1"
                            icon="print"
                        >
                            Cetak Invoice
                        </Button>
                        <Button
                            variant="success"
                            onClick={() => {/* Download PDF logic */ }}
                            className="flex-1"
                            icon="download"
                        >
                            Download PDF
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Print Invoice Section */}
            <div className="print-only">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold">INVOICE</h1>
                        <h2 className="text-xl">MesinCuciStore</h2>
                        <p>Jl. Contoh No. 123, Jakarta</p>
                        <p>Telp: 1500-123 • Email: support@mesincucistore.com</p>
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between mb-4">
                            <div>
                                <h3 className="font-bold">Kepada:</h3>
                                <p>{order.shippingAddress.recipient}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                                <p>Telp: {order.shippingAddress.phone}</p>
                            </div>
                            <div className="text-right">
                                <p><strong>No. Invoice:</strong> {order.orderNumber}</p>
                                <p><strong>Tanggal:</strong> {new Date(order.date).toLocaleDateString('id-ID')}</p>
                                <p><strong>Status:</strong> {getStatusText(order.status)}</p>
                            </div>
                        </div>
                    </div>

                    <table className="w-full border-collapse mb-8">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 text-left">Produk</th>
                                <th className="border p-2 text-center">Qty</th>
                                <th className="border p-2 text-right">Harga</th>
                                <th className="border p-2 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item: any) => (
                                <tr key={item.id}>
                                    <td className="border p-2">{item.productName}</td>
                                    <td className="border p-2 text-center">{item.quantity}</td>
                                    <td className="border p-2 text-right">Rp {item.price.toLocaleString()}</td>
                                    <td className="border p-2 text-right">Rp {(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="text-right">
                        <div className="inline-block text-left">
                            <p>Subtotal: Rp {order.subtotal.toLocaleString()}</p>
                            <p>Pengiriman: Rp {order.shippingCost.toLocaleString()}</p>
                            <p>PPN: Rp {order.tax.toLocaleString()}</p>
                            <p className="text-xl font-bold mt-2">TOTAL: Rp {order.total.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="mt-16 text-center text-sm">
                        <p>Terima kasih atas kepercayaan Anda</p>
                        <p>www.mesincucistore.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserOrderDetailPage;
