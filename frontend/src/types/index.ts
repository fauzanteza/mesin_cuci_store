// Export all product related types from product.types.ts
export * from './product.types';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'customer';
    phone?: string;
    avatar?: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
}

export interface ApiError {
    message: string;
    stack?: string;
}
