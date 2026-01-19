import React, { useState } from 'react'
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'

import { addToCart } from '../../store/slices/cartSlice'
import { formatCurrency } from '../../utils/formatters'
import Button from '../UI/Button'
import { Product } from '../../types/product.types'

interface ProductCardProps {
    product: Product
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const {
        id,
        name,
        price,
        compare_price,
        rating,
        review_count,
        images = [],
        brand,
        category,
        features = [],
        stock,
        is_available
    } = product

    const dispatch = useDispatch()
    const [isHovered, setIsHovered] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [localWishlisted, setLocalWishlisted] = useState(false) // Assuming false for now

    const isInStock = stock > 0 && is_available

    // Handle case where specific props might be passed differently or default
    const discount = compare_price && compare_price > price ? Math.round(((compare_price - price) / compare_price) * 100) : 0
    const displayImage = images && images.length > 0 ? images[0].image_url : '/images/placeholder.jpg'

    const handleAddToCart = () => {
        dispatch(
            addToCart({
                id: id,
                name,
                price,
                image: displayImage,
                quantity: 1,
            })
        )
        toast.success('Produk ditambahkan ke keranjang')
    }

    const handleWishlistToggle = () => {
        setLocalWishlisted(!localWishlisted)
        toast.success(
            localWishlisted ? 'Dihapus dari wishlist' : 'Ditambahkan ke wishlist'
        )
    }

    const handleQuickView = () => {
        // Implement quick view modal
        console.log('Quick view:', id)
    }

    return (
        <div
            className="group relative bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {discount > 0 && (
                    <span className="bg-danger-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                        -{discount}%
                    </span>
                )}
                {!isInStock && (
                    <span className="bg-gray-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                        Habis
                    </span>
                )}
                {features && features.includes('Digital Inverter') && (
                    <span className="bg-primary-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                        Hemat Listrik
                    </span>
                )}
            </div>

            {/* Wishlist Button */}
            <button
                onClick={handleWishlistToggle}
                className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            >
                <Heart
                    className={`w-5 h-5 ${localWishlisted ? 'fill-danger-500 text-danger-500' : 'text-gray-400'
                        }`}
                />
            </button>

            {/* Product Image */}
            <div className="relative h-48 md:h-56 overflow-hidden">
                <Link to={`/products/${id}`}>
                    <img
                        src={displayImage}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </Link>

                {/* Quick View Overlay */}
                {isHovered && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300">
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleQuickView}
                                icon={<Eye className="w-4 h-4" />}
                            >
                                View
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleAddToCart}
                                disabled={!isInStock}
                                icon={<ShoppingCart className="w-4 h-4" />}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Category & Brand */}
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {category?.name || 'Mesin Cuci'}
                    </span>
                    <span className="text-xs font-medium text-gray-700">{brand?.name || ''}</span>
                </div>

                {/* Product Name */}
                <Link to={`/products/${id}`}>
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                        {name}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(Number(rating) || 0)
                                    ? 'fill-warning-500 text-warning-500'
                                    : 'text-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">
                        ({Number(rating || 0).toFixed(1)})
                    </span>
                    <span className="text-sm text-gray-400 ml-2">
                        {review_count || 0} reviews
                    </span>
                </div>

                {/* Features */}
                {features && features.length > 0 && (
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                            {features.slice(0, 2).map((feature, index) => (
                                <span
                                    key={index}
                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                >
                                    {feature}
                                </span>
                            ))}
                            {features.length > 2 && (
                                <span className="text-xs text-gray-400">
                                    +{features.length - 2} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-gray-900">
                                {formatCurrency(price)}
                            </span>
                            {compare_price && (
                                <span className="text-sm text-gray-400 line-through">
                                    {formatCurrency(compare_price)}
                                </span>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ProductCard
