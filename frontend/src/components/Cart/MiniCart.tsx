import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
    selectCartItems,
    selectCartTotal,
    removeFromCart,
} from '../../store/slices/cartSlice';
import { PriceDisplay } from '../Shared';
import Button from '../UI/Button';
import { Trash2, ShoppingCart, X } from 'lucide-react';

const MiniCart: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);

    const handleRemoveItem = (itemId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(removeFromCart(itemId));
    };

    const handleViewCart = () => {
        setIsVisible(false);
        navigate('/cart');
    };

    const handleCheckout = () => {
        setIsVisible(false);
        navigate('/checkout');
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.mini-cart-container') && !target.closest('.cart-trigger')) {
                setIsVisible(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Expose toggle function globally/via context if needed, but for now we rely on the trigger being part of this or controlled by parent. 
    // Actually, usually the Header controls visibility or this component includes the trigger. 
    // For this pattern (Header has logic), we might want to just export the content or have a way to open it.
    // Assuming this is rendered IN the header and contains the trigger button locally.

    return (
        <div className="relative mini-cart-container">
            <button
                className="cart-trigger relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                onClick={() => setIsVisible(!isVisible)}
            >
                <ShoppingCart className="w-6 h-6" />
                {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                )}
            </button>

            {isVisible && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-100 overflow-hidden cart-dropdown animate-fade-in-down">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <h3 className="font-semibold text-gray-900">Keranjang Belanja ({cartItems.length})</h3>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto p-4">
                        {cartItems.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                    <ShoppingCart className="w-8 h-8" />
                                </div>
                                <p className="text-gray-500 mb-4">Keranjang belanja kosong</p>
                                <Button variant="primary" size="sm" onClick={() => { setIsVisible(false); navigate('/products'); }}>
                                    Mulai Belanja
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-3 group">
                                        <Link
                                            to={`/products/${item.product.id}`}
                                            className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border border-gray-200"
                                            onClick={() => setIsVisible(false)}
                                        >
                                            <img
                                                src={item.product.images?.[0]?.image_url || '/images/placeholder.jpg'}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </Link>

                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <Link
                                                    to={`/products/${item.product.id}`}
                                                    className="font-medium text-sm text-gray-900 hover:text-primary-600 line-clamp-1 block"
                                                    onClick={() => setIsVisible(false)}
                                                >
                                                    {item.product.name}
                                                </Link>
                                                <p className="text-xs text-gray-500 mt-1">{item.product.brand?.name}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-medium text-primary-600">
                                                    {item.quantity} x <PriceDisplay price={item.product.price} size="sm" />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => handleRemoveItem(item.id, e)}
                                            className="text-gray-400 hover:text-danger-500 self-start p-1 transition-colors"
                                            title="Hapus item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {cartItems.length > 0 && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600 font-medium">Subtotal:</span>
                                <span className="text-lg font-bold text-primary-600">
                                    <PriceDisplay price={cartTotal} />
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleViewCart}
                                    className="w-full"
                                >
                                    Lihat Keranjang
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleCheckout}
                                    className="w-full"
                                >
                                    Checkout
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MiniCart;
