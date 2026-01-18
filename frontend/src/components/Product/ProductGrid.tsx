import React from 'react'
import ProductCard from './ProductCard'
import { Product } from '../../types/product.types'

interface ProductGridProps {
    products: Product[]
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Tidak ada produk ditemukan.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}

export default ProductGrid
