import api from './api';

const adminService = {
    // Dashboard Stats
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard/stats');
        return response.data;
    },

    getRecentOrders: async () => {
        const response = await api.get('/admin/dashboard/recent-orders');
        return response.data;
    },

    getSalesReport: async (period: string) => {
        const response = await api.get(`/admin/dashboard/sales-report?period=${period}`);
        return response.data;
    },

    getInventoryAlerts: async () => {
        const response = await api.get('/admin/dashboard/inventory-alerts');
        return response.data;
    },

    getTopProducts: async () => {
        const response = await api.get('/admin/dashboard/top-products');
        return response.data;
    },

    // Product Management
    getProducts: async (params: any) => {
        const response = await api.get('/admin/products', { params });
        return response.data;
    },

    getProduct: async (id: string) => {
        const response = await api.get(`/admin/products/${id}`);
        return response.data;
    },

    createProduct: async (data: FormData) => {
        const response = await api.post('/admin/products', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateProduct: async (id: string, data: FormData) => {
        const response = await api.put(`/admin/products/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteProduct: async (id: string) => {
        const response = await api.delete(`/admin/products/${id}`);
        return response.data;
    },

    updateProductStatus: async (id: string, status: string) => {
        const response = await api.patch(`/admin/products/${id}/status`, { status });
        return response.data;
    },

    bulkUpdateProducts: async (data: any) => {
        const response = await api.post('/admin/products/bulk', data);
        return response.data;
    },

    // Order Management
    getOrders: async (params: any) => {
        const response = await api.get('/admin/orders', { params });
        return response.data;
    },

    getOrder: async (id: string) => {
        const response = await api.get(`/admin/orders/${id}`);
        return response.data;
    },

    updateOrderStatus: async (id: string, data: any) => {
        const response = await api.patch(`/admin/orders/${id}/status`, data);
        return response.data;
    },

    updatePaymentStatus: async (id: string, data: any) => {
        const response = await api.patch(`/admin/orders/${id}/payment`, data);
        return response.data;
    },

    updateOrderNotes: async (id: string, adminNotes: string) => {
        const response = await api.patch(`/admin/orders/${id}/notes`, { adminNotes });
        return response.data;
    },

    bulkUpdateOrderStatus: async (orderIds: string[], status: string) => {
        const response = await api.patch('/admin/orders/bulk-status', { orderIds, status });
        return response.data;
    }
};

export default adminService;
