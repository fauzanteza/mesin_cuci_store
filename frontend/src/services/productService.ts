import api from './api'
import {
    Product,
    ProductListResponse,
    Category,
    ProductFilter,
} from '../types/product.types'

export const productService = {
    // Get all products with filters
    getProducts: async (filters?: ProductFilter) => {
        const params = new URLSearchParams()

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (Array.isArray(value)) {
                        value.forEach(v => params.append(key, v.toString()))
                    } else {
                        params.append(key, value.toString())
                    }
                }
            })
        }

        const response = await api.get<ProductListResponse>(`/products?${params}`)
        return response.data
    },

    getAll: async (filters?: ProductFilter) => {
        // Wrapper for getProducts to match HomePage usage (getAll)
        return productService.getProducts(filters);
    },

    // Get single product by ID
    getProductById: async (id: string) => {
        const response = await api.get<{ success: boolean, data: Product }>(`/products/${id}`)
        return response.data.data
    },

    // Get featured products
    getFeaturedProducts: async () => {
        // Assuming the API has this endpoint or we filter
        // For now using normal get with limit
        const response = await api.get<{ success: boolean, data: { products: Product[] } }>(`/products?limit=8&sort=rating`)
        return response.data.data.products
    },

    // Get categories
    getCategories: async () => {
        const response = await api.get<{ success: boolean, data: { categories: Category[] } }>('/categories')
        return response.data.data.categories
    },

    // Search products
    searchProducts: async (query: string) => {
        const response = await api.get<{ success: boolean, data: { products: Product[] } }>(`/products/search?q=${query}`)
        return response.data.data.products
    },

    // Get related products
    getRelatedProducts: async (_productId: string, categoryId: string) => {
        const response = await api.get<{ success: boolean, data: { products: Product[] } }>(
            `/products?category=${categoryId}&limit=4`
        )
        return response.data.data.products
    },

    // Admin methods (Placeholders)
    createProduct: async (data: any) => {
        const response = await api.post('/products', data);
        return response.data;
    },

    updateProduct: async (id: string, data: any) => {
        const response = await api.put(`/products/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id: string) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },
}
