import api from './api';
import { CartItem } from '../types/product.types';

class CartService {
    // Get cart from server (for logged-in users)
    async getCart(): Promise<CartItem[]> {
        try {
            const response = await api.get('/cart');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            return [];
        }
    }

    // Add item to cart (sync with server)
    async addItem(productId: string, quantity: number): Promise<CartItem> {
        const response = await api.post('/cart/items', { productId, quantity });
        return response.data;
    }

    // Update item quantity
    async updateItem(itemId: string, quantity: number): Promise<CartItem> {
        const response = await api.put(`/cart/items/${itemId}`, { quantity });
        return response.data;
    }

    // Remove item from cart
    async removeItem(itemId: string): Promise<void> {
        await api.delete(`/cart/items/${itemId}`);
    }

    // Clear cart
    async clearCart(): Promise<void> {
        await api.delete('/cart/clear');
    }

    // Merge local cart with server cart (on login)
    async mergeCart(localItems: CartItem[]): Promise<CartItem[]> {
        const response = await api.post('/cart/merge', { items: localItems });
        return response.data;
    }

    // Calculate shipping cost
    async calculateShipping(addressId: string): Promise<number> {
        const response = await api.post('/cart/shipping', { addressId });
        return response.data.shippingCost;
    }
}

export default new CartService();
