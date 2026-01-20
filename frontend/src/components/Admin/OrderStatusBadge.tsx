import React from 'react';

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded'
    | 'on_hold';

interface OrderStatusBadgeProps {
    status: OrderStatus;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    className?: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
    status,
    size = 'md',
    showIcon = true,
    className = ''
}) => {
    const getStatusConfig = (status: OrderStatus) => {
        const configs = {
            pending: {
                label: 'Pending',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: 'clock',
                iconColor: 'text-yellow-600'
            },
            confirmed: {
                label: 'Confirmed',
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: 'check-circle',
                iconColor: 'text-blue-600'
            },
            processing: {
                label: 'Processing',
                color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                icon: 'cogs',
                iconColor: 'text-indigo-600'
            },
            shipped: {
                label: 'Shipped',
                color: 'bg-purple-100 text-purple-800 border-purple-200',
                icon: 'shipping-fast',
                iconColor: 'text-purple-600'
            },
            delivered: {
                label: 'Delivered',
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: 'box-check',
                iconColor: 'text-green-600'
            },
            cancelled: {
                label: 'Cancelled',
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: 'times-circle',
                iconColor: 'text-red-600'
            },
            refunded: {
                label: 'Refunded',
                color: 'bg-pink-100 text-pink-800 border-pink-200',
                icon: 'undo',
                iconColor: 'text-pink-600'
            },
            on_hold: {
                label: 'On Hold',
                color: 'bg-gray-100 text-gray-800 border-gray-200',
                icon: 'pause-circle',
                iconColor: 'text-gray-600'
            }
        };

        return configs[status] || configs.pending;
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    const config = getStatusConfig(status);

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 rounded-full border
        font-medium ${sizeClasses[size]} ${config.color} ${className}
      `}
        >
            {showIcon && (
                <i className={`fas fa-${config.icon} ${config.iconColor}`}></i>
            )}
            {config.label}
        </span>
    );
};

export default OrderStatusBadge;
