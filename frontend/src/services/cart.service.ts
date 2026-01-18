import api from '@/utils/api';
import { Product } from '@/types';

export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    product: Product;
}

export interface CartResponse {
    success: boolean;
    data: CartItem[];
}

export const cartService = {
    getCart: async () => {
        const response = await api.get<CartResponse>('/cart');
        return response.data;
    },

    addToCart: async (productId: string, quantity: number) => {
        const response = await api.post('/cart/add', { productId, quantity });
        return response.data;
    },

    updateItem: async (id: string, quantity: number) => {
        const response = await api.put(`/cart/update/${id}`, { quantity });
        return response.data;
    },

    removeItem: async (id: string) => {
        const response = await api.delete(`/cart/remove/${id}`);
        return response.data;
    },

    clearCart: async () => {
        const response = await api.delete('/cart/clear');
        return response.data;
    }
};
