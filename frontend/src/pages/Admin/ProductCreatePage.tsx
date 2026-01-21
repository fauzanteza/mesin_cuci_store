import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/Admin/ProductForm';
import { toast } from 'react-hot-toast';
import { uploadService } from '../../services/uploadService';
import { productService } from '../../services/productService';

const ProductCreatePage: React.FC = () => {
    const navigate = useNavigate();

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

    const handleSubmit = async (formData: any, images: File[]) => {
        try {
            // Upload images first
            let uploadedImages: any[] = [];

            if (images.length > 0) {
                const uploadPromises = images.map(file => uploadService.uploadImage(file));
                const results = await Promise.all(uploadPromises);

                // Map results to format expected by backend
                uploadedImages = results.map(res => ({
                    url: res.data.url,
                    publicId: res.data.filename,
                    isPrimary: false
                }));

                // Set first image as primary if exists
                if (uploadedImages.length > 0) {
                    uploadedImages[0].isPrimary = true;
                }
            }

            // Create product payload
            const payload = {
                ...formData,
                images: uploadedImages
            };

            await productService.createProduct(payload);
            toast.success('Product created successfully');
            navigate('/admin/products');
        } catch (error: any) {
            console.error('Create product error:', error);
            toast.error(error.message || 'Failed to create product');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
                <p className="text-gray-600">
                    Add a new product to your store inventory
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm">
                <ProductForm
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/admin/products')}
                    categories={categories}
                    brands={brands}
                />
            </div>
        </div>
    );
};

export default ProductCreatePage;
