import api from '@/utils/api';
import { User } from '@/types';

export const userService = {
    getProfile: async () => {
        const response = await api.get<{ success: boolean; data: User }>('/users/profile');
        return response.data;
    },

    updateProfile: async (data: Partial<User> & { password?: string; newPassword?: string }) => {
        const response = await api.put<{ success: boolean; data: User }>('/users/profile', data);
        return response.data;
    },

    getAddresses: async () => {
        const response = await api.get('/users/addresses');
        return response.data;
    },

    addAddress: async (address: any) => {
        const response = await api.post('/users/addresses', address);
        return response.data;
    }
};
