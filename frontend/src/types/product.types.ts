export interface Product {
    id: string
    name: string
    slug: string
    sku: string
    description?: string
    short_description?: string
    price: number
    compare_price?: number
    cost?: number
    stock: number
    low_stock_threshold?: number
    is_available: boolean
    is_featured: boolean
    rating: number
    review_count: number
    category_id: number
    brand_id?: number
    specifications?: Record<string, any>
    features?: string[]
    warranty_months?: number
    weight_kg?: number
    dimensions?: {
        length: number
        width: number
        height: number
    }
    seo_title?: string
    seo_description?: string
    seo_keywords?: string
    created_at: string
    updated_at: string
    category?: Category
    brand?: Brand
    images?: ProductImage[]
    variants?: ProductVariant[]
}

export interface Category {
    id: number
    name: string
    slug: string
    description?: string
    image?: string
    parent_id?: number
    productCount?: number
}

export interface Brand {
    id: number
    name: string
    slug: string
    description?: string
    logo?: string
}

export interface ProductImage {
    id: number
    product_id: number
    image_url: string
    alt_text?: string
    is_primary: boolean
    sort_order: number
}

export interface ProductVariant {
    id: string
    product_id: number
    variant_name: string
    variant_value: string
    sku: string
    price?: number
    stock: number
}

export interface ProductListResponse {
    success: boolean
    data: {
        products: Product[]
        pagination: {
            page: number
            limit: number
            total: number
            totalPages: number
            hasNext: boolean
            hasPrev: boolean
        }
    }
}

export interface ProductFilter {
    category?: string | string[]
    brand?: string | string[]
    min_price?: number
    max_price?: number
    sort?: string
    page?: number
    limit?: number
    search?: string
}

export interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}

export interface CartItem {
    id: string
    product: Product
    quantity: number
    addedAt: string
}
