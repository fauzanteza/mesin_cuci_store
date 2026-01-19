// frontend/src/pages/User/DashboardPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/UI/Button';

const UserDashboardPage: React.FC = () => {
    const { user } = useAuth(); // Assuming useAuth returns { user } which handles null check eventually or optional chaining used

    const stats = [
        { label: 'Pesanan Aktif', value: '2', color: 'blue', icon: 'shopping-bag' },
        { label: 'Pesanan Selesai', value: '15', color: 'green', icon: 'check-circle' },
        { label: 'Dalam Pengiriman', value: '1', color: 'yellow', icon: 'truck' },
        { label: 'Wishlist', value: '8', color: 'purple', icon: 'heart' },
    ];

    const recentOrders = [
        { id: 'ORD-123', date: '2024-01-15', total: 3500000, status: 'Delivered' },
        { id: 'ORD-124', date: '2024-01-10', total: 4200000, status: 'Processing' },
        { id: 'ORD-125', date: '2024-01-05', total: 2800000, status: 'Shipped' },
    ];

    return (
        <div className="user-dashboard">
            <div className="bg-gray-50 py-4">
                <div className="container mx-auto px-4">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-gray-600">Selamat datang kembali, {user?.name || 'User'}!</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">{stat.label}</p>
                                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                                    {/* Assuming FontAwesome or similar is loaded, or replace with Lucide icons if desired. 
                        User provided code uses 'fas fa-X', but project uses lucide-react?
                        I will keep user code but might need to adjust icons if they don't show.
                        I'll stick to user code for now. 
                    */}
                                    <i className={`fas fa-${stat.icon} text-${stat.color}-600 text-xl`}></i>
                                </div>
                            </div>
                            <Link to="/user/orders" className="text-blue-600 text-sm hover:underline mt-4 block">
                                Lihat detail →
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2">
                        {/* Recent Orders */}
                        <div className="bg-white rounded-lg shadow mb-6">
                            <div className="p-6 border-b">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold">Pesanan Terbaru</h2>
                                    <Link to="/user/orders">
                                        <Button variant="outline" className="text-sm">Lihat Semua</Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="p-6">
                                {recentOrders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">Belum ada pesanan</p>
                                        <Link to="/products" className="inline-block mt-4">
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
                                                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <Link to={`/user/orders/${order.id}`}>
                                                    <Button variant="outline" className="text-xs">Detail</Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold mb-4">Aksi Cepat</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Link to="/user/addresses">
                                    <div className="text-center p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50">
                                        <i className="fas fa-map-marker-alt text-2xl text-blue-600 mb-2"></i>
                                        <p className="text-sm">Alamat</p>
                                    </div>
                                </Link>
                                <Link to="/user/wishlist">
                                    <div className="text-center p-4 border rounded-lg hover:border-red-500 hover:bg-red-50">
                                        <i className="fas fa-heart text-2xl text-red-600 mb-2"></i>
                                        <p className="text-sm">Wishlist</p>
                                    </div>
                                </Link>
                                <Link to="/user/reviews">
                                    <div className="text-center p-4 border rounded-lg hover:border-yellow-500 hover:bg-yellow-50">
                                        <i className="fas fa-star text-2xl text-yellow-600 mb-2"></i>
                                        <p className="text-sm">Ulasan</p>
                                    </div>
                                </Link>
                                <Link to="/user/profile">
                                    <div className="text-center p-4 border rounded-lg hover:border-green-500 hover:bg-green-50">
                                        <i className="fas fa-user-cog text-2xl text-green-600 mb-2"></i>
                                        <p className="text-sm">Profil</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1">
                        {/* Account Info */}
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
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
                                <Link to="/user/profile">
                                    <Button variant="outline" className="w-full">
                                        Edit Profil
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Support */}
                        <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="font-bold text-blue-800 mb-2">Butuh Bantuan?</h3>
                            <p className="text-blue-700 text-sm mb-4">
                                Tim support kami siap membantu 24/7
                            </p>
                            <div className="space-y-3">
                                <a href="tel:1500123" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                                    <i className="fas fa-phone-alt"></i>
                                    <span>1500-123</span>
                                </a>
                                <a href="mailto:support@mesincucistore.com" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                                    <i className="fas fa-envelope"></i>
                                    <span>support@mesincucistore.com</span>
                                </a>
                                <a href="/contact" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                                    <i className="fas fa-headset"></i>
                                    <span>Live Chat</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardPage;
