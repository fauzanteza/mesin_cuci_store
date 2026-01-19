import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product } from '../../types/product.types';

interface CartState {
    items: CartItem[];
    loading: boolean;
    error: string | null;
}

const initialState: CartState = {
    items: [],
    loading: false,
    error: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Add item to cart
        addToCart: (state, action: PayloadAction<{ product: Product; quantity?: number }>) => {
            const { product, quantity = 1 } = action.payload;
            const existingItem = state.items.find(item => item.product.id === product.id);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({
                    id: Date.now().toString(),
                    product,
                    quantity,
                    addedAt: new Date().toISOString(),
                });
            }
        },

        // Remove item from cart
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
        },

        // Update quantity
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const { id, quantity } = action.payload;
            const item = state.items.find(item => item.id === id);

            if (item) {
                if (quantity > 0) {
                    item.quantity = quantity;
                } else {
                    // Remove if quantity is 0 or negative
                    state.items = state.items.filter(item => item.id !== id);
                }
            }
        },

        // Clear cart
        clearCart: (state) => {
            state.items = [];
        },

        // Set cart from localStorage or server
        setCart: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
        },

        // Set loading state
        setCartLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        // Set error
        setCartError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCart,
    setCartLoading,
    setCartError,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) => {
    return state.cart.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);
};
export const selectCartCount = (state: { cart: CartState }) => {
    return state.cart.items.reduce((count, item) => count + item.quantity, 0);
};
export const selectCartLoading = (state: { cart: CartState }) => state.cart.loading;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;

export default cartSlice.reducer;
