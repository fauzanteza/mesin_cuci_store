// frontend/src/pages/User/OrdersPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, LoadingSpinner, Select, Badge } from '../../components/UI';
import orderService from '../../services/orderService';

const UserOrdersPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 1,
    });

    useEffect(() => {
        loadOrders();
    }, [filter, pagination.page]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            // const response = await orderService.getUserOrders({
            //   status: filter !== 'all' ? filter : undefined,
            //   page: pagination.page,
            //   limit: 10
            // });

            // Mock data
            const mockOrders = [
                {
                    id: 'ORD-001',
                    orderNumber: 'ORD-001',
                    date: '2024-01-15',
                    total: 3500000,
                    status: 'delivered',
                    items: [
                        { name: 'Mesin Cuci LG 8kg', quantity: 1, price: 3500000 }
                    ]
                },
                {
                    id: 'ORD-002',
                    orderNumber: 'ORD-002',
                    date: '2024-01-10',
                    total: 4200000,
                    status: 'processing',
                    items: [
                        { name: 'Mesin Cuci Samsung 9kg', quantity: 1, price: 4200000 }
                    ]
                },
                {
                    id: 'ORD-003',
                    orderNumber: 'ORD-003',
                    date: '2024-01-05',
                    total: 2800000,
                    status: 'shipped',
                    items: [
                        { name: 'Mesin Cuci Sharp 7kg', quantity: 1, price: 2800000 }
                    ]
                }
            ];

            setOrders(mockOrders);
            setPagination({
                page: 1,
                total: 3,
                totalPages: 1,
            });
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'yellow';
            case 'processing': return 'blue';
            case 'shipped': return 'purple';
            case 'delivered': return 'green';
            case 'cancelled': return 'red';
            default: return 'gray';
        }
    };

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: 'Menunggu Pembayaran',
            processing: 'Diproses',
            shipped: 'Dikirim',
            delivered: 'Sampai',
            cancelled: 'Dibatalkan'
        };
        return statusMap[status] || status;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="user-orders">
            <div className="bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">Pesanan Saya</h1>
                    <p className="text-gray-600">Kelola dan lacak pesanan Anda</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Filter Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            options={[
                                { value: 'all', label: 'Semua Status' },
                                { value: 'pending', label: 'Menunggu Pembayaran' },
                                { value: 'processing', label: 'Diproses' },
                                { value: 'shipped', label: 'Dikirim' },
                                { value: 'delivered', label: 'Sampai' },
                                { value: 'cancelled', label: 'Dibatalkan' },
                            ]}
                            className="w-full md:w-64"
                        />
                    </div>

                    <div className="text-sm text-gray-600">
                        Menampilkan {orders.length} dari {pagination.total} pesanan
                    </div>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow">
                        <div className="w-20 h-20 mx-auto mb-6 text-gray-300">
                            <i className="fas fa-shopping-bag text-5xl"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">Belum Ada Pesanan</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Anda belum melakukan pembelian. Mulai belanja untuk menemukan mesin cuci terbaik!
                        </p>
                        <Link to="/products">
                            <Button variant="primary" size="lg">
                                <i className="fas fa-shopping-bag mr-2"></i>
                                Mulai Belanja
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-xl shadow overflow-hidden">
                                {/* Order Header */}
                                <div className="p-6 border-b">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold">{order.orderNumber}</h3>
                                                <Badge variant={getStatusColor(order.status)}>
                                                    {getStatusText(order.status)}
                                                </Badge>
                                            </div>
                                            <p className="text-gray-600">
                                                Tanggal: {new Date(order.date).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-blue-600">
                                                Rp {order.total.toLocaleString()}
                                            </p>
                                            <p className="text-sm text-gray-600">Total pembayaran</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.items.map((item: any, index: number) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0">
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                        <i className="fas fa-washing-machine text-gray-400"></i>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{item.name}</h4>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-sm text-gray-600">
                                                            {item.quantity} × Rp {item.price.toLocaleString()}
                                                        </span>
                                                        <span className="font-medium">
                                                            Rp {(item.quantity * item.price).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Actions */}
                                    <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                                        <Link to={`/user/orders/${order.id}`}>
                                            <Button variant="outline" size="sm">
                                                <i className="fas fa-eye mr-2"></i>
                                                Lihat Detail
                                            </Button>
                                        </Link>

                                        {order.status === 'pending' && (
                                            <Button variant="primary" size="sm">
                                                <i className="fas fa-credit-card mr-2"></i>
                                                Bayar Sekarang
                                            </Button>
                                        )}

                                        {order.status === 'shipped' && (
                                            <Button variant="success" size="sm">
                                                <i className="fas fa-check mr-2"></i>
                                                Konfirmasi Diterima
                                            </Button>
                                        )}

                                        {['pending', 'processing'].includes(order.status) && (
                                            <Button variant="danger" size="sm">
                                                <i className="fas fa-times mr-2"></i>
                                                Batalkan Pesanan
                                            </Button>
                                        )}

                                        {order.status === 'delivered' && (
                                            <Button variant="outline" size="sm">
                                                <i className="fas fa-star mr-2"></i>
                                                Beri Ulasan
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page === 1}
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </Button>

                            {[...Array(pagination.totalPages)].map((_, i) => (
                                <Button
                                    key={i + 1}
                                    variant={pagination.page === i + 1 ? "primary" : "outline"}
                                    size="sm"
                                    onClick={() => setPagination({ ...pagination, page: i + 1 })}
                                >
                                    {i + 1}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserOrdersPage;
