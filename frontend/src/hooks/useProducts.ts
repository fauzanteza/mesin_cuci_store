import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { Product, ProductFilter } from '../types/product.types';

export const useProducts = (initialFilters?: ProductFilter & { limit?: number; featured?: boolean; sortBy?: string }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    // Total count for display
    const [total, setTotal] = useState(0);

    const fetchProducts = useCallback(async (filters: ProductFilter = {}) => {
        setLoading(true);
        setError(null);

        try {
            // Merge initial filters with current call filters
            // Handle special cases not in ProductFilter type if needed
            const mergedFilters = { ...initialFilters, ...filters };
            const response = await productService.getProducts(mergedFilters);
            setProducts(response.data?.products || []);
            setPagination(response.data?.pagination || { page: 1, limit: 10, total: response.data?.products?.length || 0, totalPages: 1 });
            setTotal(response.data?.pagination?.total || response.data?.products?.length || 0);
        } catch (err: any) {
            setError(err.message || 'Gagal memuat produk');
        } finally {
            setLoading(false);
        }
    }, [initialFilters]);

    const getProduct = async (id: string) => {
        setLoading(true);
        try {
            const product = await productService.getProductById(id);
            return product;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const addProduct = async (productData: FormData) => {
        setLoading(true);
        try {
            const newProduct = await productService.createProduct(productData);
            return newProduct;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateProduct = async (id: string, productData: FormData) => {
        setLoading(true);
        try {
            const updatedProduct = await productService.updateProduct(id, productData);
            return updatedProduct;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: string) => {
        setLoading(true);
        try {
            await productService.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const searchProducts = async (query: string) => {
        if (!query.trim()) {
            await fetchProducts();
            return;
        }

        await fetchProducts({ search: query });
    };

    // Initial fetch
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {
        products,
        loading,
        error,
        pagination,
        total,
        fetchProducts,
        getProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        searchProducts,
        refetch: () => fetchProducts(),
    };
};
