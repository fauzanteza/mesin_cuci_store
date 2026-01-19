// frontend/src/services/userService.ts
import api from './api';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    role: string;
}

export interface Address {
    id: string;
    name: string;
    recipient: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    isDefault: boolean;
}

const userService = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (data: Partial<UserProfile>) => {
        const response = await api.put('/users/profile', data);
        return response.data;
    },

    getAddresses: async () => {
        const response = await api.get('/users/addresses');
        return response.data;
    },

    addAddress: async (data: Omit<Address, 'id'>) => {
        const response = await api.post('/users/addresses', data);
        return response.data;
    },

    updateAddress: async (id: string, data: Partial<Address>) => {
        const response = await api.put(`/users/addresses/${id}`, data);
        return response.data;
    },

    deleteAddress: async (id: string) => {
        const response = await api.delete(`/users/addresses/${id}`);
        return response.data;
    },

    getWishlist: async () => {
        const response = await api.get('/users/wishlist');
        return response.data;
    },

    addToWishlist: async (productId: string) => {
        const response = await api.post('/users/wishlist', { productId });
        return response.data;
    },

    removeFromWishlist: async (productId: string) => {
        const response = await api.delete(`/users/wishlist/${productId}`);
        return response.data;
    },

    getDashboardStats: async () => {
        const response = await api.get('/users/dashboard-stats');
        return response.data;
    }
};

export default userService;
