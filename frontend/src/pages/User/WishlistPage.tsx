import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, LoadingSpinner, Badge } from '../../components/UI';
// import ProductGrid from '../../components/Product/ProductGrid';
import ProductCard from '../../components/Product/ProductCard';
import cartService from '../../services/cartService';
import userService from '../../services/userService';
import { Product } from '../../types/product.types';

const UserWishlistPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            setLoading(true);
            const response = await userService.getWishlist();
            setProducts(response.data || []);
        } catch (error) {
            // Alert.error('Gagal memuat wishlist');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId: string) => {
        try {
            setRemovingId(productId);
            await userService.removeFromWishlist(productId);
            setProducts(prev => prev.filter(p => p.id !== productId));
            // Alert.success('Produk dihapus dari wishlist');
            alert('Produk dihapus dari wishlist');
        } catch (error) {
            // Alert.error('Gagal menghapus dari wishlist');
            alert('Gagal menghapus dari wishlist');
        } finally {
            setRemovingId(null);
        }
    };

    const handleAddToCart = async (productId: string) => {
        try {
            await cartService.addItem(productId, 1);
            // Alert.success('Ditambahkan ke keranjang');
            alert('Ditambahkan ke keranjang');
        } catch (error) {
            // Alert.error('Gagal menambahkan ke keranjang');
            alert('Gagal menambahkan ke keranjang');
        }
    };

    const handleClearWishlist = async () => {
        if (products.length === 0) return;

        if (window.confirm('Hapus semua item dari wishlist?')) {
            try {
                // Implement clear wishlist in userService if needed, or loop delete
                // await userService.clearWishlist(); 
                // Since clearWishlist isn't in userService.ts, we won't implement it yet or we iterate
                // For now, let's skip clearing functionality or disable it
                alert('Fitur ini belum tersedia');
                return;
                // setProducts([]);
                // // Alert.success('Wishlist berhasil dikosongkan');
                // alert('Wishlist berhasil dikosongkan');
            } catch (error) {
                // Alert.error('Gagal mengosongkan wishlist');
                alert('Gagal mengosongkan wishlist');
            }
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Wishlist Saya</h1>
                    <p className="text-gray-600">
                        Simpan produk favorit Anda untuk dibeli nanti
                    </p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <Badge variant="primary">
                        {products.length} Produk
                    </Badge>
                    {products.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={handleClearWishlist}
                            icon="trash"
                        >
                            Kosongkan Wishlist
                        </Button>
                    )}
                </div>
            </div>

            {products.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div key={product.id} className="relative group">
                                <ProductCard product={product} />
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleRemove(product.id)}
                                        disabled={removingId === product.id}
                                        className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors"
                                        title="Hapus dari wishlist"
                                    >
                                        {removingId === product.id ? (
                                            <LoadingSpinner size="sm" />
                                        ) : (
                                            <i className="fas fa-trash"></i>
                                        )}
                                    </button>
                                </div>
                                <div className="mt-3 space-y-2">
                                    <Button
                                        variant="primary"
                                        className="w-full"
                                        onClick={() => handleAddToCart(product.id)}
                                        icon="shopping-cart"
                                    >
                                        Tambah ke Keranjang
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            // Navigate to product detail
                                            window.location.href = `/products/${product.slug}`;
                                        }}
                                    >
                                        Lihat Detail
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg mb-2">
                                    Sudah menemukan yang dicari?
                                </h3>
                                <p className="text-gray-600">
                                    Lanjutkan belanja atau checkout produk di wishlist
                                </p>
                            </div>
                            <div className="flex gap-3 mt-4 md:mt-0">
                                <Link to="/products">
                                    <Button variant="outline" icon="arrow-left">
                                        Lanjut Belanja
                                    </Button>
                                </Link>
                                <Button variant="primary" icon="shopping-cart">
                                    Checkout Semua ({products.length})
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-heart text-4xl text-purple-600"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        Wishlist Kosong
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                        Tambahkan produk favorit Anda ke wishlist untuk menyimpannya dan membeli nanti
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/products">
                            <Button variant="primary" icon="shopping-bag">
                                Jelajahi Produk
                            </Button>
                        </Link>
                        <Link to="/user/orders">
                            <Button variant="outline" icon="history">
                                Lihat Riwayat Belanja
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {products.length > 0 && (
                <div className="mt-12">
                    <div className="border-t pt-8">
                        <h3 className="font-bold text-lg mb-4">Tips Wishlist</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                                    <i className="fas fa-bell text-blue-600"></i>
                                </div>
                                <h4 className="font-bold mb-2">Notifikasi Harga</h4>
                                <p className="text-sm text-gray-600">
                                    Dapatkan notifikasi saat produk di wishlist turun harga
                                </p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                                    <i className="fas fa-share-alt text-green-600"></i>
                                </div>
                                <h4 className="font-bold mb-2">Bagikan Wishlist</h4>
                                <p className="text-sm text-gray-600">
                                    Bagikan wishlist Anda dengan teman atau keluarga
                                </p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                                    <i className="fas fa-gift text-purple-600"></i>
                                </div>
                                <h4 className="font-bold mb-2">Hadiah Ulang Tahun</h4>
                                <p className="text-sm text-gray-600">
                                    Buat wishlist khusus untuk hadiah ulang tahun Anda
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserWishlistPage;
