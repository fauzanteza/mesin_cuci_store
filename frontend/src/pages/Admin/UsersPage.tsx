import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Button,
    Input,
    Select,
    Modal,
    LoadingSpinner,
    Card,
    Tabs,
    Badge
} from '../../components/UI';
import DataTable from '../../components/Admin/DataTable';
import UserCard from '../../components/Admin/UserCard';
import adminService from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'customer' | 'staff';
    status: 'active' | 'inactive' | 'banned' | 'pending';
    phone?: string;
    createdAt: string;
    lastLogin?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    orderCount: number;
    totalSpent: number;
    addressCount: number;
    lastOrderDate?: string;
}

const AdminUsersPage: React.FC = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [actionLoading, setActionLoading] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    // Bulk email state
    const [emailSubject, setEmailSubject] = useState('');
    const [emailContent, setEmailContent] = useState('');

    useEffect(() => {
        // Basic role check
        if (currentUser?.role !== 'admin') {
            // navigate('/'); 
        }
        loadUsers();
    }, [currentUser]);

    useEffect(() => {
        filterUsers();
    }, [users, searchQuery, roleFilter, statusFilter, dateFilter, sortBy, activeTab]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            // Mock data - reduced for file size
            const mockUsers: User[] = [
                {
                    id: '1',
                    name: 'Admin User',
                    email: 'admin@mesincuci.com',
                    avatar: '/images/avatars/admin.jpg',
                    role: 'admin',
                    status: 'active',
                    phone: '081234567890',
                    createdAt: '2024-01-01',
                    lastLogin: '2024-02-15',
                    emailVerified: true,
                    phoneVerified: true,
                    orderCount: 0,
                    totalSpent: 0,
                    addressCount: 0
                },
                {
                    id: '2',
                    name: 'John Doe',
                    email: 'john@example.com',
                    avatar: '/images/avatars/user1.jpg',
                    role: 'customer',
                    status: 'active',
                    phone: '081234567891',
                    createdAt: '2024-01-15',
                    lastLogin: '2024-02-14',
                    emailVerified: true,
                    phoneVerified: true,
                    orderCount: 12,
                    totalSpent: 42500000,
                    addressCount: 2,
                    lastOrderDate: '2024-02-15'
                }
            ];

            setUsers(mockUsers);
            setFilteredUsers(mockUsers);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = [...users];

        if (activeTab !== 'all') {
            filtered = filtered.filter(user => user.role === activeTab);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.phone?.toLowerCase().includes(query)
            );
        }

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => user.status === statusFilter);
        }

        if (dateFilter !== 'all') {
            const now = new Date();
            let startDate = new Date();

            switch (dateFilter) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0); break;
                case 'week':
                    startDate.setDate(now.getDate() - 7); break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1); break;
                case 'year':
                    startDate.setFullYear(now.getFullYear() - 1); break;
            }

            filtered = filtered.filter(user => new Date(user.createdAt) >= startDate);
        }

        switch (sortBy) {
            case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'oldest': filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
            case 'spent_high': filtered.sort((a, b) => b.totalSpent - a.totalSpent); break;
            case 'orders_high': filtered.sort((a, b) => b.orderCount - a.orderCount); break;
            case 'recent_login': filtered.sort((a, b) => (b.lastLogin ? new Date(b.lastLogin).getTime() : 0) - (a.lastLogin ? new Date(a.lastLogin).getTime() : 0)); break;
            default: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setFilteredUsers(filtered);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            setActionLoading(true);
            setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
            toast.success(`User ${selectedUser.name} deleted successfully`);
            setShowDeleteModal(false);
            setSelectedUser(null);
        } catch (error) {
            toast.error('Failed to delete user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleStatus = async (userId: string, newStatus: string) => {
        try {
            setActionLoading(true);
            setUsers(prev => prev.map(user => user.id === userId ? { ...user, status: newStatus as any } : user));
            const userName = users.find(u => u.id === userId)?.name;
            toast.success(`User ${userName} status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update user status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendBulkEmail = async () => {
        if (selectedRows.length === 0) { toast.error('Please select users to email'); return; }
        if (!emailSubject.trim() || !emailContent.trim()) { toast.error('Please enter email subject and content'); return; }

        try {
            setActionLoading(true);
            const userNames = users.filter(u => selectedRows.includes(u.id)).map(u => u.name).join(', ');
            toast.success(`Email sent to ${selectedRows.length} users: ${userNames}`);
            setShowBulkEmailModal(false);
            setEmailSubject('');
            setEmailContent('');
            setSelectedRows([]);
        } catch (error) {
            toast.error('Failed to send emails');
        } finally {
            setActionLoading(false);
        }
    };

    const handleExportUsers = () => {
        toast('Export feature will be implemented soon', { icon: 'ℹ️' });
    };

    const handleImportUsers = () => {
        toast('Import feature will be implemented soon', { icon: 'ℹ️' });
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { variant: string; icon: string }> = {
            active: { variant: 'success', icon: 'check-circle' },
            inactive: { variant: 'warning', icon: 'clock' },
            banned: { variant: 'danger', icon: 'ban' },
            pending: { variant: 'warning', icon: 'hourglass-half' }
        };
        const config = statuses[status] || { variant: 'gray', icon: 'question-circle' };
        return (
            <Badge variant={config.variant as any}>
                <i className={`fas fa-${config.icon} mr-1`}></i>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getRoleBadge = (role: string) => {
        const roles: Record<string, { variant: string; icon: string }> = {
            admin: { variant: 'danger', icon: 'crown' },
            staff: { variant: 'warning', icon: 'user-tie' },
            customer: { variant: 'primary', icon: 'user' }
        };
        const config = roles[role] || { variant: 'gray', icon: 'user' };
        return (
            <Badge variant={config.variant as any}>
                <i className={`fas fa-${config.icon} mr-1`}></i>
                {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('id-ID');
    };

    const columns = [
        {
            key: 'name',
            header: 'User',
            render: (value: string, row: User) => (
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        <img src={row.avatar || `/images/avatars/default-${row.role === 'admin' ? 'admin' : 'user'}.jpg`} alt={value} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="font-medium">{value}</div>
                        <div className="text-xs text-gray-500">{row.email}</div>
                    </div>
                </div>
            ),
            sortable: true
        },
        { key: 'role', header: 'Role', render: (value: string) => getRoleBadge(value), sortable: true },
        { key: 'status', header: 'Status', render: (value: string) => getStatusBadge(value), sortable: true },
        { key: 'orderCount', header: 'Orders', sortable: true },
        { key: 'totalSpent', header: 'Total Spent', render: (value: number) => formatCurrency(value), sortable: true },
        { key: 'createdAt', header: 'Joined', render: (value: string) => formatDate(value), sortable: true },
        { key: 'lastLogin', header: 'Last Login', render: (value: string) => formatDate(value), sortable: true }
    ];

    const actions = (row: User) => (
        <>
            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/users/${row.id}`)} icon="eye" title="View" />
            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/users/${row.id}/edit`)} icon="edit" title="Edit" />
            <Button variant="outline" size="sm" onClick={() => handleToggleStatus(row.id, row.status === 'active' ? 'inactive' : 'active')} icon="sync-alt" title={row.status === 'active' ? 'Deactivate' : 'Activate'} />
        </>
    );

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div><h1 className="text-2xl font-bold text-gray-900">Users</h1><p className="text-gray-600">Manage customers, staff, and administrators</p></div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={handleExportUsers} icon="download">Export</Button>
                        <Button variant="outline" onClick={handleImportUsers} icon="upload">Import</Button>
                        <Button variant="primary" onClick={() => navigate('/admin/users/create')} icon="plus">Add User</Button>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <Tabs
                    tabs={[
                        { id: 'all', label: 'All Users', count: users.length },
                        { id: 'customer', label: 'Customers', count: users.filter(u => u.role === 'customer').length },
                        { id: 'staff', label: 'Staff', count: users.filter(u => u.role === 'staff').length },
                        { id: 'admin', label: 'Admins', count: users.filter(u => u.role === 'admin').length },
                        { id: 'inactive', label: 'Inactive', count: users.filter(u => u.status !== 'active').length }
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />
            </div>

            <Card className="p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="lg:col-span-2"><Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon="search" /></div>
                    <div>
                        <Select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            options={[
                                { value: 'all', label: 'All Roles' },
                                { value: 'customer', label: 'Customer' },
                                { value: 'staff', label: 'Staff' },
                                { value: 'admin', label: 'Admin' }
                            ]}
                        />
                    </div>
                    <div>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                                { value: 'banned', label: 'Banned' },
                                { value: 'pending', label: 'Pending' }
                            ]}
                        />
                    </div>
                    <div>
                        <Select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            options={[
                                { value: 'all', label: 'All Time' },
                                { value: 'today', label: 'Today' },
                                { value: 'week', label: 'Last 7 Days' },
                                { value: 'month', label: 'Last 30 Days' },
                                { value: 'year', label: 'Last Year' }
                            ]}
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-48"
                            options={[
                                { value: 'newest', label: 'Sort by: Newest' },
                                { value: 'oldest', label: 'Sort by: Oldest' },
                                { value: 'name', label: 'Sort by: Name A-Z' },
                                { value: 'spent_high', label: 'Total Spent High-Low' },
                                { value: 'orders_high', label: 'Orders High-Low' },
                                { value: 'recent_login', label: 'Recent Login' }
                            ]}
                        />
                        <span className="text-sm text-gray-600">{filteredUsers.length} users found</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button onClick={() => setViewMode('table')} className={`px-3 py-1 rounded-md ${viewMode === 'table' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}><i className="fas fa-list"></i></button>
                            <button onClick={() => setViewMode('grid')} className={`px-3 py-1 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}><i className="fas fa-th-large"></i></button>
                        </div>
                        {selectedRows.length > 0 && (<><Button variant="outline" onClick={() => setShowBulkEmailModal(true)} icon="envelope">Email Selected ({selectedRows.length})</Button><Button variant="outline" onClick={() => toast('Bulk status update feature', { icon: 'ℹ️' })} icon="sync-alt">Bulk Status</Button></>)}
                    </div>
                </div>
            </Card>

            {viewMode === 'table' ? (
                <DataTable columns={columns} data={filteredUsers} actions={actions} selectable searchable={false} pagination onSelectionChange={setSelectedRows} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map(user => (
                        <UserCard key={user.id} user={user} onView={(id) => navigate(`/admin/users/${id}`)} onEdit={(id) => navigate(`/admin/users/${id}/edit`)} onToggleStatus={handleToggleStatus} onDelete={(id) => { setSelectedUser(users.find(u => u.id === id) || null); setShowDeleteModal(true); }} onSendEmail={(id) => toast(`Send email to ${users.find(u => u.id === id)?.name}`, { icon: '📧' })} loading={actionLoading} />
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <Card className="p-4"><div className="text-center"><div className="text-2xl font-bold text-blue-600">{users.length}</div><div className="text-sm text-gray-600">Total Users</div></div></Card>
                <Card className="p-4"><div className="text-center"><div className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'active').length}</div><div className="text-sm text-gray-600">Active Users</div></div></Card>
                <Card className="p-4"><div className="text-center"><div className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'customer').length}</div><div className="text-sm text-gray-600">Customers</div></div></Card>
                <Card className="p-4"><div className="text-center"><div className="text-2xl font-bold text-orange-600">{formatCurrency(users.reduce((sum, user) => sum + user.totalSpent, 0))}</div><div className="text-sm text-gray-600">Total Revenue</div></div></Card>
            </div>

            <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedUser(null); }} title="Delete User">
                <div className="p-6">
                    {selectedUser && (
                        <>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"><i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i></div>
                                <h3 className="text-lg font-bold mb-2">Delete {selectedUser.name}?</h3>
                                <p className="text-gray-600">This action cannot be undone. All user data including orders and reviews will be permanently deleted.</p>
                            </div>
                            <div className="flex gap-3"><Button variant="outline" onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }} className="flex-1" disabled={actionLoading}>Cancel</Button><Button variant="danger" onClick={handleDeleteUser} loading={actionLoading} className="flex-1">Delete User</Button></div>
                        </>
                    )}
                </div>
            </Modal>

            <Modal isOpen={showBulkEmailModal} onClose={() => { setShowBulkEmailModal(false); setEmailSubject(''); setEmailContent(''); }} title="Send Bulk Email" size="lg">
                <div className="p-6">
                    <div className="mb-6"><div className="flex items-center justify-between mb-2"><span className="font-medium">Recipients:</span><span className="font-bold">{selectedRows.length} users</span></div><div className="text-sm text-gray-600">{users.filter(u => selectedRows.includes(u.id)).map(u => u.email).join(', ')}</div></div>
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label><input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Email subject" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Content *</label><textarea value={emailContent} onChange={(e) => setEmailContent(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={8} placeholder="Write your email content here..." /></div>
                    </div>
                    <div className="flex gap-3 mt-6"><Button variant="outline" onClick={() => { setShowBulkEmailModal(false); setEmailSubject(''); setEmailContent(''); }} className="flex-1" disabled={actionLoading}>Cancel</Button><Button variant="primary" onClick={handleSendBulkEmail} loading={actionLoading} disabled={!emailSubject.trim() || !emailContent.trim() || actionLoading} className="flex-1" icon="paper-plane">Send Email</Button></div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminUsersPage;
