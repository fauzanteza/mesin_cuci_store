import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    selectCartItems,
    selectCartTotal,
    selectCartCount
} from '../store/slices/cartSlice';
import { Product } from '../types/product.types';

export const useCart = () => {
    const dispatch = useDispatch();
    const items = useSelector(selectCartItems);
    const total = useSelector(selectCartTotal);
    const count = useSelector(selectCartCount);

    const addItem = useCallback((product: Product, quantity: number = 1) => {
        dispatch(addToCart({ product, quantity }));
    }, [dispatch]);

    const removeItem = useCallback((itemId: string) => {
        dispatch(removeFromCart(itemId));
    }, [dispatch]);

    const updateItemQuantity = useCallback((itemId: string, quantity: number) => {
        dispatch(updateQuantity({ id: itemId, quantity }));
    }, [dispatch]);

    const clearAll = useCallback(() => {
        dispatch(clearCart());
    }, [dispatch]);

    const getItem = useCallback((productId: string) => {
        return items.find(item => item.product.id === productId);
    }, [items]);

    const isInCart = useCallback((productId: string) => {
        return items.some(item => item.product.id === productId);
    }, [items]);

    return {
        items,
        total,
        count,
        addItem,
        removeItem,
        updateItemQuantity,
        clearAll,
        getItem,
        isInCart,
    };
};
