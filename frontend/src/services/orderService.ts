import api from './api';

export interface OrderData {
    userId: string;
    items: any[];
    shippingAddress: any;
    shippingMethod: any;
    paymentMethod: any;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    notes?: string;
}

const orderService = {
    createOrder: async (orderData: OrderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    getOrderById: async (id: string) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    getUserOrders: async () => {
        const response = await api.get('/orders/user');
        return response.data;
    },

    cancelOrder: async (id: string, reason: string) => {
        const response = await api.put(`/orders/${id}/cancel`, { reason });
        return response.data;
    },

    confirmDelivery: async (id: string) => {
        const response = await api.put(`/orders/${id}/confirm-delivery`);
        return response.data;
    }
};

export default orderService;
