import React from 'react';
import { Link } from 'react-router-dom';

// Export from separate files
export { default as ProductCard } from './ProductCard';
export { default as ProductGrid } from './ProductGrid';
export { default as ProductFilter } from './ProductFilter';

// Inline placeholders/implementations for others
export const ProductList = ({ products }: { products: any[] }) => (
    <div className="space-y-4">
        {products.map((product) => (
            <div key={product.id} className="flex gap-4 p-4 border rounded-lg bg-white">
                <div className="w-32 h-32 bg-gray-100 flex-shrink-0">
                    <img src={product.images?.[0]?.url || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-blue-600 font-bold">Rp {product.price.toLocaleString()}</p>
                </div>
            </div>
        ))}
    </div>
);

export const ProductSort = ({ sortBy, sortOrder, onChange }: any) => (
    <select
        value={`${sortBy}-${sortOrder}`}
        onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            onChange({ sortBy: field, sortOrder: order });
        }}
        className="form-select border-gray-300 rounded-lg text-sm"
    >
        <option value="createdAt-DESC">Terbaru</option>
        <option value="price-ASC">Harga Terendah</option>
        <option value="price-DESC">Harga Tertinggi</option>
        <option value="rating-DESC">Rating Tertinggi</option>
    </select>
);

export const BreadcrumbNav = ({ items }: any) => (
    <nav className="flex text-sm text-gray-500">
        {items.map((item: any, idx: number) => (
            <React.Fragment key={idx}>
                {idx > 0 && <span className="mx-2">/</span>}
                <Link to={item.path} className="hover:text-blue-600">
                    {item.label}
                </Link>
            </React.Fragment>
        ))}
    </nav>
);

export const ProductGallery = ({ images }: any) => (
    <div className="space-y-4">
        <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
            <img src={images?.[0]?.url || '/placeholder.jpg'} alt="Main" className="w-full h-full object-cover" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
            {images?.map((img: any, i: number) => (
                <div key={i} className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded border cursor-pointer">
                    <img src={img.url} className="w-full h-full object-cover" />
                </div>
            ))}
        </div>
    </div>
);

export const ProductSpecs = ({ product }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex justify-between border-b py-2">
            <span className="text-gray-600">Kapasitas</span>
            <span className="font-medium">{product.capacity} kg</span>
        </div>
        <div className="flex justify-between border-b py-2">
            <span className="text-gray-600">Daya</span>
            <span className="font-medium">{product.power || '350'} Watt</span>
        </div>
    </div>
);

export const ProductReviews = () => (
    <div className="text-center py-8 text-gray-500">
        Belum ada ulasan untuk produk ini.
    </div>
);

export const ProductRating = () => null; // Placeholder
