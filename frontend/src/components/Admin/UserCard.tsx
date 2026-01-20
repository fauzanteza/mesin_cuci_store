import React, { useState } from 'react';
import { Button, Badge } from '../UI';

interface UserCardProps {
    user: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
        role: 'admin' | 'customer' | 'staff';
        status: 'active' | 'inactive' | 'banned' | 'pending';
        phone?: string;
        createdAt: string;
        lastLogin?: string;
        orderCount: number;
        totalSpent: number;
    };
    onView: (userId: string) => void;
    onEdit: (userId: string) => void;
    onToggleStatus: (userId: string, newStatus: string) => void;
    onDelete: (userId: string) => void;
    onSendEmail: (userId: string) => void;
    loading?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
    user,
    onView,
    onEdit,
    onToggleStatus,
    onDelete,
    onSendEmail,
    loading = false
}) => {
    const [showActions, setShowActions] = useState(false);

    const getRoleBadge = (role: string) => {
        const roles: Record<string, { variant: string; icon: string }> = {
            admin: { variant: 'danger', icon: 'crown' },
            staff: { variant: 'warning', icon: 'user-tie' },
            customer: { variant: 'primary', icon: 'user' }
        };
        const config = roles[role] || { variant: 'gray', icon: 'user' };

        return (
            <Badge variant={config.variant as any} size="sm">
                <i className={`fas fa-${config.icon} mr-1`}></i>
                {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
        );
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
            <Badge variant={config.variant as any} size="sm">
                <i className={`fas fa-${config.icon} mr-1`}></i>
                {status.charAt(0).toUpperCase() + status.slice(1)}
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

    const getStatusToggleText = (currentStatus: string) => {
        if (currentStatus === 'active') return 'Deactivate';
        if (currentStatus === 'inactive') return 'Activate';
        if (currentStatus === 'banned') return 'Unban';
        return 'Activate';
    };

    const getStatusToggleVariant = (currentStatus: string) => {
        if (currentStatus === 'active') return 'warning';
        if (currentStatus === 'banned') return 'success';
        return 'primary';
    };

    const getNewStatus = (currentStatus: string) => {
        if (currentStatus === 'active') return 'inactive';
        if (currentStatus === 'inactive') return 'active';
        if (currentStatus === 'banned') return 'active';
        return 'active';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* User Header */}
            <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow">
                                <img
                                    src={user.avatar || `/images/avatars/default-${user.role === 'admin' ? 'admin' : 'user'}.jpg`}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {user.status === 'active' && (
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg">{user.name}</h3>
                                {getRoleBadge(user.role)}
                                {getStatusBadge(user.status)}
                            </div>
                            <p className="text-gray-600">{user.email}</p>
                            {user.phone && (
                                <p className="text-gray-600 text-sm">
                                    <i className="fas fa-phone mr-2"></i>
                                    {user.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowActions(!showActions)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                            disabled={loading}
                        >
                            <i className="fas fa-ellipsis-v"></i>
                        </button>

                        {showActions && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <button
                                    onClick={() => {
                                        onView(user.id);
                                        setShowActions(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <i className="fas fa-eye"></i>
                                    View Details
                                </button>
                                <button
                                    onClick={() => {
                                        onEdit(user.id);
                                        setShowActions(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <i className="fas fa-edit"></i>
                                    Edit User
                                </button>
                                <button
                                    onClick={() => {
                                        onSendEmail(user.id);
                                        setShowActions(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <i className="fas fa-envelope"></i>
                                    Send Email
                                </button>
                                <button
                                    onClick={() => {
                                        onToggleStatus(user.id, getNewStatus(user.status));
                                        setShowActions(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <i className="fas fa-sync-alt"></i>
                                    {getStatusToggleText(user.status)}
                                </button>
                                <div className="border-t">
                                    <button
                                        onClick={() => {
                                            onDelete(user.id);
                                            setShowActions(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <i className="fas fa-trash"></i>
                                        Delete User
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* User Stats */}
            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{user.orderCount}</div>
                        <div className="text-sm text-gray-600">Orders</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(user.totalSpent)}
                        </div>
                        <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Member since:</span>
                        <span className="font-medium">{formatDate(user.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Last login:</span>
                        <span className="font-medium">{formatDate(user.lastLogin)}</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onView(user.id)}
                        icon="eye"
                        disabled={loading}
                    >
                        View
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onEdit(user.id)}
                        icon="edit"
                        disabled={loading}
                    >
                        Edit
                    </Button>
                    <Button
                        variant={getStatusToggleVariant(user.status) as any}
                        size="sm"
                        className="flex-1"
                        onClick={() => onToggleStatus(user.id, getNewStatus(user.status))}
                        icon="sync-alt"
                        disabled={loading}
                    >
                        {getStatusToggleText(user.status)}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserCard;
