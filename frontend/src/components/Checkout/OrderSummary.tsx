// frontend/src/components/Checkout/OrderSummary.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectCartItems } from '../../store/slices/cartSlice';
import { PriceDisplay } from '../Shared';
import { Button } from '../UI';

interface OrderSummaryProps {
    subtotal: number;
    shippingCost?: number;
    paymentMethod?: any;
    onEditCart: () => void;
    className?: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
    subtotal,
    shippingCost = 0,
    paymentMethod,
    onEditCart,
    className = '',
}) => {
    const cartItems = useSelector(selectCartItems);
    const tax = subtotal * 0.11;
    const grandTotal = subtotal + shippingCost + tax;

    // Check if eligible for free shipping
    const isFreeShipping = subtotal >= 3000000;
    const amountToFreeShipping = 3000000 - subtotal;
    const freeShippingProgress = Math.min((subtotal / 3000000) * 100, 100);

    return (
        <div className={`bg-white rounded-xl shadow-lg ${className}`}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-6">Ringkasan Pesanan</h2>

                {/* Free Shipping Progress */}
                {!isFreeShipping && amountToFreeShipping > 0 && (
                    <div className="mb-6 bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-800">
                                Tambah Rp {amountToFreeShipping.toLocaleString()} untuk gratis ongkir!
                            </span>
                            <span className="text-xs text-blue-600">
                                {Math.round(freeShippingProgress)}%
                            </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${freeShippingProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                            Belanja minimal Rp 3.000.000 untuk gratis ongkir
                        </p>
                    </div>
                )}

                {/* Order Items */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Produk ({cartItems.length})</h3>
                        <Button
                            variant="text"
                            size="sm"
                            onClick={onEditCart}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Edit
                        </Button>
                    </div>

                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0">
                                    <img
                                        src={item.product.images?.[0]?.url || '/images/placeholder/product.jpg'}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm text-gray-900 truncate">
                                        {item.product.name}
                                    </h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-sm text-gray-500">
                                            {item.quantity} × <PriceDisplay price={item.product.price} size="sm" />
                                        </span>
                                        <span className="font-medium text-sm">
                                            Rp {(item.product.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">Rp {subtotal.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Biaya Pengiriman</span>
                            <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                                {shippingCost === 0 ? 'GRATIS' : `Rp ${shippingCost.toLocaleString()}`}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">PPN (11%)</span>
                            <span className="font-medium">Rp {tax.toLocaleString()}</span>
                        </div>

                        {paymentMethod && (
                            <div className="flex justify-between border-t pt-3">
                                <div>
                                    <span className="text-gray-600">Metode Pembayaran</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <i className={`fas fa-${paymentMethod.icon} text-blue-600`}></i>
                                        <span className="text-sm font-medium">{paymentMethod.name}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Grand Total */}
                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total Pembayaran</span>
                            <span className="text-blue-600">Rp {grandTotal.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Sudah termasuk PPN
                        </p>
                    </div>
                </div>

                {/* Payment Methods Icons */}
                <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-gray-600 mb-3">Metode Pembayaran Tersedia:</p>
                    <div className="flex flex-wrap gap-3">
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <i className="fab fa-cc-visa text-blue-600 text-xl"></i>
                        </div>
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <i className="fab fa-cc-mastercard text-red-600 text-xl"></i>
                        </div>
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <i className="fab fa-cc-paypal text-blue-500 text-xl"></i>
                        </div>
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <i className="fas fa-university text-green-600 text-xl"></i>
                        </div>
                    </div>
                </div>

                {/* Need Help */}
                <div className="mt-6">
                    <Link to="/contact" className="block text-center text-blue-600 hover:text-blue-800 text-sm">
                        <i className="fas fa-question-circle mr-2"></i>
                        Butuh Bantuan?
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
