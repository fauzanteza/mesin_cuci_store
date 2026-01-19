import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

export const MiniCart = () => {
    const { cartItems, totalAmount } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="bg-white shadow-dropdown rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Keranjang kosong</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-dropdown rounded-lg p-4 w-80">
            <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                            <img src={item.image || '/placeholder.jpg'} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.quantity} x Rp {item.price.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="border-t pt-3">
                <div className="flex justify-between font-bold mb-3">
                    <span>Total</span>
                    <span>Rp {totalAmount.toLocaleString()}</span>
                </div>
                <Link to="/cart" className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
                    Lihat Keranjang
                </Link>
            </div>
        </div>
    );
};
