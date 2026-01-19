import React from 'react';
import { useSelector } from 'react-redux';
import { selectCartTotal, selectCartCount } from '../../store/slices/cartSlice';
import Button from '../UI/Button';
import { PriceDisplay } from '../Shared';

interface CartSummaryProps {
    onCheckout: () => void;
    shippingCost?: number;
    discount?: number;
    className?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({
    onCheckout,
    shippingCost = 0,
    discount = 0,
    className = '',
}) => {
    const subtotal = useSelector(selectCartTotal);
    const itemCount = useSelector(selectCartCount);

    const tax = subtotal * 0.11; // 11% VAT
    const grandTotal = subtotal + shippingCost + tax - discount;

    return (
        <div className={`bg-white rounded-lg shadow ${className}`}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-6">Ringkasan Keranjang</h2>

                {/* Item Count */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b">
                    <span className="text-gray-600">Total Item</span>
                    <span className="font-medium">{itemCount} produk</span>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium"><PriceDisplay price={subtotal} /></span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600">Biaya Pengiriman</span>
                        <span className="font-medium">
                            {shippingCost > 0
                                ? <PriceDisplay price={shippingCost} />
                                : <span className="text-green-600">GRATIS</span>
                            }
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600">PPN (11%)</span>
                        <span className="font-medium"><PriceDisplay price={tax} /></span>
                    </div>

                    {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Diskon</span>
                            <span className="font-medium">- <PriceDisplay price={discount} /></span>
                        </div>
                    )}
                </div>

                {/* Grand Total */}
                <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total Pembayaran</span>
                        <span className="text-primary-600"><PriceDisplay price={grandTotal} /></span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Sudah termasuk PPN</p>
                </div>

                {/* Checkout Button */}
                <Button
                    variant="primary"
                    size="lg"
                    onClick={onCheckout}
                    className="w-full mb-4"
                    disabled={itemCount === 0}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>}
                >
                    Lanjutkan ke Pembayaran
                </Button>

                {/* Security Badge */}
                <div className="text-center mt-4 pt-4 border-t">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        <span>Pembayaran 100% Aman</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartSummary;
