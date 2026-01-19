import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Heart, Share2, Star, ChevronRight, Truck, Shield, AlertCircle } from 'lucide-react';
import { productService } from '../services/productService';
import { useCart } from '../hooks/useCart';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Alert from '../components/UI/Alert';
import { ProductGallery, ProductSpecs } from '../components/Product';
import { PriceDisplay, RatingStars } from '../components/Shared';
import Tabs from '../components/UI/Tabs';

const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getProductById(id!),
        enabled: !!id,
    });

    const { data: relatedProducts } = useQuery({
        queryKey: ['related-products', product?.category?.slug],
        queryFn: () => productService.getProducts({ category: product?.category?.slug, limit: 4 }),
        enabled: !!product?.category?.slug,
    });

    const handleAddToCart = () => {
        if (product) {
            addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0]?.image_url,
                quantity: quantity
            } as any);
            // Show toast/feedback handled by hook/UI usually
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
    if (error || !product) return <div className="container mx-auto py-12 px-4"><Alert variant="error" title="Error">Produk tidak ditemukan atau terjadi kesalahan.</Alert></div>;

    return (
        <div className="bg-white min-h-screen pb-12">
            {/* Breadcrumb - Simplified */}
            <div className="bg-gray-50 py-4 border-b">
                <div className="container mx-auto px-4 flex items-center text-sm text-gray-500">
                    <Link to="/" className="hover:text-blue-600">Beranda</Link>
                    <ChevronRight size={14} className="mx-2" />
                    <Link to="/products" className="hover:text-blue-600">Produk</Link>
                    <ChevronRight size={14} className="mx-2" />
                    <span className="text-gray-900 font-medium truncate">{product.name}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Gallery */}
                    <div>
                        <ProductGallery images={product.images?.map(img => ({ url: img.image_url })) || []} />
                    </div>

                    {/* Right: Info */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1">
                                <RatingStars rating={product.rating || 4.5} />
                                <span className="text-sm text-gray-500 text-underline underline cursor-pointer ml-1">
                                    ({product.review_count || 0} Ulasan)
                                </span>
                            </div>
                            <div className="h-4 w-px bg-gray-300"></div>
                            <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                                <Shield size={14} /> Garansi Resmi
                            </div>
                        </div>

                        <div className="my-6">
                            <PriceDisplay price={product.price} originalPrice={product.compare_price} size="2xl" showDiscount={true} />
                        </div>

                        <div className="border-t border-b border-gray-100 py-6 my-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Pilih Jumlah</span>
                                <div className="flex items-center border rounded-lg">
                                    <button
                                        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        disabled={quantity <= 1}
                                    >-</button>
                                    <span className="px-3 font-medium w-10 text-center">{quantity}</span>
                                    <button
                                        className="px-3 py-1 hover:bg-gray-100"
                                        onClick={() => setQuantity(q => q + 1)}
                                    >+</button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-8">
                            <Button className="flex-1 py-3 text-lg justify-center" onClick={handleAddToCart}>
                                <ShoppingCart className="mr-2" /> Tambah Keranjang
                            </Button>
                            <Button variant="outline" className="px-4" icon={<Heart className="w-6 h-6" />} />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                            <div className="flex gap-3">
                                <Truck className="text-blue-600 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-sm text-gray-900">Gratis Ongkir Jabodetabek</p>
                                    <p className="text-xs text-gray-600">Estimasi tiba 2-3 hari kerja</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Shield className="text-blue-600 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-sm text-gray-900">Garansi Sparepart 1 Tahun</p>
                                    <p className="text-xs text-gray-600">Garansi motor hingga 5 tahun</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs: Description, Specs, Reviews */}
                <div className="mt-16">
                    <Tabs
                        items={[
                            {
                                id: 'desc',
                                label: 'Deskripsi',
                                content: (
                                    <div className="prose max-w-none text-gray-600">
                                        <p>{product.description}</p>
                                        <p className="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                    </div>
                                )
                            },
                            {
                                id: 'specs',
                                label: 'Spesifikasi',
                                content: <ProductSpecs product={product} />
                            },
                            {
                                id: 'reviews',
                                label: `Ulasan (${product.review_count || 0})`,
                                content: (
                                    <div className="text-center py-12 border rounded-lg bg-gray-50">
                                        <p className="text-gray-500">Belum ada ulasan untuk produk ini.</p>
                                    </div>
                                )
                            }
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
