import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Shield, Truck, Headphones, Award } from 'lucide-react'

import ProductGrid from '../components/Product/ProductGrid'
import HeroSlider from '../components/Layout/HeroSlider'
import CategoryCard from '../components/Product/CategoryCard'
import FeatureCard from '../components/UI/FeatureCard'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { productService } from '../services/productService'
import Button from '../components/UI/Button'
import { Link } from 'react-router-dom'

const HomePage: React.FC = () => {
    // Fetch featured products
    const { data: featuredProducts, isLoading } = useQuery({
        queryKey: ['featured-products'],
        queryFn: () => productService.getFeaturedProducts(),
    })

    // Fetch categories
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => productService.getCategories(),
    })

    const features = [
        {
            icon: <Shield className="w-8 h-8" />,
            title: 'Garansi Resmi',
            description: 'Semua produk bergaransi resmi 1-2 tahun',
        },
        {
            icon: <Truck className="w-8 h-8" />,
            title: 'Gratis Ongkir',
            description: 'Gratis ongkir untuk pembelian di atas Rp 2 juta',
        },
        {
            icon: <Headphones className="w-8 h-8" />,
            title: 'Support 24/7',
            description: 'Customer service siap membantu kapan saja',
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: 'Original 100%',
            description: 'Barang original dengan kualitas terjamin',
        },
    ]

    return (
        <div className="min-h-screen">
            {/* Hero Slider */}
            <HeroSlider />

            {/* Features Section */}
            <section className="py-8 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <FeatureCard key={index} {...feature} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Kategori Produk</h2>
                            <p className="text-gray-600 mt-2">
                                Temukan mesin cuci sesuai kebutuhan Anda
                            </p>
                        </div>
                        <Button variant="outline" icon={<ArrowRight className="w-4 h-4" />}>
                            <Link to="/products">Lihat Semua</Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {categories?.slice(0, 5).map((category) => (
                            <CategoryCard
                                key={category.id}
                                id={category.id}
                                name={category.name}
                                image={category.image || '/images/category-default.jpg'}
                                productCount={category.productCount}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Produk Unggulan</h2>
                            <p className="text-gray-600 mt-2">
                                Mesin cuci terbaik dengan teknologi terkini
                            </p>
                        </div>
                        <Button variant="outline" icon={<ArrowRight className="w-4 h-4" />}>
                            <Link to="/products">Lihat Semua</Link>
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : (
                        <ProductGrid products={featuredProducts || []} />
                    )}
                </div>
            </section>

            {/* Promo Banner */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 md:p-12">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="text-white mb-6 md:mb-0">
                                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                                    Diskon Akhir Tahun Hingga 30%
                                </h3>
                                <p className="text-primary-100">
                                    Beli sekarang dan dapatkan harga spesial!
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                size="lg"
                                className="bg-white text-primary-600 hover:bg-gray-100"
                            >
                                <Link to="/products">Belanja Sekarang</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Apa Kata Pelanggan Kami
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-shadow"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                                    <div>
                                        <h4 className="font-semibold">Budi Santoso</h4>
                                        <p className="text-sm text-gray-500">Jakarta</p>
                                    </div>
                                </div>
                                <p className="text-gray-600">
                                    "Mesin cuci Samsung yang saya beli sangat bagus, hemat listrik
                                    dan cucian bersih. Pelayanan cepat dan packing aman."
                                </p>
                                <div className="flex mt-4">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className="w-5 h-5 text-warning-500 fill-current"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePage
