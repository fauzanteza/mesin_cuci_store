import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, LoadingSpinner, Badge } from '../../components/UI';
import { PriceDisplay } from '../../components/Shared';

const AdminOrders: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            // Mock data
            const mockOrders = [
                {
                    id: 'ORD-001',
                    orderNumber: 'ORD-001',
                    customer: 'Budi Santoso',
                    date: '2024-01-18T10:30:00Z',
                    total: 3500000,
                    status: 'pending',
                    itemsCount: 2
                },
                {
                    id: 'ORD-002',
                    orderNumber: 'ORD-002',
                    customer: 'Siti Aminah',
                    date: '2024-01-18T11:15:00Z',
                    total: 4200000,
                    status: 'processing',
                    itemsCount: 1
                },
                {
                    id: 'ORD-003',
                    orderNumber: 'ORD-003',
                    customer: 'Joko Widodo',
                    date: '2024-01-17T09:45:00Z',
                    total: 2800000,
                    status: 'delivered',
                    itemsCount: 3
                },
                {
                    id: 'ORD-004',
                    orderNumber: 'ORD-004',
                    customer: 'Megawati',
                    date: '2024-01-16T14:20:00Z',
                    total: 5100000,
                    status: 'cancelled',
                    itemsCount: 1
                }
            ];
            setOrders(mockOrders);
        } catch (error) {
            console.error('Failed to load orders', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(order => order.status === statusFilter);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'processing': return 'info';
            case 'shipped': return 'primary';
            case 'delivered': return 'success';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Manajemen Pesanan</h1>

            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="p-4 border-b flex items-center space-x-4 overflow-x-auto">
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                        <button
                            key={status}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Total</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-center">Status</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-blue-600">
                                            <Link to={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {order.customer}
                                            <div className="text-xs text-gray-500">{order.itemsCount} item</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(order.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                            <PriceDisplay price={order.total} size="sm" />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant={getStatusVariant(order.status) as any}>
                                                {order.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-medium">
                                            <Link to={`/admin/orders/${order.id}`}>
                                                <Button size="sm" variant="outline">Detail</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        Tidak ada pesanan dengan status ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
