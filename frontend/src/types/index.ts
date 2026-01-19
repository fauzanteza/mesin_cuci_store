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
    user: User; // Backend returns user in 'data' field
}

export interface ApiError {
    message: string;
    stack?: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    brandId?: string;
    images: ProductImage[];
    category?: Category;
    brand?: Brand;
    rating?: number;
    reviewCount?: number;
}

export interface ProductImage {
    id: string;
    url: string;
    isPrimary: boolean;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface Brand {
    id: string;
    name: string;
    slug: string;
}
