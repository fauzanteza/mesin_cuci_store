import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Button,
    Card,
    LoadingSpinner,
    Modal,
    Badge,
    Tabs
} from '../../components/UI';
import DataTable from '../../components/Admin/DataTable';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'customer' | 'staff';
    status: 'active' | 'inactive' | 'banned' | 'pending';
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    createdAt: string;
    lastLogin?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    notes?: string;
}

interface UserAddress {
    id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    isDefault: boolean;
    label: 'home' | 'office' | 'other';
}

interface UserOrder {
    id: string;
    orderNumber: string;
    date: string;
    total: number;
    status: string;
    items: number;
    paymentStatus: string;
}

interface UserActivity {
    id: string;
    action: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}

const AdminUserDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [orders, setOrders] = useState<UserOrder[]>([]);
    const [activities, setActivities] = useState<UserActivity[]>([]);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSendEmailModal, setShowSendEmailModal] = useState(false);

    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: '', status: '' });
    const [emailSubject, setEmailSubject] = useState('');
    const [emailContent, setEmailContent] = useState('');

    useEffect(() => { loadUserData(); }, [id]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            // Mock data
            const mockUser: User = {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                avatar: '/images/avatars/user1.jpg',
                role: 'customer',
                status: 'active',
                phone: '081234567890',
                dateOfBirth: '1990-05-15',
                gender: 'male',
                createdAt: '2024-01-15T10:30:00',
                lastLogin: '2024-02-15T14:20:00',
                emailVerified: true,
                phoneVerified: true,
                notes: 'VIP customer, prefers evening deliveries'
            };

            const mockAddresses: UserAddress[] = [
                { id: '1', name: 'John Doe', phone: '081234567890', address: 'Jl. Contoh No. 123', city: 'Jakarta', province: 'DKI Jakarta', postalCode: '12345', isDefault: true, label: 'home' }
            ];

            const mockOrders: UserOrder[] = [
                { id: '1', orderNumber: 'ORD-2024-001', date: '2024-02-15', total: 3525000, status: 'processing', items: 2, paymentStatus: 'paid' },
                { id: '2', orderNumber: 'ORD-2024-002', date: '2024-02-10', total: 4500000, status: 'delivered', items: 1, paymentStatus: 'paid' }
            ];

            const mockActivities: UserActivity[] = [
                { id: '1', action: 'login', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0.0.0', createdAt: '2024-02-15T14:20:00' },
                { id: '2', action: 'view_product', details: 'Viewed product: Mesin Cuci LG 8kg', createdAt: '2024-02-15T14:15:00' }
            ];

            setUser(mockUser);
            setAddresses(mockAddresses);
            setOrders(mockOrders);
            setActivities(mockActivities);
            setEditForm({ name: mockUser.name, email: mockUser.email, phone: mockUser.phone || '', role: mockUser.role, status: mockUser.status });

        } catch (error) {
            toast.error('Failed to load user data');
            navigate('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!user) return;
        try {
            setUpdating(true);
            const updatedUser = { ...user, name: editForm.name, email: editForm.email, phone: editForm.phone, role: editForm.role as any, status: editForm.status as any };
            setUser(updatedUser);
            toast.success('User updated successfully');
            setShowEditModal(false);
        } catch (error) { toast.error('Failed to update user'); } finally { setUpdating(false); }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (!user) return;
        try {
            setUpdating(true);
            setUser({ ...user, status: newStatus as any });
            toast.success(`User status updated to ${newStatus}`);
            setShowStatusModal(false);
        } catch (error) { toast.error('Failed to update user status'); } finally { setUpdating(false); }
    };

    const handleDeleteUser = async () => {
        if (!user) return;
        try {
            setUpdating(true);
            toast.success(`User ${user.name} deleted successfully`);
            navigate('/admin/users');
        } catch (error) { toast.error('Failed to delete user'); } finally { setUpdating(false); }
    };

    const handleSendEmail = async () => {
        if (!user) return;
        if (!emailSubject.trim() || !emailContent.trim()) { toast.error('Please enter subject and content'); return; }
        try {
            setUpdating(true);
            toast.success(`Email sent to ${user.email}`);
            setShowSendEmailModal(false);
            setEmailSubject('');
            setEmailContent('');
        } catch (error) { toast.error('Failed to send email'); } finally { setUpdating(false); }
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { variant: string; icon: string }> = {
            active: { variant: 'success', icon: 'check-circle' },
            inactive: { variant: 'warning', icon: 'clock' },
            banned: { variant: 'danger', icon: 'ban' },
            pending: { variant: 'warning', icon: 'hourglass-half' }
        };
        const config = statuses[status] || { variant: 'gray', icon: 'question-circle' };
        return <Badge variant={config.variant as any}><i className={`fas fa-${config.icon} mr-1`}></i>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    const getRoleBadge = (role: string) => {
        const roles: Record<string, { variant: string; icon: string }> = {
            admin: { variant: 'danger', icon: 'crown' },
            staff: { variant: 'warning', icon: 'user-tie' },
            customer: { variant: 'primary', icon: 'user' }
        };
        const config = roles[role] || { variant: 'gray', icon: 'user' };
        return <Badge variant={config.variant as any}><i className={`fas fa-${config.icon} mr-1`}></i>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
    };

    const getVerificationBadge = (verified: boolean) => (
        <Badge variant={verified ? 'success' : 'warning'}><i className={`fas fa-${verified ? 'check' : 'times'} mr-1`}></i>{verified ? 'Verified' : 'Not Verified'}</Badge>
    );

    const orderColumns = [
        { key: 'orderNumber', header: 'Order', render: (value: string, row: UserOrder) => <div><div className="font-medium">{value}</div><div className="text-xs text-gray-500">{row.items} item{row.items > 1 ? 's' : ''}</div></div> },
        { key: 'date', header: 'Date', render: (value: string) => formatDate(value) },
        { key: 'total', header: 'Total', render: (value: number) => formatCurrency(value) },
        { key: 'status', header: 'Status', render: (value: string) => <Badge variant={value === 'delivered' ? 'success' : value === 'processing' ? 'warning' : 'primary'}>{value.charAt(0).toUpperCase() + value.slice(1)}</Badge> },
        { key: 'paymentStatus', header: 'Payment', render: (value: string) => <Badge variant={value === 'paid' ? 'success' : 'warning'}>{value.charAt(0).toUpperCase() + value.slice(1)}</Badge> }
    ];

    const activityColumns = [
        { key: 'action', header: 'Action', render: (value: string, row: UserActivity) => <div><div className="font-medium capitalize">{value.replace('_', ' ')}</div>{row.details && <div className="text-xs text-gray-500">{row.details}</div>}</div> },
        { key: 'ipAddress', header: 'IP Address' },
        { key: 'createdAt', header: 'Time', render: (value: string) => formatDate(value, true) }
    ];

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'orders', label: 'Orders', count: orders.length },
        { id: 'addresses', label: 'Addresses', count: addresses.length },
        { id: 'activity', label: 'Activity', count: activities.length },
        { id: 'notes', label: 'Notes' }
    ];

    if (loading) return <div className="container mx-auto px-4 py-8"><div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div></div>;
    if (!user) return <div className="container mx-auto px-4 py-8"><div className="text-center"><h2 className="text-xl font-bold text-gray-800">User not found</h2><Button variant="outline" onClick={() => navigate('/admin/users')} className="mt-4">Back to Users</Button></div></div>;

    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
    const lastOrder = orders.length > 0 ? orders[0] : null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div><div className="flex items-center gap-3"><Button variant="outline" size="sm" onClick={() => navigate('/admin/users')} icon="arrow-left">Back</Button><div><h1 className="text-2xl font-bold text-gray-900">{user.name}</h1><p className="text-gray-600">User ID: {user.id} • Joined {formatDate(user.createdAt)}</p></div></div></div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={() => setShowSendEmailModal(true)} icon="envelope">Send Email</Button>
                        <Button variant="outline" onClick={() => setShowEditModal(true)} icon="edit">Edit User</Button>
                        <Button variant="outline" onClick={() => setShowStatusModal(true)} icon="sync-alt">Change Status</Button>
                        <Button variant="danger" onClick={() => setShowDeleteModal(true)} icon="trash">Delete</Button>
                    </div>
                </div>
            </div>

            <div className="mb-6"><Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} /></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="p-6"><div className="text-center"><div className="text-3xl font-bold text-blue-600">{orders.length}</div><div className="text-sm text-gray-600">Total Orders</div></div></Card>
                                <Card className="p-6"><div className="text-center"><div className="text-3xl font-bold text-green-600">{formatCurrency(totalSpent)}</div><div className="text-sm text-gray-600">Total Spent</div></div></Card>
                                <Card className="p-6"><div className="text-center"><div className="text-3xl font-bold text-purple-600">{formatCurrency(avgOrderValue)}</div><div className="text-sm text-gray-600">Avg. Order Value</div></div></Card>
                            </div>
                            <Card className="p-6"><h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>{orders.length > 0 ? <DataTable columns={orderColumns} data={orders.slice(0, 5)} searchable={false} pagination={false} /> : <div className="text-center py-8 text-gray-500">No orders yet</div>}{orders.length > 0 && <Button variant="outline" onClick={() => setActiveTab('orders')} className="w-full mt-4">View All Orders</Button>}</Card>
                            <Card className="p-6"><h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>{activities.length > 0 ? <DataTable columns={activityColumns} data={activities.slice(0, 5)} searchable={false} pagination={false} /> : <div className="text-center py-8 text-gray-500">No recent activity</div>}{activities.length > 0 && <Button variant="outline" onClick={() => setActiveTab('activity')} className="w-full mt-4">View All Activity</Button>}</Card>
                        </div>
                    )}

                    {activeTab === 'orders' && <Card className="p-6"><h3 className="text-lg font-bold text-gray-900 mb-6">Order History</h3>{orders.length > 0 ? <DataTable columns={orderColumns} data={orders} searchable pagination /> : <div className="text-center py-12 text-gray-500"><i className="fas fa-shopping-cart text-4xl mb-4 opacity-50"></i><p className="text-lg font-medium">No orders found</p></div>}</Card>}

                    {activeTab === 'addresses' && (
                        <Card className="p-6"><h3 className="text-lg font-bold text-gray-900 mb-6">Saved Addresses</h3>
                            {addresses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {addresses.map(address => (
                                        <div key={address.id} className="border rounded-lg p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2"><Badge variant={address.label === 'home' ? 'primary' : address.label === 'office' ? 'warning' : 'gray'}>{address.label.charAt(0).toUpperCase() + address.label.slice(1)}</Badge>{address.isDefault && <Badge variant="success">Default</Badge>}</div>
                                                <div className="flex gap-2"><Button variant="outline" size="sm" icon="edit" onClick={() => toast('Edit address feature', { icon: 'ℹ️' })} /><Button variant="outline" size="sm" icon="trash" onClick={() => toast('Delete address feature', { icon: 'ℹ️' })} /></div>
                                            </div>
                                            <div className="space-y-2"><div><span className="font-medium">{address.name}</span><div className="text-gray-600">{address.phone}</div></div><div className="text-gray-700"><p>{address.address}</p><p>{address.city}, {address.province}</p><p>Postal Code: {address.postalCode}</p></div></div>
                                            {!address.isDefault && <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => toast('Set as default feature', { icon: 'ℹ️' })}>Set as Default</Button>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500"><i className="fas fa-map-marker-alt text-4xl mb-4 opacity-50"></i><p className="text-lg font-medium">No addresses saved</p></div>
                            )}
                            <Button variant="outline" onClick={() => toast('Add address feature', { icon: 'ℹ️' })} icon="plus" className="mt-6">Add New Address</Button>
                        </Card>
                    )}

                    {activeTab === 'notes' && (
                        <Card className="p-6"><h3 className="text-lg font-bold text-gray-900 mb-6">User Notes</h3><div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label><textarea className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={8} defaultValue={user.notes || ''} placeholder="Add internal notes about this user..." /><p className="text-sm text-gray-500 mt-2">These notes are only visible to administrators</p></div><Button variant="primary" onClick={() => toast.success('Notes saved')} icon="save">Save Notes</Button></div></Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="p-6"><div className="text-center mb-6"><div className="relative inline-block"><div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto"><img src={user.avatar || `/images/avatars/default-${user.role === 'admin' ? 'admin' : 'user'}.jpg`} alt={user.name} className="w-full h-full object-cover" /></div>{user.status === 'active' && <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>}</div><h2 className="text-xl font-bold mt-4">{user.name}</h2><p className="text-gray-600">{user.email}</p><div className="flex items-center justify-center gap-2 mt-3">{getRoleBadge(user.role)}{getStatusBadge(user.status)}</div></div>
                        <div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><span className="block text-sm text-gray-600">Phone</span><span className="font-medium">{user.phone || 'Not provided'}</span></div><div><span className="block text-sm text-gray-600">Email Verified</span>{getVerificationBadge(user.emailVerified)}</div>{user.dateOfBirth && <div><span className="block text-sm text-gray-600">Date of Birth</span><span className="font-medium">{formatDate(user.dateOfBirth)}</span></div>}{user.gender && <div><span className="block text-sm text-gray-600">Gender</span><span className="font-medium capitalize">{user.gender}</span></div>}<div><span className="block text-sm text-gray-600">Phone Verified</span>{getVerificationBadge(user.phoneVerified)}</div><div><span className="block text-sm text-gray-600">Last Login</span><span className="font-medium">{formatDate(user.lastLogin, true) || 'Never'}</span></div></div></div>
                        <div className="border-t pt-6 mt-6"><h4 className="font-bold text-gray-700 mb-3">Quick Actions</h4><div className="grid grid-cols-2 gap-3"><Button variant="outline" size="sm" onClick={() => toast('Reset password feature', { icon: 'ℹ️' })} icon="key">Reset Password</Button><Button variant="outline" size="sm" onClick={() => toast('Login as user feature', { icon: 'ℹ️' })} icon="sign-in-alt">Login as User</Button><Button variant="outline" size="sm" onClick={() => setShowSendEmailModal(true)} icon="envelope">Send Email</Button><Button variant="outline" size="sm" onClick={() => navigate(`/admin/orders?customer=${user.id}`)} icon="shopping-cart">View Orders</Button></div></div>
                    </Card>
                    {lastOrder && <Card className="p-6"><h3 className="font-bold text-gray-900 mb-4">Last Order</h3><div className="space-y-3"><div className="flex justify-between"><span className="text-gray-600">Order:</span><span className="font-medium">{lastOrder.orderNumber}</span></div><div className="flex justify-between"><span className="text-gray-600">Date:</span><span>{formatDate(lastOrder.date)}</span></div><div className="flex justify-between"><span className="text-gray-600">Total:</span><span className="font-bold">{formatCurrency(lastOrder.total)}</span></div><div className="flex justify-between"><span className="text-gray-600">Status:</span><Badge variant={lastOrder.status === 'delivered' ? 'success' : lastOrder.status === 'processing' ? 'warning' : 'primary'}>{lastOrder.status.charAt(0).toUpperCase() + lastOrder.status.slice(1)}</Badge></div></div><Button variant="outline" className="w-full mt-4" onClick={() => navigate(`/admin/orders/${lastOrder.id}`)} icon="external-link-alt">View Order Details</Button></Card>}
                </div>
            </div>

            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User" size="lg">
                <div className="p-6">
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label><input type="text" value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Email *</label><input type="email" value={editForm.email} onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone</label><input type="tel" value={editForm.phone} onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-2">Role</label><select value={editForm.role} onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg"><option value="customer">Customer</option><option value="staff">Staff</option><option value="admin">Admin</option></select></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-2">Status</label><select value={editForm.status} onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg"><option value="active">Active</option><option value="inactive">Inactive</option><option value="banned">Banned</option><option value="pending">Pending</option></select></div>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6"><Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1" disabled={updating}>Cancel</Button><Button variant="primary" onClick={handleUpdateUser} loading={updating} className="flex-1">Save Changes</Button></div>
                </div>
            </Modal>

            <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Change User Status">
                <div className="p-6">
                    <div className="mb-6"><div className="flex items-center justify-between mb-2"><span className="font-medium">User:</span><span className="font-bold">{user?.name}</span></div><div className="flex items-center justify-between"><span className="font-medium">Current Status:</span>{getStatusBadge(user?.status || 'active')}</div></div>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <Button variant={user?.status === 'active' ? 'primary' : 'outline'} onClick={() => handleUpdateStatus('active')} disabled={updating} icon="check-circle">Active</Button>
                        <Button variant={user?.status === 'inactive' ? 'warning' : 'outline'} onClick={() => handleUpdateStatus('inactive')} disabled={updating} icon="clock">Inactive</Button>
                        <Button variant={user?.status === 'banned' ? 'danger' : 'outline'} onClick={() => handleUpdateStatus('banned')} disabled={updating} icon="ban">Banned</Button>
                        <Button variant={user?.status === 'pending' ? 'warning' : 'outline'} onClick={() => handleUpdateStatus('pending')} disabled={updating} icon="hourglass-half">Pending</Button>
                    </div>
                    <Button variant="outline" onClick={() => setShowStatusModal(false)} className="w-full" disabled={updating}>Cancel</Button>
                </div>
            </Modal>

            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete User">
                <div className="p-6">
                    <div className="text-center mb-6"><div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"><i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i></div><h3 className="text-lg font-bold mb-2">Delete {user?.name}?</h3><p className="text-gray-600">This action cannot be undone.</p></div>
                    <div className="flex gap-3"><Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1" disabled={updating}>Cancel</Button><Button variant="danger" onClick={handleDeleteUser} loading={updating} className="flex-1">Delete User</Button></div>
                </div>
            </Modal>

            <Modal isOpen={showSendEmailModal} onClose={() => { setShowSendEmailModal(false); setEmailSubject(''); setEmailContent(''); }} title="Send Email" size="lg">
                <div className="p-6">
                    <div className="mb-6"><div className="flex items-center justify-between mb-2"><span className="font-medium">To:</span><span className="font-bold">{user?.email}</span></div></div>
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label><input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Content *</label><textarea value={emailContent} onChange={(e) => setEmailContent(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={8} required /></div>
                    </div>
                    <div className="flex gap-3 mt-6"><Button variant="outline" onClick={() => { setShowSendEmailModal(false); setEmailSubject(''); setEmailContent(''); }} className="flex-1" disabled={updating}>Cancel</Button><Button variant="primary" onClick={handleSendEmail} loading={updating} disabled={!emailSubject.trim() || !emailContent.trim() || updating} className="flex-1" icon="paper-plane">Send Email</Button></div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminUserDetailPage;
