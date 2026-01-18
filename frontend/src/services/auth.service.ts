import api from '@/utils/api';
import { AuthResponse, User } from '@/types';
import { LoginInputs } from '@/pages/Auth/LoginPage';
import { RegisterInputs } from '@/pages/Auth/RegisterPage';

export const authService = {
    login: async (data: LoginInputs) => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterInputs) => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get<{ success: boolean; data: User }>('/auth/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};
