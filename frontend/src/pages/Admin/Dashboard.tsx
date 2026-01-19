// frontend/src/pages/Admin/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, LoadingSpinner } from '../../components/UI';
import api from '../../services/api';

const AdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        recentOrders: []
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Mock Data - replace with api.get('/admin/stats')
            // const response = await api.get('/admin/stats');
            // setStats(response.data);

            setStats({
                totalSales: 45000000,
                totalOrders: 15,
                totalProducts: 24,
                totalCustomers: 120,
                recentOrders: [
                    { id: 'ORD-001', customer: 'Budi Santoso', total: 3500000, status: 'pending', date: '2024-01-18' },
                    { id: 'ORD-002', customer: 'Siti Aminah', total: 4200000, status: 'processing', date: '2024-01-18' },
                    { id: 'ORD-003', customer: 'Joko Widodo', total: 2800000, status: 'delivered', date: '2024-01-17' },
                    { id: 'ORD-004', customer: 'Megawati', total: 5100000, status: 'cancelled', date: '2024-01-16' },
                ] as any[]
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-600">
                    <p className="text-gray-500 text-sm font-semibold uppercase">Total Penjualan</p>
                    <p className="text-2xl font-bold mt-2">Rp {stats.totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-600">
                    <p className="text-gray-500 text-sm font-semibold uppercase">Total Pesanan</p>
                    <p className="text-2xl font-bold mt-2">{stats.totalOrders}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-600">
                    <p className="text-gray-500 text-sm font-semibold uppercase">Produk</p>
                    <p className="text-2xl font-bold mt-2">{stats.totalProducts}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-600">
                    <p className="text-gray-500 text-sm font-semibold uppercase">Pelanggan</p>
                    <p className="text-2xl font-bold mt-2">{stats.totalCustomers}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-lg font-bold">Pesanan Terbaru</h2>
                        <Link to="/admin/orders" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Lihat Semua</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">ID Pesanan</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {stats.recentOrders.map((order: any) => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{order.customer}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">Rp {order.total.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <Link to={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">Detail</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-bold mb-4">Aksi Cepat</h2>
                    <div className="space-y-3">
                        <Link to="/admin/products/new">
                            <Button className="w-full justify-start" icon="plus" variant="outline">Tambah Produk</Button>
                        </Link>
                        <Link to="/admin/orders">
                            <Button className="w-full justify-start" icon="shopping-bag" variant="outline">Kelola Pesanan</Button>
                        </Link>
                        <Link to="/admin/customers">
                            <Button className="w-full justify-start" icon="users" variant="outline">Kelola Pelanggan</Button>
                        </Link>
                        <Link to="/admin/reports">
                            <Button className="w-full justify-start" icon="chart-bar" variant="outline">Laporan Penjualan</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
