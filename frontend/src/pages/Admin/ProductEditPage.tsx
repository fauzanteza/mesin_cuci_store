import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/UI';
import { toast } from 'react-hot-toast';
import ProductForm from '../../components/Admin/ProductForm';

const ProductEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [productData, setProductData] = useState<any>(null);

    const categories = [
        { id: 'cat1', name: 'Front Loading' },
        { id: 'cat2', name: 'Top Loading' },
        { id: 'cat3', name: 'Portable' },
        { id: 'cat4', name: 'Dryer' }
    ];

    const brands = [
        { id: 'brand1', name: 'LG' },
        { id: 'brand2', name: 'Samsung' },
        { id: 'brand3', name: 'Sharp' },
        { id: 'brand4', name: 'Panasonic' },
        { id: 'brand5', name: 'Electrolux' }
    ];

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            // In real app: Fetch product by ID from API
            // Mock data for now
            const mockProduct = {
                name: 'Mesin Cuci LG 8kg Front Loading',
                sku: 'LG-WM-8KG',
                brandId: 'brand1',
                categoryId: 'cat1',
                price: 3500000,
                discountPrice: 3200000,
                stock: 15,
                minimumStock: 10,
                weight: 35,
                dimensions: '60 x 60 x 85 cm',
                warranty: '2 years',
                description: '<p>High-efficiency front loading washing machine with 8kg capacity.</p>',
                shortDescription: 'Front loading washing machine with 8kg capacity',
                specifications: [
                    { key: 'Capacity', value: '8 kg' },
                    { key: 'Type', value: 'Front Loading' },
                    { key: 'Energy Rating', value: 'A+++' },
                    { key: 'Spin Speed', value: '1400 RPM' }
                ],
                features: ['Inverter Technolog', 'Steam Wash', 'Quick Wash', 'Child Lock'],
                tags: ['washing-machine', 'lg', 'front-load', '8kg'],
                status: 'active',
                featured: true,
                newArrival: true
            };

            setProductData(mockProduct);
        } catch (error) {
            toast.error('Failed to load product');
            navigate('/admin/products');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData: any, images: File[]) => {
        try {
            // In real app: API call to update product
            console.log('Updating product:', id, formData, images);
            toast.success('Product updated successfully');
            navigate('/admin/products');
        } catch (error) {
            toast.error('Failed to update product');
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
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-gray-600">
                    Update product information and inventory
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm">
                <ProductForm
                    initialData={productData}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/admin/products')}
                    categories={categories}
                    brands={brands}
                />
            </div>
        </div>
    );
};

export default ProductEditPage;
