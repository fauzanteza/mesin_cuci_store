import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
    selectCartItems,
    selectCartTotal,
    selectCartCount,
    updateQuantity,
    removeFromCart,
    clearCart
} from '../store/slices/cartSlice';
import Button from '../components/UI/Button';
import CartItem from '../components/Cart/CartItem';
import CartSummary from '../components/Cart/CartSummary';

const CartPage: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token } = useSelector((state: any) => state.auth);
    const isAuthenticated = !!token;

    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);
    const cartCount = useSelector(selectCartCount);
    // const [loading, setLoading] = useState(false); // Unused for now
    const [showClearModal, setShowClearModal] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [promoCode, setPromoCode] = useState('');

    const subtotal = cartTotal;

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity > 0) {
            dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
        }
    };

    const handleRemoveItem = (itemId: string) => {
        dispatch(removeFromCart(itemId));
    };

    const handleClearCart = () => {
        dispatch(clearCart());
        setShowClearModal(false);
    };

    const handleApplyPromo = () => {
        // In real app, validate promo code with API
        if (promoCode === 'DISKON10') {
            setDiscount(subtotal * 0.1);
        } else {
            alert('Kode promo tidak valid'); // Simple alert for now
        }
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/cart' } });
            return;
        }

        if (cartItems.length === 0) {
            return;
        }

        navigate('/checkout');
    };

    const handleContinueShopping = () => {
        navigate('/products');
    };

    // Calculate shipping cost (simulated)
    useEffect(() => {
        if (subtotal > 3000000) {
            setShippingCost(0); // Free shipping
        } else {
            setShippingCost(25000); // Standard shipping
        }
    }, [subtotal]);

    return (
        <div className="cart-page bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b py-4">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center text-sm text-gray-600">
                        <Link to="/" className="hover:text-primary-600">Beranda</Link>
                        <span className="mx-2 text-gray-400">/</span>
                        <span className="text-gray-900 font-medium">Keranjang Belanja</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Keranjang Belanja</h1>
                <p className="text-gray-600 mb-8">
                    {cartCount > 0
                        ? `Anda memiliki ${cartCount} item di keranjang`
                        : 'Keranjang belanja Anda kosong'}
                </p>

                {cartItems.length === 0 ? (
                    // Empty cart state
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                        <div className="w-32 h-32 mx-auto mb-6 text-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-full h-full">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">Keranjang Belanja Kosong</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Belum ada produk yang ditambahkan ke keranjang. Mulai belanja untuk menemukan mesin cuci terbaik!
                        </p>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleContinueShopping}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 11 4-7" /><path d="m19 11-4-7" /><path d="M2 11h20" /><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8c.9 0 1.8-.7 2-1.6l1.7-7.4" /><path d="m9 11 1 9" /></svg>}
                        >
                            Mulai Belanja
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            {/* Cart Header */}
                            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-800">Produk di Keranjang ({cartCount})</h2>
                                    <button
                                        onClick={() => setShowClearModal(true)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                        Hapus Semua
                                    </button>
                                </div>
                            </div>

                            {/* Cart Items List */}
                            <div className="bg-white rounded-lg shadow-sm divide-y border border-gray-100">
                                {cartItems.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onQuantityChange={(qty) => handleQuantityChange(item.id, qty)}
                                        onRemove={() => handleRemoveItem(item.id)}
                                    />
                                ))}
                            </div>

                            {/* Continue Shopping */}
                            <div className="mt-6">
                                <Button
                                    variant="outline"
                                    onClick={handleContinueShopping}
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>}
                                    className="w-full sm:w-auto"
                                >
                                    Lanjutkan Belanja
                                </Button>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm sticky top-24 border border-gray-100 p-6">
                                {/* Promo Code */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kode Promo
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            placeholder="Masukkan kode promo"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={handleApplyPromo}
                                            disabled={!promoCode.trim()}
                                        >
                                            Pakai
                                        </Button>
                                    </div>
                                </div>

                                <CartSummary
                                    onCheckout={handleCheckout}
                                    shippingCost={shippingCost}
                                    discount={discount}
                                    className="shadow-none p-0 border-none"
                                />

                                {/* Shipping Info */}
                                <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                                    <div className="flex items-start gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mt-1"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                                        <div>
                                            <h3 className="font-medium text-blue-800">Gratis Pengiriman!</h3>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Dapatkan pengiriman gratis untuk pembelian di atas Rp 3.000.000
                                            </p>
                                            {subtotal < 3000000 && (
                                                <p className="text-sm text-blue-600 mt-2 font-medium">
                                                    Tambah {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(3000000 - subtotal)} lagi untuk gratis ongkir!
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Clear Cart Modal - Simplified inline or use Modal component if available */}
            {showClearModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full m-4">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Hapus Semua Item?</h3>
                            <p className="text-gray-600 mb-6">
                                Tindakan ini tidak dapat dibatalkan. Keranjang Anda akan menjadi kosong.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowClearModal(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleClearCart}
                                >
                                    Ya, Hapus
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CartPage;
