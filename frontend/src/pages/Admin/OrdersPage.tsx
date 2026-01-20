import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Input,
    Select,
    Modal,
    LoadingSpinner,
    Card,
    Badge
} from '../../components/UI';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/Admin/DataTable';
import OrderStatusBadge from '../../components/Admin/OrderStatusBadge';
// import adminService from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';

interface Order {
    id: string;
    orderNumber: string;
    customer: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
    items: Array<{
        productId: string;
        name: string;
        quantity: number;
        price: number;
        total: number;
    }>;
    totalAmount: number;
    shippingCost: number;
    discount: number;
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
    };
    notes?: string;
    createdAt: string;
    updatedAt: string;
    estimatedDelivery?: string;
    trackingNumber?: string;
    courier?: string;
}

const AdminOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [newStatus, setNewStatus] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [bulkAction, setBulkAction] = useState('');

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/');
            return;
        }

        loadOrders();
    }, [user]);

    useEffect(() => {
        filterOrders();
    }, [orders, searchQuery, statusFilter, paymentStatusFilter, dateFilter, sortBy]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            // Mock data - in real app, fetch from API
            const mockOrders: Order[] = [
                {
                    id: '1',
                    orderNumber: 'ORD-2024-001',
                    customer: {
                        id: 'cust1',
                        name: 'John Doe',
                        email: 'john@example.com',
                        phone: '081234567890'
                    },
                    items: [
                        {
                            productId: 'prod1',
                            name: 'Mesin Cuci LG 8kg',
                            quantity: 1,
                            price: 3500000,
                            total: 3500000
                        }
                    ],
                    totalAmount: 3500000,
                    shippingCost: 25000,
                    discount: 0,
                    grandTotal: 3525000,
                    paymentMethod: 'transfer',
                    paymentStatus: 'paid',
                    orderStatus: 'processing',
                    shippingAddress: {
                        name: 'John Doe',
                        phone: '081234567890',
                        address: 'Jl. Contoh No. 123',
                        city: 'Jakarta',
                        province: 'DKI Jakarta',
                        postalCode: '12345'
                    },
                    notes: 'Please deliver before 5 PM',
                    createdAt: '2024-02-15T10:30:00',
                    updatedAt: '2024-02-15T11:45:00',
                    estimatedDelivery: '2024-02-18',
                    trackingNumber: 'JNE123456789',
                    courier: 'JNE'
                },
                {
                    id: '2',
                    orderNumber: 'ORD-2024-002',
                    customer: {
                        id: 'cust2',
                        name: 'Jane Smith',
                        email: 'jane@example.com',
                        phone: '081234567891'
                    },
                    items: [
                        {
                            productId: 'prod2',
                            name: 'Mesin Cuci Samsung 10kg',
                            quantity: 1,
                            price: 4500000,
                            total: 4500000
                        },
                        {
                            productId: 'prod5',
                            name: 'Dryer Electrolux 8kg',
                            quantity: 1,
                            price: 5200000,
                            total: 5200000
                        }
                    ],
                    totalAmount: 9700000,
                    shippingCost: 50000,
                    discount: 200000,
                    grandTotal: 9550000,
                    paymentMethod: 'credit_card',
                    paymentStatus: 'paid',
                    orderStatus: 'shipped',
                    shippingAddress: {
                        name: 'Jane Smith',
                        phone: '081234567891',
                        address: 'Jl. Kantor No. 456',
                        city: 'Jakarta',
                        province: 'DKI Jakarta',
                        postalCode: '54321'
                    },
                    createdAt: '2024-02-14T14:20:00',
                    updatedAt: '2024-02-15T09:15:00',
                    estimatedDelivery: '2024-02-17',
                    trackingNumber: 'TIKI987654321',
                    courier: 'TIKI'
                },
                {
                    id: '3',
                    orderNumber: 'ORD-2024-003',
                    customer: {
                        id: 'cust3',
                        name: 'Robert Johnson',
                        email: 'robert@example.com',
                        phone: '081234567892'
                    },
                    items: [
                        {
                            productId: 'prod3',
                            name: 'Mesin Cuci Sharp 7kg',
                            quantity: 1,
                            price: 2500000,
                            total: 2500000
                        }
                    ],
                    totalAmount: 2500000,
                    shippingCost: 25000,
                    discount: 0,
                    grandTotal: 2525000,
                    paymentMethod: 'transfer',
                    paymentStatus: 'pending',
                    orderStatus: 'pending',
                    shippingAddress: {
                        name: 'Robert Johnson',
                        phone: '081234567892',
                        address: 'Jl. Test No. 789',
                        city: 'Bandung',
                        province: 'Jawa Barat',
                        postalCode: '40123'
                    },
                    createdAt: '2024-02-14T16:45:00',
                    updatedAt: '2024-02-14T16:45:00'
                },
                {
                    id: '4',
                    orderNumber: 'ORD-2024-004',
                    customer: {
                        id: 'cust4',
                        name: 'Sarah Williams',
                        email: 'sarah@example.com',
                        phone: '081234567893'
                    },
                    items: [
                        {
                            productId: 'prod4',
                            name: 'Mesin Cuci Panasonic 9kg',
                            quantity: 2,
                            price: 3800000,
                            total: 7600000
                        }
                    ],
                    totalAmount: 7600000,
                    shippingCost: 75000,
                    discount: 500000,
                    grandTotal: 7175000,
                    paymentMethod: 'cod',
                    paymentStatus: 'pending',
                    orderStatus: 'confirmed',
                    shippingAddress: {
                        name: 'Sarah Williams',
                        phone: '081234567893',
                        address: 'Jl. Contoh Baru No. 321',
                        city: 'Surabaya',
                        province: 'Jawa Timur',
                        postalCode: '60111'
                    },
                    createdAt: '2024-02-13T09:15:00',
                    updatedAt: '2024-02-13T11:30:00'
                },
                {
                    id: '5',
                    orderNumber: 'ORD-2024-005',
                    customer: {
                        id: 'cust5',
                        name: 'Michael Brown',
                        email: 'michael@example.com',
                        phone: '081234567894'
                    },
                    items: [
                        {
                            productId: 'prod1',
                            name: 'Mesin Cuci LG 8kg',
                            quantity: 1,
                            price: 3500000,
                            total: 3500000
                        }
                    ],
                    totalAmount: 3500000,
                    shippingCost: 25000,
                    discount: 0,
                    grandTotal: 3525000,
                    paymentMethod: 'transfer',
                    paymentStatus: 'failed',
                    orderStatus: 'cancelled',
                    shippingAddress: {
                        name: 'Michael Brown',
                        phone: '081234567894',
                        address: 'Jl. Sample No. 555',
                        city: 'Medan',
                        province: 'Sumatera Utara',
                        postalCode: '20111'
                    },
                    createdAt: '2024-02-12T13:40:00',
                    updatedAt: '2024-02-12T15:20:00'
                },
                {
                    id: '6',
                    orderNumber: 'ORD-2024-006',
                    customer: {
                        id: 'cust6',
                        name: 'Emily Davis',
                        email: 'emily@example.com',
                        phone: '081234567895'
                    },
                    items: [
                        {
                            productId: 'prod2',
                            name: 'Mesin Cuci Samsung 10kg',
                            quantity: 1,
                            price: 4500000,
                            total: 4500000
                        }
                    ],
                    totalAmount: 4500000,
                    shippingCost: 35000,
                    discount: 0,
                    grandTotal: 4535000,
                    paymentMethod: 'credit_card',
                    paymentStatus: 'paid',
                    orderStatus: 'delivered',
                    shippingAddress: {
                        name: 'Emily Davis',
                        phone: '081234567895',
                        address: 'Jl. Delivery No. 777',
                        city: 'Yogyakarta',
                        province: 'DI Yogyakarta',
                        postalCode: '55281'
                    },
                    createdAt: '2024-02-10T08:20:00',
                    updatedAt: '2024-02-12T14:00:00',
                    estimatedDelivery: '2024-02-12',
                    trackingNumber: 'POS123789456',
                    courier: 'POS Indonesia'
                }
            ];

            setOrders(mockOrders);
            setFilteredOrders(mockOrders);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(order =>
                order.orderNumber.toLowerCase().includes(query) ||
                order.customer.name.toLowerCase().includes(query) ||
                order.customer.email.toLowerCase().includes(query) ||
                order.trackingNumber?.toLowerCase().includes(query) ||
                order.items.some(item => item.name.toLowerCase().includes(query))
            );
        }

        // Order status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.orderStatus === statusFilter);
        }

        // Payment status filter
        if (paymentStatusFilter !== 'all') {
            filtered = filtered.filter(order => order.paymentStatus === paymentStatusFilter);
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            let startDate = new Date();

            switch (dateFilter) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'yesterday':
                    startDate.setDate(now.getDate() - 1);
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(now);
                    endDate.setDate(now.getDate() - 1);
                    endDate.setHours(23, 59, 59, 999);
                    filtered = filtered.filter(order => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate >= startDate && orderDate <= endDate;
                    });
                    break;
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            if (dateFilter !== 'yesterday') {
                filtered = filtered.filter(order => new Date(order.createdAt) >= startDate);
            }
        }

        // Sort
        switch (sortBy) {
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'total_high':
                filtered.sort((a, b) => b.grandTotal - a.grandTotal);
                break;
            case 'total_low':
                filtered.sort((a, b) => a.grandTotal - b.grandTotal);
                break;
            default: // newest
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setFilteredOrders(filtered);
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder || !newStatus) return;

        try {
            setUpdatingStatus(true);
            // In real app: Call API to update order status
            setOrders(prev => prev.map(order =>
                order.id === selectedOrder.id
                    ? { ...order, orderStatus: newStatus as any, updatedAt: new Date().toISOString() }
                    : order
            ));

            toast.success(`Order ${selectedOrder.orderNumber} status updated to ${newStatus}`);
            setShowStatusModal(false);
            setSelectedOrder(null);
            setNewStatus('');
        } catch (error) {
            toast.error('Failed to update order status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleBulkAction = async () => {
        if (selectedRows.length === 0 || !bulkAction) {
            toast.error('Please select orders and an action');
            return;
        }

        try {
            switch (bulkAction) {
                case 'confirm':
                    setOrders(prev => prev.map(order =>
                        selectedRows.includes(order.id) ? {
                            ...order,
                            orderStatus: 'confirmed',
                            updatedAt: new Date().toISOString()
                        } : order
                    ));
                    toast.success(`${selectedRows.length} orders confirmed`);
                    break;
                case 'process':
                    setOrders(prev => prev.map(order =>
                        selectedRows.includes(order.id) ? {
                            ...order,
                            orderStatus: 'processing',
                            updatedAt: new Date().toISOString()
                        } : order
                    ));
                    toast.success(`${selectedRows.length} orders marked as processing`);
                    break;
                case 'ship':
                    // In real app: Show shipping modal with courier and tracking
                    toast.success(`Shipping ${selectedRows.length} orders - feature to be implemented`);
                    break;
                case 'print':
                    // In real app: Print invoices
                    toast.success(`Printing ${selectedRows.length} invoices - feature to be implemented`);
                    break;
                case 'export':
                    handleExport();
                    break;
            }

            setSelectedRows([]);
            setBulkAction('');
        } catch (error) {
            toast.error('Failed to perform bulk action');
        }
    };

    const handleExport = async () => {
        try {
            // In real app: Export orders to CSV/Excel
            toast.success('Export feature will be implemented soon');
        } catch (error) {
            toast.error('Failed to export orders');
        }
    };

    const getStatusOptions = (currentStatus: string) => {
        const statusFlow: Record<string, string[]> = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['processing', 'cancelled'],
            processing: ['shipped', 'cancelled'],
            shipped: ['delivered'],
            delivered: [],
            cancelled: []
        };

        return statusFlow[currentStatus] || [];
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

    const columns = [
        {
            key: 'orderNumber',
            header: 'Order',
            render: (value: string, row: Order) => (
                <div>
                    <div className="font-medium">{value}</div>
                    <div className="text-xs text-gray-500">
                        {new Date(row.createdAt).toLocaleDateString('id-ID')}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'customer',
            header: 'Customer',
            render: (value: Order['customer']) => (
                <div>
                    <div className="font-medium">{value.name}</div>
                    <div className="text-xs text-gray-500">{value.email}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'items',
            header: 'Items',
            render: (value: Order['items']) => (
                <div>
                    <div className="font-medium">{value.length} item{value.length > 1 ? 's' : ''}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                        {value.map(item => item.name).join(', ')}
                    </div>
                </div>
            )
        },
        {
            key: 'grandTotal',
            header: 'Total',
            render: (value: number) => (
                <div className="font-medium">
                    Rp {value.toLocaleString('id-ID')}
                </div>
            ),
            sortable: true
        },
        {
            key: 'paymentMethod',
            header: 'Method',
            render: (value: string) => (
                <span className="capitalize">{getPaymentMethodLabel(value)}</span>
            )
        },
        {
            key: 'paymentStatus',
            header: 'Payment',
            render: (value: string) => getPaymentStatusBadge(value)
        },
        {
            key: 'orderStatus',
            header: 'Status',
            render: (_: string, row: Order) => (
                <div className="flex items-center gap-2">
                    <OrderStatusBadge status={row.orderStatus as any} />
                    {row.trackingNumber && (
                        <i className="fas fa-truck text-gray-400" title="Has tracking"></i>
                    )}
                </div>
            ),
            sortable: true
        }
    ];

    const actions = (row: Order) => (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/orders/${row.id}`)}
                icon="eye"
                title="View Details"
            />
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    setSelectedOrder(row);
                    setShowStatusModal(true);
                }}
                icon="sync"
                title="Update Status"
            />
            <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success('Print invoice feature coming soon')}
                icon="print"
                title="Print Invoice"
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
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                        <p className="text-gray-600">
                            Manage customer orders and fulfillment
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            icon="download"
                        >
                            Export
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/admin/orders/create')}
                            icon="plus"
                        >
                            Create Order
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters & Stats */}
            <Card className="p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <Input
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon="search"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { value: "all", label: "All Status" },
                                { value: "pending", label: "Pending" },
                                { value: "confirmed", label: "Confirmed" },
                                { value: "processing", label: "Processing" },
                                { value: "shipped", label: "Shipped" },
                                { value: "delivered", label: "Delivered" },
                                { value: "cancelled", label: "Cancelled" }
                            ]}
                        />
                    </div>

                    {/* Payment Status Filter */}
                    <div>
                        <Select
                            value={paymentStatusFilter}
                            onChange={(e) => setPaymentStatusFilter(e.target.value)}
                            options={[
                                { value: "all", label: "All Payments" },
                                { value: "paid", label: "Paid" },
                                { value: "pending", label: "Pending" },
                                { value: "failed", label: "Failed" },
                                { value: "refunded", label: "Refunded" }
                            ]}
                        />
                    </div>

                    {/* Date Filter */}
                    <div>
                        <Select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            options={[
                                { value: "all", label: "All Time" },
                                { value: "today", label: "Today" },
                                { value: "yesterday", label: "Yesterday" },
                                { value: "week", label: "Last 7 Days" },
                                { value: "month", label: "Last 30 Days" },
                                { value: "year", label: "Last Year" }
                            ]}
                        />
                    </div>
                </div>

                {/* Sort & Bulk Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-48"
                            options={[
                                { value: "newest", label: "Sort by: Newest" },
                                { value: "oldest", label: "Sort by: Oldest" },
                                { value: "total_high", label: "Sort by: Total High-Low" },
                                { value: "total_low", label: "Sort by: Total Low-High" }
                            ]}
                        />

                        <span className="text-sm text-gray-600">
                            {filteredOrders.length} orders found
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedRows.length > 0 && (
                            <>
                                <Select
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                    // placeholder="Bulk Actions"
                                    className="w-40"
                                    options={[
                                        { value: "", label: "Bulk Actions" },
                                        { value: "confirm", label: "Confirm Orders" },
                                        { value: "process", label: "Mark as Processing" },
                                        { value: "ship", label: "Mark as Shipped" },
                                        { value: "print", label: "Print Invoices" },
                                        { value: "export", label: "Export Selected" }
                                    ]}
                                />
                                <Button
                                    variant="primary"
                                    onClick={handleBulkAction}
                                    disabled={!bulkAction}
                                >
                                    Apply
                                </Button>
                                <span className="text-sm text-gray-600">
                                    {selectedRows.length} selected
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </Card>

            {/* Orders Table */}
            <DataTable
                columns={columns}
                data={filteredOrders}
                actions={actions}
                selectable
                searchable={false}
                pagination
                onSelectionChange={setSelectedRows}
            />

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {orders.filter(o => o.orderStatus === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-600">Pending Orders</div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            {orders.filter(o => o.paymentStatus === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-600">Pending Payments</div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            Rp {orders.reduce((sum, order) => sum + order.grandTotal, 0).toLocaleString('id-ID')}
                        </div>
                        <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {orders.filter(o => o.orderStatus === 'delivered').length}
                        </div>
                        <div className="text-sm text-gray-600">Completed Orders</div>
                    </div>
                </Card>
            </div>

            {/* Order Status Update Modal */}
            <Modal
                isOpen={showStatusModal}
                onClose={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                    setNewStatus('');
                }}
                title="Update Order Status"
            >
                <div className="p-6">
                    {selectedOrder && (
                        <>
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">Order:</span>
                                    <span className="font-bold">{selectedOrder.orderNumber}</span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">Customer:</span>
                                    <span>{selectedOrder.customer.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Current Status:</span>
                                    <OrderStatusBadge status={selectedOrder.orderStatus as any} />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Status
                                </label>
                                <Select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    options={[
                                        { value: "", label: "Select new status" },
                                        ...getStatusOptions(selectedOrder.orderStatus).map(status => ({
                                            value: status,
                                            label: status.charAt(0).toUpperCase() + status.slice(1)
                                        }))
                                    ]}
                                />

                                {newStatus === 'shipped' && (
                                    <div className="mt-4 space-y-3">
                                        <Input
                                            placeholder="Tracking Number"
                                            icon="truck"
                                        />
                                        <Select placeholder="Select Courier" options={[
                                            { value: "", label: "Select Courier" },
                                            { value: "jne", label: "JNE" },
                                            { value: "tiki", label: "TIKI" },
                                            { value: "pos", label: "POS Indonesia" },
                                            { value: "sicepat", label: "SiCepat" }
                                        ]}
                                            onChange={() => { }} // Placeholder
                                        />
                                        <Input
                                            type="date"
                                            placeholder="Estimated Delivery"
                                            icon="calendar"
                                        />
                                    </div>
                                )}

                                {newStatus === 'cancelled' && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cancellation Reason
                                        </label>
                                        <Select options={[
                                            { value: "", label: "Select reason" },
                                            { value: "out_of_stock", label: "Out of Stock" },
                                            { value: "customer_request", label: "Customer Request" },
                                            { value: "payment_failed", label: "Payment Failed" },
                                            { value: "fraud", label: "Suspected Fraud" },
                                            { value: "other", label: "Other" }
                                        ]}
                                            onChange={() => { }} // Placeholder
                                        />
                                        <textarea
                                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg"
                                            rows={3}
                                            placeholder="Additional notes..."
                                        ></textarea>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setSelectedOrder(null);
                                        setNewStatus('');
                                    }}
                                    className="flex-1"
                                    disabled={updatingStatus}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleUpdateStatus}
                                    loading={updatingStatus}
                                    disabled={!newStatus || updatingStatus}
                                    className="flex-1"
                                >
                                    Update Status
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default AdminOrdersPage;
