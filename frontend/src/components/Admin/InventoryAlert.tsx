import React from 'react';
import { Card, Badge, Button } from '../UI';

interface AlertItem {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    minStock: number;
    status: 'critical' | 'warning' | 'normal';
    lastRestocked?: string;
    supplier?: string;
}

interface InventoryAlertProps {
    alerts: AlertItem[];
    loading?: boolean;
    onViewProduct?: (productId: string) => void;
    onRestock?: (productId: string) => void;
}

const InventoryAlert: React.FC<InventoryAlertProps> = ({
    alerts,
    loading = false,
    onViewProduct,
    onRestock
}) => {
    const criticalAlerts = alerts.filter(a => a.status === 'critical');
    const warningAlerts = alerts.filter(a => a.status === 'warning');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'critical':
                return <Badge variant="danger">Critical</Badge>;
            case 'warning':
                return <Badge variant="warning">Warning</Badge>;
            default:
                return <Badge variant="success">Normal</Badge>;
        }
    };

    const getStockPercentage = (current: number, min: number) => {
        return Math.round((current / min) * 100);
    };

    if (loading) {
        return (
            <Card className="p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Inventory Alerts</h3>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-sm text-gray-600">
                                Critical: {criticalAlerts.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-sm text-gray-600">
                                Warning: {warningAlerts.length}
                            </span>
                        </div>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        // View all inventory
                    }}
                    icon="eye"
                >
                    View All
                </Button>
            </div>

            {alerts.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-2xl text-green-600"></i>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">All Stock Levels Normal</h4>
                    <p className="text-gray-600 text-sm">
                        No products require immediate attention
                    </p>
                </div>
            ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`p-4 rounded-lg border ${alert.status === 'critical'
                                    ? 'border-red-200 bg-red-50'
                                    : alert.status === 'warning'
                                        ? 'border-yellow-200 bg-yellow-50'
                                        : 'border-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="font-medium text-gray-900">{alert.productName}</h4>
                                    <p className="text-sm text-gray-600">SKU: {alert.sku}</p>
                                </div>
                                {getStatusBadge(alert.status)}
                            </div>

                            <div className="space-y-3">
                                {/* Stock Progress */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700">
                                            Stock: {alert.currentStock} / Min: {alert.minStock}
                                        </span>
                                        <span className={`font-medium ${alert.status === 'critical' ? 'text-red-600' :
                                                alert.status === 'warning' ? 'text-yellow-600' :
                                                    'text-green-600'
                                            }`}>
                                            {getStockPercentage(alert.currentStock, alert.minStock)}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${alert.status === 'critical'
                                                    ? 'bg-red-500'
                                                    : alert.status === 'warning'
                                                        ? 'bg-yellow-500'
                                                        : 'bg-green-500'
                                                }`}
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    getStockPercentage(alert.currentStock, alert.minStock)
                                                )}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onViewProduct?.(alert.productId)}
                                        icon="external-link-alt"
                                    >
                                        View Product
                                    </Button>

                                    {alert.status !== 'normal' && (
                                        <Button
                                            variant={alert.status === 'critical' ? 'danger' : 'warning'}
                                            size="sm"
                                            onClick={() => onRestock?.(alert.productId)}
                                            icon="truck-loading"
                                        >
                                            Restock Now
                                        </Button>
                                    )}
                                </div>

                                {/* Additional Info */}
                                {alert.lastRestocked && (
                                    <p className="text-xs text-gray-500">
                                        Last restocked: {alert.lastRestocked}
                                        {alert.supplier && ` • Supplier: ${alert.supplier}`}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {criticalAlerts.length > 0 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-exclamation-triangle text-red-600"></i>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-red-800">Immediate Action Required</h4>
                            <p className="text-sm text-red-700">
                                {criticalAlerts.length} products are critically low on stock
                            </p>
                        </div>
                        <Button
                            variant="danger"
                            onClick={() => {
                                // Restock all critical
                            }}
                            icon="truck"
                        >
                            Bulk Restock
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default InventoryAlert;
