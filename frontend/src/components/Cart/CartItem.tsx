import React from 'react';
import { Link } from 'react-router-dom';
import { CartItem as CartItemType } from '../../types/product.types';
import { PriceDisplay } from '../Shared';

interface CartItemProps {
    item: CartItemType;
    onQuantityChange: (quantity: number) => void;
    onRemove: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onQuantityChange, onRemove }) => {
    const { product, quantity } = item;
    const totalPrice = product.price * quantity;

    const handleDecrease = () => {
        if (quantity > 1) {
            onQuantityChange(quantity - 1);
        } else {
            onRemove();
        }
    };

    const handleIncrease = () => {
        if (quantity < product.stock) {
            onQuantityChange(quantity + 1);
        }
    };

    const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 1 && value <= product.stock) {
            onQuantityChange(value);
        }
    };

    return (
        <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                    <Link to={`/products/${product.id}`}>
                        <div className="w-24 h-24 rounded-lg overflow-hidden border">
                            <img
                                src={product.images?.[0]?.image_url || '/images/placeholder/product.jpg'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </Link>
                </div>

                {/* Product Info */}
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                        <div className="flex-1">
                            <Link to={`/products/${product.id}`}>
                                <h3 className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                                    {product.name}
                                </h3>
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-500">{product.brand?.name}</span>
                                {product.brand && <span className="text-xs text-gray-400">•</span>}
                                {product.sku && <span className="text-sm text-gray-500">SKU: {product.sku}</span>}
                            </div>

                            {/* Product Features */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {product.features?.map((feature, i) => (
                                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mt-2 sm:mt-0 sm:text-right">
                            <PriceDisplay
                                price={product.price}
                                originalPrice={product.compare_price} // Mapped to compare_price
                                size="lg"
                            />
                            <div className="mt-1 text-sm text-gray-500">
                                per unit
                            </div>
                        </div>
                    </div>

                    {/* Quantity Controls & Actions */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center border rounded-lg">
                                <button
                                    onClick={handleDecrease}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
                                    disabled={quantity <= 1}
                                >
                                    {/* Minus Icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                                </button>

                                <div className="relative">
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={handleQuantityInput}
                                        min="1"
                                        max={product.stock}
                                        className="w-16 text-center border-0 focus:ring-0 appearance-none bg-transparent"
                                    />
                                    <div className="absolute -bottom-6 left-0 right-0 text-xs text-gray-500 text-center">
                                        Stok: {product.stock}
                                    </div>
                                </div>

                                <button
                                    onClick={handleIncrease}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
                                    disabled={quantity >= product.stock}
                                >
                                    {/* Plus Icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                                </button>
                            </div>

                            {/* Stock Status */}
                            {product.stock < 10 && product.stock > 0 && (
                                <div className="text-sm text-orange-600 flex items-center gap-1">
                                    {/* Alert Triangle */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>
                                    Hampir habis ({product.stock})
                                </div>
                            )}

                            {product.stock === 0 && (
                                <div className="text-sm text-red-600 flex items-center gap-1">
                                    {/* X Circle */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                                    Stok habis
                                </div>
                            )}
                        </div>

                        {/* Total Price & Actions */}
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                    <PriceDisplay price={totalPrice} />
                                </div>
                                <div className="text-sm text-gray-500">
                                    {quantity} × <PriceDisplay price={product.price} />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onRemove}
                                    className="text-red-500 hover:text-red-700 p-2"
                                    title="Hapus item"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
