import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, LoadingSpinner, Alert } from '../../components/UI';
import DashboardStats from '../../components/Admin/DashboardStats';
import ReportChart from '../../components/Admin/ReportChart';
import DataTable from '../../components/Admin/DataTable';
import InventoryAlert from '../../components/Admin/InventoryAlert';
import OrderStatusBadge from '../../components/Admin/OrderStatusBadge';
// import adminService from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';

interface StatCard {
    title: string;
    value: number;
    change: number;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'indigo';
    prefix?: string;
    suffix?: string;
}

interface RecentOrder {
    id: string;
    orderNumber: string;
    customerName: string;
    date: string;
    total: number;
    status: string;
    items: number;
}

const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    // const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatCard[]>([]);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);
    const [salesData, setSalesData] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any>(null);

    useEffect(() => {
        // if (user?.role !== 'admin') {
        //   navigate('/');
        //   return;
        // }

        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Mock dashboard data
            const mockStats: StatCard[] = [
                {
                    title: 'Total Revenue',
                    value: 12543000,
                    change: 12.5,
                    icon: 'dollar-sign',
                    color: 'green',
                    prefix: 'Rp '
                },
                {
                    title: 'Total Orders',
                    value: 342,
                    change: 8.2,
                    icon: 'shopping-cart',
                    color: 'blue'
                },
                {
                    title: 'New Customers',
                    value: 128,
                    change: -3.4,
                    icon: 'users',
                    color: 'purple'
                },
                {
                    title: 'Avg. Order Value',
                    value: 367500,
                    change: 5.7,
                    icon: 'chart-line',
                    color: 'orange',
                    prefix: 'Rp '
                }
            ];

            const mockOrders: RecentOrder[] = [
                {
                    id: '1',
                    orderNumber: 'ORD-2024-001',
                    customerName: 'John Doe',
                    date: '2024-02-15',
                    total: 3500000,
                    status: 'processing',
                    items: 2
                },
                {
                    id: '2',
                    orderNumber: 'ORD-2024-002',
                    customerName: 'Jane Smith',
                    date: '2024-02-14',
                    total: 4200000,
                    status: 'shipped',
                    items: 1
                },
                {
                    id: '3',
                    orderNumber: 'ORD-2024-003',
                    customerName: 'Robert Johnson',
                    date: '2024-02-14',
                    total: 2750000,
                    status: 'pending',
                    items: 3
                },
                {
                    id: '4',
                    orderNumber: 'ORD-2024-004',
                    customerName: 'Sarah Williams',
                    date: '2024-02-13',
                    total: 5100000,
                    status: 'delivered',
                    items: 2
                },
                {
                    id: '5',
                    orderNumber: 'ORD-2024-005',
                    customerName: 'Michael Brown',
                    date: '2024-02-13',
                    total: 1890000,
                    status: 'cancelled',
                    items: 1
                }
            ];

            const mockAlerts = [
                {
                    id: '1',
                    productId: 'P001',
                    productName: 'Mesin Cuci LG 8kg',
                    sku: 'LG-WM-8KG',
                    currentStock: 3,
                    minStock: 10,
                    status: 'critical',
                    lastRestocked: '2024-01-20',
                    supplier: 'LG Electronics'
                },
                {
                    id: '2',
                    productId: 'P002',
                    productName: 'Mesin Cuci Samsung 10kg',
                    sku: 'SS-WM-10KG',
                    currentStock: 8,
                    minStock: 15,
                    status: 'warning',
                    lastRestocked: '2024-02-01',
                    supplier: 'Samsung'
                }
            ];

            const mockSalesData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Sales',
                    data: [12000000, 19000000, 15000000, 25000000, 22000000, 30000000]
                }]
            };

            const mockRevenueData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Revenue',
                        data: [45000000, 52000000, 48000000, 61000000, 55000000, 72000000],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Orders',
                        data: [85, 120, 95, 150, 130, 180],
                        borderColor: '#8B5CF6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        fill: true
                    }
                ]
            };

            setStats(mockStats);
            setRecentOrders(mockOrders);
            setInventoryAlerts(mockAlerts);
            setSalesData(mockSalesData);
            setRevenueData(mockRevenueData);

        } catch (error) {
            // Alert.error('Failed to load dashboard data');
            alert('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (orderId: string) => {
        navigate(`/admin/orders/${orderId}`);
    };

    const handleViewProduct = (productId: string) => {
        navigate(`/admin/products/${productId}`);
    };

    const columns = [
        {
            key: 'orderNumber',
            header: 'Order Number',
            render: (value: string, row: RecentOrder) => (
                <div>
                    <div className="font-medium">{value}</div>
                    <div className="text-xs text-gray-500">
                        {row.items} item{row.items > 1 ? 's' : ''}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'customerName',
            header: 'Customer',
            sortable: true
        },
        {
            key: 'date',
            header: 'Date',
            render: (value: string) => new Date(value).toLocaleDateString('id-ID'),
            sortable: true
        },
        {
            key: 'total',
            header: 'Total',
            render: (value: number) => (
                <span className="font-medium">Rp {value.toLocaleString('id-ID')}</span>
            ),
            sortable: true
        },
        {
            key: 'status',
            header: 'Status',
            render: (value: string) => <OrderStatusBadge status={value as any} />,
            sortable: true
        }
    ];

    const actions = (row: RecentOrder) => (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewOrder(row.id)}
                icon="eye"
                title="View Order"
            />
            <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Edit order functionality')}
                icon="edit"
                title="Edit Order"
            />
        </>
    );

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600">
                            Overview of your store performance
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            icon="download"
                            onClick={() => alert('Export dashboard data')}
                        >
                            Export Report
                        </Button>
                        <Button
                            variant="primary"
                            icon="sync"
                            onClick={loadDashboardData}
                        >
                            Refresh Data
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-8">
                <DashboardStats stats={stats} loading={loading} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <ReportChart
                    title="Revenue Overview"
                    type="line"
                    data={revenueData}
                    loading={loading}
                    height={350}
                />
                <ReportChart
                    title="Monthly Sales"
                    type="bar"
                    data={salesData}
                    loading={loading}
                    height={350}
                />
            </div>

            {/* Recent Orders & Inventory Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                    <DataTable
                        columns={columns}
                        data={recentOrders}
                        actions={actions}
                        searchable={false}
                        pagination={false}
                    />
                    <div className="mt-4 text-right">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/admin/orders')}
                            icon="arrow-right"
                            iconPosition="right"
                        >
                            View All Orders
                        </Button>
                    </div>
                </div>

                <div>
                    <InventoryAlert
                        alerts={inventoryAlerts}
                        onViewProduct={handleViewProduct}
                        onRestock={(productId) => {
                            alert(`Restocking product ${productId}`);
                        }}
                    />
                </div>
            </div>

            {/* Quick Stats & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Button
                            variant="primary"
                            className="w-full justify-start"
                            onClick={() => navigate('/admin/products/create')}
                            icon="plus"
                        >
                            Add New Product
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => navigate('/admin/orders/create')}
                            icon="file-invoice"
                        >
                            Create Manual Order
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => navigate('/admin/customers')}
                            icon="users"
                        >
                            Manage Customers
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => navigate('/admin/reports')}
                            icon="chart-bar"
                        >
                            View Reports
                        </Button>
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6 md:col-span-2">
                    <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[
                            { user: 'Admin', action: 'added new product', time: '2 mins ago', icon: 'box' },
                            { user: 'Customer', action: 'placed order #ORD-2024-006', time: '15 mins ago', icon: 'shopping-cart' },
                            { user: 'System', action: 'low stock alert for LG 8kg', time: '1 hour ago', icon: 'exclamation-triangle' },
                            { user: 'Admin', action: 'updated order status to shipped', time: '2 hours ago', icon: 'truck' },
                            { user: 'Customer', action: 'submitted product review', time: '3 hours ago', icon: 'star' }
                        ].map((activity, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <i className={`fas fa-${activity.icon} text-gray-600`}></i>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm">
                                        <span className="font-medium">{activity.user}</span>
                                        <span className="text-gray-600"> {activity.action}</span>
                                    </p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Performance Metrics */}
            <div className="mt-8">
                <Card className="p-6">
                    <h3 className="font-bold text-lg mb-6">Performance Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">98.2%</div>
                            <div className="text-sm text-gray-600 mt-2">Order Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">4.7</div>
                            <div className="text-sm text-gray-600 mt-2">Avg. Customer Rating</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">24h</div>
                            <div className="text-sm text-gray-600 mt-2">Avg. Delivery Time</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600">87%</div>
                            <div className="text-sm text-gray-600 mt-2">Repeat Customer Rate</div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
