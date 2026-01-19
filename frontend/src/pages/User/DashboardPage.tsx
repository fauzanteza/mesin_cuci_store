// frontend/src/pages/User/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button, LoadingSpinner } from '../../components/UI';
import orderService from '../../services/orderService';

const UserDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        wishlistCount: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Fetch user stats
            // const statsData = await userService.getDashboardStats();
            // setStats(statsData);

            // Fetch recent orders
            // const orders = await orderService.getUserOrders({ limit: 5 });
            // setRecentOrders(orders);

            // Mock data
            setStats({
                totalOrders: 12,
                pendingOrders: 2,
                completedOrders: 8,
                wishlistCount: 5
            });

            setRecentOrders([
                { id: 'ORD-001', date: '2024-01-15', total: 3500000, status: 'delivered' },
                { id: 'ORD-002', date: '2024-01-10', total: 4200000, status: 'processing' },
            ]);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="user-dashboard">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Selamat Datang, {user?.name}!</h1>
                            <p className="text-blue-100 mt-2">
                                {user?.email} • Member sejak Jan 2024
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Link to="/products">
                                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                                    <i className="fas fa-shopping-bag mr-2"></i>
                                    Lanjutkan Belanja
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Pesanan</p>
                                <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <i className="fas fa-shopping-bag text-blue-600 text-xl"></i>
                            </div>
                        </div>
                        <Link to="/user/orders" className="text-blue-600 text-sm hover:underline mt-4 block">
                            Lihat semua →
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Pesanan Tertunda</p>
                                <p className="text-3xl font-bold mt-2">{stats.pendingOrders}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <i className="fas fa-clock text-yellow-600 text-xl"></i>
                            </div>
                        </div>
                        <Link to="/user/orders?status=pending" className="text-blue-600 text-sm hover:underline mt-4 block">
                            Lihat detail →
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Pesanan Selesai</p>
                                <p className="text-3xl font-bold mt-2">{stats.completedOrders}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <i className="fas fa-check-circle text-green-600 text-xl"></i>
                            </div>
                        </div>
                        <Link to="/user/orders?status=completed" className="text-blue-600 text-sm hover:underline mt-4 block">
                            Lihat riwayat →
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Wishlist</p>
                                <p className="text-3xl font-bold mt-2">{stats.wishlistCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <i className="fas fa-heart text-red-600 text-xl"></i>
                            </div>
                        </div>
                        <Link to="/user/wishlist" className="text-blue-600 text-sm hover:underline mt-4 block">
                            Lihat wishlist →
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2">
                        {/* Recent Orders */}
                        <div className="bg-white rounded-xl shadow mb-6">
                            <div className="p-6 border-b">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold">Pesanan Terbaru</h2>
                                    <Link to="/user/orders">
                                        <Button variant="text" size="sm">Lihat Semua</Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="p-6">
                                {recentOrders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                                            <i className="fas fa-shopping-bag text-4xl"></i>
                                        </div>
                                        <p className="text-gray-600 mb-4">Belum ada pesanan</p>
                                        <Link to="/products">
                                            <Button variant="primary">Mulai Belanja</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentOrders.map((order) => (
                                            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                                <div>
                                                    <p className="font-medium">{order.id}</p>
                                                    <p className="text-sm text-gray-600">{order.date}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">Rp {order.total.toLocaleString()}</p>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <Link to={`/user/orders/${order.id}`}>
                                                    <Button variant="text" size="sm">Detail</Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-xl font-bold mb-4">Aksi Cepat</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Link to="/user/addresses">
                                    <div className="text-center p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                        <i className="fas fa-map-marker-alt text-2xl text-blue-600 mb-2"></i>
                                        <p className="text-sm font-medium">Alamat</p>
                                    </div>
                                </Link>
                                <Link to="/user/wishlist">
                                    <div className="text-center p-4 border rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors">
                                        <i className="fas fa-heart text-2xl text-red-600 mb-2"></i>
                                        <p className="text-sm font-medium">Wishlist</p>
                                    </div>
                                </Link>
                                <Link to="/user/reviews">
                                    <div className="text-center p-4 border rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
                                        <i className="fas fa-star text-2xl text-yellow-600 mb-2"></i>
                                        <p className="text-sm font-medium">Ulasan</p>
                                    </div>
                                </Link>
                                <Link to="/user/profile">
                                    <div className="text-center p-4 border rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                                        <i className="fas fa-user-cog text-2xl text-green-600 mb-2"></i>
                                        <p className="text-sm font-medium">Profil</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Account Info */}
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-xl font-bold mb-4">Info Akun</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600">Nama</p>
                                    <p className="font-medium">{user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Telepon</p>
                                    <p className="font-medium">{user?.phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className="font-medium text-green-600">Aktif</p>
                                </div>
                                <Link to="/user/profile">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <i className="fas fa-edit mr-2"></i>
                                        Edit Profil
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow p-6 text-white">
                            <h3 className="font-bold text-lg mb-2">Butuh Bantuan?</h3>
                            <p className="text-blue-100 mb-4">
                                Tim support kami siap membantu 24/7
                            </p>
                            <div className="space-y-3">
                                <a href="tel:1500123" className="flex items-center gap-2 hover:text-blue-200">
                                    <i className="fas fa-phone-alt"></i>
                                    <span>1500-123</span>
                                </a>
                                <a href="mailto:support@mesincucistore.com" className="flex items-center gap-2 hover:text-blue-200">
                                    <i className="fas fa-envelope"></i>
                                    <span>support@mesincucistore.com</span>
                                </a>
                                <Link to="/contact" className="flex items-center gap-2 hover:text-blue-200">
                                    <i className="fas fa-headset"></i>
                                    <span>Live Chat</span>
                                </Link>
                            </div>
                        </div>

                        {/* Promo Banner */}
                        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl shadow p-6 text-white">
                            <h3 className="font-bold text-lg mb-2">Promo Spesial! 🎉</h3>
                            <p className="text-green-100 mb-4">
                                Dapatkan diskon 15% untuk pembelian mesin cuci berikutnya
                            </p>
                            <p className="text-sm mb-2">Kode: <strong>WELCOME15</strong></p>
                            <Link to="/products">
                                <Button variant="secondary" size="sm" className="w-full bg-white text-green-600 hover:bg-gray-100">
                                    Gunakan Sekarang
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardPage;
