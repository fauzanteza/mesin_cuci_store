import api from '@/utils/api';

export interface Order {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    createdAt: string;
    items: OrderItem[];
}

export interface OrderItem {
    id: string;
    productName: string; // Simplified for display
    quantity: number;
    price: number;
    image?: string;
}

export const orderService = {
    getMyOrders: async () => {
        const response = await api.get<{ success: boolean; data: Order[] }>('/orders/my-orders');
        return response.data;
    },

    getOrderById: async (id: string) => {
        const response = await api.get<{ success: boolean; data: Order }>(`/orders/${id}`);
        return response.data;
    },

    createOrder: async (data: any) => {
        const response = await api.post<{ success: boolean; data: Order }>('/orders', data);
        return response.data;
    }
};
