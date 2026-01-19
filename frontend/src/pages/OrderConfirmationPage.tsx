// frontend/src/pages/OrderConfirmationPage.tsx
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/UI';

const OrderConfirmationPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    // Mock order data - in real app, fetch from API
    const order = {
        id: orderId || 'ORD123456',
        orderNumber: orderId || 'ORD123456',
        date: new Date().toLocaleDateString('id-ID'),
        status: 'pending',
        total: 4250000,
        items: [
            { name: 'Mesin Cuci LG 8kg', quantity: 1, price: 3500000 },
            { name: 'Pipa Pembuangan', quantity: 1, price: 750000 },
        ],
        shippingAddress: {
            name: 'Rumah',
            recipient: 'John Doe',
            address: 'Jl. Merdeka No. 123, Jakarta Pusat',
            phone: '081234567890',
        },
        paymentMethod: 'Bank Transfer - BCA',
        estimatedDelivery: '3-5 hari kerja',
    };

    const handleTrackOrder = () => {
        navigate(`/user/orders/${order.id}`);
    };

    const handleContinueShopping = () => {
        navigate('/products');
    };

    return (
        <div className="order-confirmation min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-12">
                        <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-check-circle text-green-600 text-5xl"></i>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Terima Kasih! Pesanan Anda Telah Diterima
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Pesanan #{order.orderNumber} sedang diproses
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Order Details */}
                        <div className="lg:col-span-2">
                            {/* Order Summary Card */}
                            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                                <h2 className="text-xl font-bold mb-6">Detail Pesanan</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-bold text-gray-700 mb-2">Informasi Pesanan</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Nomor Pesanan:</span>
                                                <span className="font-medium">{order.orderNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Tanggal:</span>
                                                <span className="font-medium">{order.date}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total:</span>
                                                <span className="font-bold text-blue-600">
                                                    Rp {order.total.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-700 mb-2">Informasi Pengiriman</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Estimasi:</span>
                                                <span className="font-medium">{order.estimatedDelivery}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Metode:</span>
                                                <span className="font-medium">{order.paymentMethod}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="mt-8">
                                    <h3 className="font-bold text-gray-700 mb-4">Produk yang Dipesan</h3>
                                    <div className="space-y-4">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <h4 className="font-medium">{item.name}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {item.quantity} × Rp {item.price.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="font-bold">
                                                    Rp {(item.quantity * item.price).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Next Steps */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold mb-6">Langkah Selanjutnya</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                                        <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                            <i className="fas fa-money-bill-wave text-blue-600 text-xl"></i>
                                        </div>
                                        <h3 className="font-bold text-blue-800 mb-2">1. Pembayaran</h3>
                                        <p className="text-sm text-blue-700">
                                            Selesaikan pembayaran dalam 24 jam
                                        </p>
                                    </div>

                                    <div className="text-center p-4 border-2 border-green-200 rounded-lg bg-green-50">
                                        <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                            <i className="fas fa-clipboard-check text-green-600 text-xl"></i>
                                        </div>
                                        <h3 className="font-bold text-green-800 mb-2">2. Konfirmasi</h3>
                                        <p className="text-sm text-green-700">
                                            Tunggu konfirmasi dari admin kami
                                        </p>
                                    </div>

                                    <div className="text-center p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                                        <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                                            <i className="fas fa-truck text-purple-600 text-xl"></i>
                                        </div>
                                        <h3 className="font-bold text-purple-800 mb-2">3. Pengiriman</h3>
                                        <p className="text-sm text-purple-700">
                                            Lacak pengiriman pesanan Anda
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Actions */}
                        <div className="lg:col-span-1">
                            {/* Shipping Address */}
                            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                                <h2 className="text-xl font-bold mb-4">Alamat Pengiriman</h2>
                                <div className="space-y-2">
                                    <p className="font-medium">{order.shippingAddress.recipient}</p>
                                    <p className="text-gray-600">{order.shippingAddress.address}</p>
                                    <p className="text-gray-600">{order.shippingAddress.phone}</p>
                                </div>
                            </div>

                            {/* Payment Instructions */}
                            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                                <h2 className="text-xl font-bold mb-4">Instruksi Pembayaran</h2>
                                <ol className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
                                        <span>Cek email untuk detail pembayaran</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
                                        <span>Selesaikan pembayaran sesuai metode</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</span>
                                        <span>Upload bukti pembayaran jika diperlukan</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">4</span>
                                        <span>Tunggu konfirmasi dari admin</span>
                                    </li>
                                </ol>
                            </div>

                            {/* Action Buttons */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="space-y-4">
                                    <Button
                                        variant="primary"
                                        onClick={handleTrackOrder}
                                        className="w-full"
                                        icon="eye"
                                    >
                                        Lacak Pesanan
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={handleContinueShopping}
                                        className="w-full"
                                        icon="shopping-bag"
                                    >
                                        Lanjut Belanja
                                    </Button>

                                    <Link to="/user/orders">
                                        <Button
                                            variant="text"
                                            className="w-full"
                                            icon="history"
                                        >
                                            Lihat Riwayat
                                        </Button>
                                    </Link>
                                </div>

                                {/* Need Help */}
                                <div className="mt-6 pt-6 border-t">
                                    <p className="text-sm text-gray-600 mb-3">Butuh bantuan?</p>
                                    <div className="space-y-2">
                                        <a href="tel:1500123" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                                            <i className="fas fa-phone-alt"></i>
                                            <span>1500-123 (24/7)</span>
                                        </a>
                                        <a href="mailto:support@mesincucistore.com" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                                            <i className="fas fa-envelope"></i>
                                            <span>support@mesincucistore.com</span>
                                        </a>
                                        <Link to="/contact" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                                            <i className="fas fa-headset"></i>
                                            <span>Live Chat</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-6">Status Pesanan</h2>
                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 -translate-y-1/2"></div>

                            {/* Timeline Steps */}
                            <div className="relative flex justify-between">
                                {[
                                    { status: 'order_placed', label: 'Pesanan Dibuat', date: 'Hari ini', active: true },
                                    { status: 'payment_pending', label: 'Menunggu Pembayaran', date: '-', active: false },
                                    { status: 'processing', label: 'Diproses', date: '-', active: false },
                                    { status: 'shipped', label: 'Dikirim', date: '-', active: false },
                                    { status: 'delivered', label: 'Sampai', date: '-', active: false },
                                ].map((step, index) => (
                                    <div key={step.status} className="flex flex-col items-center">
                                        <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center z-10
                      ${step.active ? 'bg-blue-600' : 'bg-gray-200'}
                    `}>
                                            {step.active ? (
                                                <i className="fas fa-check text-white text-xs"></i>
                                            ) : (
                                                <span className="text-gray-600 text-xs">{index + 1}</span>
                                            )}
                                        </div>
                                        <div className="mt-3 text-center">
                                            <div className={`text-sm font-medium ${step.active ? 'text-blue-600' : 'text-gray-500'}`}>
                                                {step.label}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">{step.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
