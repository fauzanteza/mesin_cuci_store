import React from 'react'
import { Link } from 'react-router-dom'

interface CategoryCardProps {
    id: number
    name: string
    image: string
    productCount?: number
}

const CategoryCard: React.FC<CategoryCardProps> = ({ id, name, image, productCount }) => {
    return (
        <Link to={`/products?category=${id}`} className="group block text-center">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 aspect-square mb-3 border border-gray-100 flex items-center justify-center p-4">
                {/* 
                  Using a placeholder if image is missing or relative path. 
                  In real app, we should handle image loading better.
                */}
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/category-default.jpg'; // Fallback
                    }}
                />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{name}</h3>
            {productCount !== undefined && (
                <p className="text-sm text-gray-500">{productCount} Produk</p>
            )}
        </Link>
    )
}

export default CategoryCard
