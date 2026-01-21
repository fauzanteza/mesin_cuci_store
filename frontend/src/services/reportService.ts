import api from './api';

export const reportService = {
    getSalesReport: async (params: { startDate: string; endDate: string }) => {
        const response = await api.get('/reports/sales', { params });
        return response.data;
    },

    getCategoryReport: async (params: { startDate: string; endDate: string }) => {
        const response = await api.get('/reports/categories', { params });
        return response.data;
    },

    getTopProducts: async (params: { startDate: string; endDate: string; limit?: number }) => {
        const response = await api.get('/reports/top-products', { params });
        return response.data;
    },

    exportReport: async (params: { type: string; startDate: string; endDate: string; format: 'pdf' | 'excel' }) => {
        const response = await api.get('/reports/export', {
            params,
            responseType: 'blob', // Important for file download
        });

        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report-${params.type}-${new Date().toISOString()}.${params.format === 'excel' ? 'xlsx' : 'pdf'}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    }
};
