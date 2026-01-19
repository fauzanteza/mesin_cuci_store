import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addToCart, removeFromCart, decreaseQuantity, clearCart } from '../store/slices/cartSlice';
import { Product } from '../types/product.types';

export const useCart = () => {
    const dispatch = useDispatch();
    const { items, totalQuantity, totalAmount } = useSelector((state: RootState) => state.cart);

    const addItem = (product: Product, quantity: number = 1) => {
        dispatch(addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0]?.image_url || '',
            quantity
        }));
    };

    const removeItem = (id: string) => {
        dispatch(removeFromCart(id));
    };

    const decreaseItemQuantity = (id: string) => {
        dispatch(decreaseQuantity(id));
    };

    const clear = () => {
        dispatch(clearCart());
    };

    return {
        cartItems: items,
        totalQuantity,
        totalAmount,
        addItem,
        removeItem,
        decreaseItemQuantity,
        clearCart: clear
    };
};
