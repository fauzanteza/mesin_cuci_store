import api from './api';

const adminService = {
    // Dashboard
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

    createProduct: async (data: any) => {
        const response = await api.post('/admin/products', data);
        return response.data;
    },

    updateProduct: async (id: string, data: any) => {
        const response = await api.put(`/admin/products/${id}`, data);
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
    },

    // User Management
    getUsers: async (params: any) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    getUser: async (id: string) => {
        const response = await api.get(`/admin/users/${id}`);
        return response.data;
    },

    createUser: async (data: any) => {
        const response = await api.post('/admin/users', data);
        return response.data;
    },

    updateUser: async (id: string, data: any) => {
        const response = await api.put(`/admin/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: string) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },

    updateUserStatus: async (id: string, status: string) => {
        const response = await api.patch(`/admin/users/${id}/status`, { status });
        return response.data;
    },

    // Logs
    getLogs: async (params: any) => {
        const response = await api.get('/admin/logs', { params });
        return response.data;
    },

    deleteLog: async (id: string) => {
        const response = await api.delete(`/admin/logs/${id}`);
        return response.data;
    },

    bulkDeleteLogs: async (ids: string[]) => {
        const response = await api.post('/admin/logs/bulk-delete', { ids });
        return response.data;
    },

    // Category Management
    getCategories: async (params: any) => {
        const response = await api.get('/admin/categories', { params });
        return response.data;
    },

    getCategoryTree: async (includeInactive = false) => {
        const response = await api.get('/admin/categories/tree', { params: { includeInactive } });
        return response.data;
    },

    getCategory: async (id: string) => {
        const response = await api.get(`/admin/categories/${id}`);
        return response.data;
    },

    createCategory: async (data: any) => {
        const response = await api.post('/admin/categories', data);
        return response.data;
    },

    updateCategory: async (id: string, data: any) => {
        const response = await api.put(`/admin/categories/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: string) => {
        const response = await api.delete(`/admin/categories/${id}`);
        return response.data;
    },

    updateCategoryStatus: async (id: string, isActive: boolean) => {
        const response = await api.patch(`/admin/categories/${id}/status`, { isActive });
        return response.data;
    },

    updateCategoryFeatured: async (id: string, isFeatured: boolean) => {
        const response = await api.patch(`/admin/categories/${id}/featured`, { isFeatured });
        return response.data;
    },

    reorderCategories: async (categories: { id: string, sortOrder: number }[]) => {
        const response = await api.patch('/admin/categories/reorder', { categories });
        return response.data;
    },

    bulkUpdateCategories: async (data: any) => {
        const response = await api.post('/admin/categories/bulk-update', data);
        return response.data;
    },

    getCategoryStats: async () => {
        const response = await api.get('/admin/categories/stats');
        return response.data;
    },

    uploadCategoryImage: async (id: string, file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post(`/admin/categories/${id}/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Settings
    getSettings: async () => {
        const response = await api.get('/admin/settings');
        return response.data;
    },

    updateSettings: async (data: any) => {
        const response = await api.put('/admin/settings', data);
        return response.data;
    }
};

export default adminService;
