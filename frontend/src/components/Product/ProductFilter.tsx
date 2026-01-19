import React from 'react'

interface Category {
    id: number
    name: string
    slug: string
}

interface ProductFilterProps {
    categories: Category[]
    selectedCategory: string
    onCategoryChange: (category: string) => void
    priceRange: [number, number]
    onPriceRangeChange: (range: [number, number]) => void
    sortBy: string
    onSortChange: (sort: string) => void
    onClearFilters: () => void
}

const ProductFilter: React.FC<ProductFilterProps> = ({
    categories,
    selectedCategory,
    onCategoryChange,
    priceRange,
    onPriceRangeChange,
    sortBy,
    onSortChange,
    onClearFilters,
}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Filter</h3>
                <button
                    onClick={onClearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                    Reset
                </button>
            </div>

            {/* Sort */}
            <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Urutkan</h4>
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm"
                >
                    <option value="newest">Terbaru</option>
                    <option value="lowest">Harga Terendah</option>
                    <option value="highest">Harga Tertinggi</option>
                    <option value="featured">Unggulan</option>
                </select>
            </div>

            {/* Categories */}
            <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Kategori</h4>
                <div className="space-y-2">
                    <label className="flex items-center group cursor-pointer">
                        <input
                            type="radio"
                            name="category"
                            value=""
                            checked={selectedCategory === ''}
                            onChange={() => onCategoryChange('')}
                            className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-600 group-hover:text-primary-600 transition-colors">
                            Semua Kategori
                        </span>
                    </label>
                    {categories.map((category) => (
                        <label key={category.id} className="flex items-center group cursor-pointer">
                            <input
                                type="radio"
                                name="category"
                                value={category.slug}
                                checked={selectedCategory === category.slug}
                                onChange={() => onCategoryChange(category.slug)}
                                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-600 group-hover:text-primary-600 transition-colors">
                                {category.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Rentang Harga</h4>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Minimum</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                Rp
                            </span>
                            <input
                                type="number"
                                value={priceRange[0]}
                                onChange={(e) =>
                                    onPriceRangeChange([
                                        parseInt(e.target.value) || 0,
                                        priceRange[1],
                                    ])
                                }
                                className="w-full pl-9 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Maksimum</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                Rp
                            </span>
                            <input
                                type="number"
                                value={priceRange[1]}
                                onChange={(e) =>
                                    onPriceRangeChange([
                                        priceRange[0],
                                        parseInt(e.target.value) || 0,
                                    ])
                                }
                                className="w-full pl-9 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductFilter
