// frontend/src/pages/User/WishlistPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, LoadingSpinner } from '../../components/UI';
import { Product } from '../../types/product.types';
import userService from '../../services/userService';

const WishlistPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState<Product[]>([]);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            // const data = await userService.getWishlist();
            // setWishlist(data);

            // Mock Data
            setWishlist([
                // Assuming Product type structure
                {
                    id: 1,
                    name: 'Mesin Cuci LG 8kg',
                    price: 3450000,
                    images: [{ id: 1, product_id: 1, image_url: '/images/products/lg-washing-machine.jpg', is_primary: true }],
                    stock: 10,
                    category: { id: 1, name: 'Front Load', slug: 'front-load' },
                    description: '',
                    brand: { id: 1, name: 'LG', slug: 'lg', logo: '' },
                    specifications: {},
                    is_active: true,
                    created_at: '',
                    updated_at: ''
                }
            ]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await userService.removeFromWishlist(id);
            setWishlist(wishlist.filter(item => item.id !== id));
        } catch (error) {
            alert('Gagal menghapus dari wishlist');
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><LoadingSpinner /></div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Wishlist Saya</h1>

            {wishlist.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                    <i className="fas fa-heart text-gray-300 text-5xl mb-4"></i>
                    <h2 className="text-xl font-bold text-gray-700">Wishlist Kosong</h2>
                    <p className="text-gray-500 mb-6">Simpan barang impian Anda di sini.</p>
                    <Link to="/products">
                        <Button variant="primary">Jelajahi Produk</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlist.map((product) => (
                        <div key={product.id} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden">
                            <Link to={`/products/${product.id}`} className="block relative pt-[100%] bg-gray-100">
                                <img
                                    src={product.images?.[0]?.image_url || '/placeholder.jpg'}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </Link>
                            <div className="p-4">
                                <Link to={`/products/${product.id}`}>
                                    <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 truncate">{product.name}</h3>
                                </Link>
                                <p className="font-bold text-lg text-blue-600 mb-4">Rp {product.price.toLocaleString()}</p>
                                <div className="flex gap-2">
                                    <Button variant="primary" size="sm" className="flex-1">
                                        + Keranjang
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleRemove(product.id)}>
                                        <i className="fas fa-trash"></i>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
