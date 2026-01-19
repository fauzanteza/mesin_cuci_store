import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react'

import { RootState } from '../store'
import { removeFromCart, decreaseQuantity, addToCart, clearCart } from '../store/slices/cartSlice'
import Button from '../components/UI/Button'

const CartPage = () => {
    const dispatch = useDispatch()
    const { items, totalAmount, totalQuantity } = useSelector((state: RootState) => state.cart)

    const handleIncrease = (item: any) => {
        dispatch(addToCart({ ...item, quantity: 1 }))
    }

    const handleDecrease = (id: string) => {
        dispatch(decreaseQuantity(id))
    }

    const handleRemove = (id: string) => {
        dispatch(removeFromCart(id))
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto py-20 px-4 text-center">
                <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Anda Kosong</h2>
                <p className="text-gray-600 mb-8">
                    Sepertinya Anda belum menambahkan produk apapun.
                </p>
                <Link to="/products">
                    <Button size="lg">Mulai Belanja</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Keranjang Belanja</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                                    {/* Product Image */}
                                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={item.image || 'https://via.placeholder.com/150'}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 flex flex-col sm:flex-row justify-between items-center w-full gap-4">
                                        <div className="text-center sm:text-left">
                                            <h3 className="font-semibold text-lg text-gray-900">
                                                {item.name}
                                            </h3>
                                            <p className="text-primary-600 font-bold mt-1">
                                                Rp {item.price.toLocaleString()}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-6">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center border border-gray-200 rounded-lg">
                                                <button
                                                    onClick={() => handleDecrease(item.id)}
                                                    className="p-2 hover:bg-gray-50 text-gray-600 transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-10 text-center text-sm font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleIncrease(item)}
                                                    className="p-2 hover:bg-gray-50 text-gray-600 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Hapus item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-6 flex justify-between">
                        <Button variant="outline" onClick={() => dispatch(clearCart())}>
                            Kosongkan Keranjang
                        </Button>
                        <Link to="/products">
                            <Button variant="ghost">
                                Lanjut Belanja
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:w-96">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Ringkasan Pesanan</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Total Item</span>
                                <span>{totalQuantity} pcs</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>Rp {totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg text-gray-900">
                                <span>Total</span>
                                <span>Rp {totalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <Link to="/checkout" className="block">
                            <Button size="lg" className="w-full justify-center gap-2">
                                Checkout
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            Pajak dan biaya pengiriman dihitung saat checkout.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartPage
