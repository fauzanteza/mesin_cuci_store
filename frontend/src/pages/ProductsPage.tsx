import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productService } from '../services/productService'
import ProductGrid from '../components/Product/ProductGrid'
import ProductFilter from '../components/Product/ProductFilter'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { Filter } from 'lucide-react'
import Button from '../components/UI/Button'

const ProductsPage: React.FC = () => {
    const [showMobileFilter, setShowMobileFilter] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000000])
    const [sortBy, setSortBy] = useState('newest')

    // Construct filters object for the API call
    const filters = useMemo(() => ({
        category: selectedCategory,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sortBy: sortBy,
    }), [selectedCategory, priceRange, sortBy]);

    // Fetch Products
    const { data: productResponse, isLoading: productsLoading } = useQuery({
        queryKey: ['products', filters],
        queryFn: () => productService.getProducts(filters),
    })

    const products = productResponse?.data?.products || [];
    const pagination = productResponse?.data?.pagination;

    // Fetch Categories
    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => productService.getCategories(),
    })

    // Filter and Sort Logic
    const filteredProducts = useMemo(() => {
        let result = [...products]

        // Filter by Category
        if (selectedCategory) {
            result = result.filter(
                (product) => product.category?.slug === selectedCategory
            )
        }
        // Filter by Price
        result = result.filter(
            (product) =>
                product.price >= priceRange[0] && product.price <= priceRange[1]
        )

        // Sort
        switch (sortBy) {
            case 'lowest':
                result.sort((a, b) => a.price - b.price)
                break
            case 'highest':
                result.sort((a, b) => b.price - a.price)
                break
            case 'newest':
                result.sort(
                    (a, b) =>
                        new Date(b.createdAt || '').getTime() -
                        new Date(a.createdAt || '').getTime()
                )
                break
            case 'featured':
                result.sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1))
                break
        }

        return result
    }, [products, selectedCategory, priceRange, sortBy])

    // Clear Filters
    const handleClearFilters = () => {
        setSelectedCategory('')
        setPriceRange([0, 20000000])
        setSortBy('newest')
    }

    if (productsLoading || categoriesLoading) {
        return <LoadingSpinner fullScreen />
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Mobile Filter Toggle */}
                <div className="md:hidden mb-4">
                    <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setShowMobileFilter(!showMobileFilter)}
                        icon={<Filter className="w-4 h-4" />}
                    >
                        Filter & Urutkan
                    </Button>
                </div>

                {/* Sidebar Filter (Desktop) */}
                <aside
                    className={`
                    md:w-64 md:block
                    ${showMobileFilter ? 'block' : 'hidden'}
                `}
                >
                    <div className="sticky top-24">
                        <ProductFilter
                            categories={categories || []}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            priceRange={priceRange}
                            onPriceRangeChange={setPriceRange}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            onClearFilters={handleClearFilters}
                        />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Semua Produk
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({filteredProducts.length} produk)
                            </span>
                        </h1>
                    </div>

                    <ProductGrid products={filteredProducts} />
                </main>
            </div>
        </div>
    )
}

export default ProductsPage
