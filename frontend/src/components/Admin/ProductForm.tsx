import React, { useState, useEffect } from 'react';
import { Button, Input, Select, FileUploader } from '../UI';
import { toast } from 'react-hot-toast';
import { RichTextEditor } from '../Shared';

interface ProductFormData {
    name: string;
    sku: string;
    brandId: string;
    categoryId: string;
    price: number;
    discountPrice?: number;
    stock: number;
    minimumStock: number;
    weight: number;
    dimensions: string;
    warranty: string;
    description: string;
    shortDescription: string;
    specifications: Array<{ key: string; value: string }>;
    features: string[];
    tags: string[];
    status: 'active' | 'inactive' | 'draft';
    featured: boolean;
    newArrival: boolean;
}

interface ProductFormProps {
    initialData?: ProductFormData;
    onSubmit: (data: ProductFormData, images: File[]) => void;
    onCancel: () => void;
    categories: Array<{ id: string; name: string }>;
    brands: Array<{ id: string; name: string }>;
    loading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    categories,
    brands,
    loading = false
}) => {
    const [formData, setFormData] = useState<ProductFormData>({
        name: initialData?.name || '',
        sku: initialData?.sku || '',
        brandId: initialData?.brandId || '',
        categoryId: initialData?.categoryId || '',
        price: initialData?.price || 0,
        discountPrice: initialData?.discountPrice,
        stock: initialData?.stock || 0,
        minimumStock: initialData?.minimumStock || 10,
        weight: initialData?.weight || 0,
        dimensions: initialData?.dimensions || '',
        warranty: initialData?.warranty || '1 year',
        description: initialData?.description || '',
        shortDescription: initialData?.shortDescription || '',
        specifications: initialData?.specifications || [{ key: '', value: '' }],
        features: initialData?.features || [],
        tags: initialData?.tags || [],
        status: initialData?.status || 'draft',
        featured: initialData?.featured || false,
        newArrival: initialData?.newArrival || false
    });

    const [images, setImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [specKey, setSpecKey] = useState('');
    const [specValue, setSpecValue] = useState('');
    const [featureInput, setFeatureInput] = useState('');
    const [tagInput, setTagInput] = useState('');

    // Load existing images if editing
    useEffect(() => {
        if (initialData) {
            // In real app, load existing images from API
            // setExistingImages(initialData.images || []);
            setExistingImages([]); // Placeholder
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : type === 'number'
                    ? parseFloat(value) || 0
                    : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddSpecification = () => {
        if (specKey.trim() && specValue.trim()) {
            setFormData(prev => ({
                ...prev,
                specifications: [...prev.specifications, { key: specKey.trim(), value: specValue.trim() }]
            }));
            setSpecKey('');
            setSpecValue('');
        }
    };

    const handleRemoveSpecification = (index: number) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index)
        }));
    };

    const handleAddFeature = () => {
        if (featureInput.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, featureInput.trim()]
            }));
            setFeatureInput('');
        }
    };

    const handleRemoveFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleAddTag = () => {
        if (tagInput.trim()) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = async (files: File[] | File) => {
        const fileArray = Array.isArray(files) ? files : [files];
        setImages(prev => [...prev, ...fileArray]);
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
        if (!formData.categoryId) newErrors.categoryId = 'Category is required';
        if (!formData.brandId) newErrors.brandId = 'Brand is required';
        if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
        if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';
        if (formData.minimumStock < 0) newErrors.minimumStock = 'Minimum stock cannot be negative';
        if (formData.discountPrice && formData.discountPrice >= formData.price) {
            newErrors.discountPrice = 'Discount price must be less than regular price';
        }
        if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (existingImages.length === 0 && images.length === 0) {
            newErrors.images = 'At least one image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        onSubmit(formData, images);
    };

    const generateSKU = () => {
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const sku = `PROD-${random}`;
        setFormData(prev => ({ ...prev, sku }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Name */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
                        </label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter product name"
                            error={errors.name}
                            required
                        />
                    </div>

                    {/* SKU */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                SKU *
                            </label>
                            <button
                                type="button"
                                onClick={generateSKU}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Generate SKU
                            </button>
                        </div>
                        <Input
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            placeholder="PROD-ABC123"
                            error={errors.sku}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <Select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            error={errors.categoryId}
                            required
                            options={[
                                { value: "", label: "Select Category" },
                                ...categories.map(c => ({ value: c.id, label: c.name }))
                            ]}
                        />
                    </div>

                    {/* Brand */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Brand *
                        </label>
                        <Select
                            name="brandId"
                            value={formData.brandId}
                            onChange={handleChange}
                            error={errors.brandId}
                            required
                            options={[
                                { value: "", label: "Select Brand" },
                                ...brands.map(b => ({ value: b.id, label: b.name }))
                            ]}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status *
                        </label>
                        <Select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                            options={[
                                { value: "draft", label: "Draft" },
                                { value: "active", label: "Active" },
                                { value: "inactive", label: "Inactive" }
                            ]}
                        />
                    </div>

                    {/* Flags */}
                    <div className="flex items-center gap-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="newArrival"
                                checked={formData.newArrival}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">New Arrival</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Pricing & Stock</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price (Rp) *
                        </label>
                        <Input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            step="1000"
                            error={errors.price}
                            required
                        />
                    </div>

                    {/* Discount Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discount Price (Rp)
                        </label>
                        <Input
                            type="number"
                            name="discountPrice"
                            value={formData.discountPrice || ''}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            step="1000"
                            error={errors.discountPrice}
                        />
                        {formData.discountPrice && formData.price > 0 && (
                            <p className="text-sm text-green-600 mt-2">
                                Discount: {Math.round((1 - formData.discountPrice / formData.price) * 100)}%
                            </p>
                        )}
                    </div>

                    {/* Stock */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Quantity *
                        </label>
                        <Input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            error={errors.stock}
                            required
                        />
                    </div>

                    {/* Minimum Stock */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Stock
                        </label>
                        <Input
                            type="number"
                            name="minimumStock"
                            value={formData.minimumStock}
                            onChange={handleChange}
                            placeholder="10"
                            min="0"
                            error={errors.minimumStock}
                        />
                    </div>

                    {/* Weight */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weight (kg)
                        </label>
                        <Input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            step="0.1"
                        />
                    </div>

                    {/* Dimensions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dimensions (cm)
                        </label>
                        <Input
                            name="dimensions"
                            value={formData.dimensions}
                            onChange={handleChange}
                            placeholder="L x W x H"
                        />
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Description</h3>

                <div className="space-y-6">
                    {/* Short Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Short Description *
                        </label>
                        <textarea
                            name="shortDescription"
                            value={formData.shortDescription}
                            onChange={handleChange}
                            placeholder="Brief description for product listings"
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.shortDescription ? 'border-red-500' : 'border-gray-300'}`}
                            required
                        />
                        {errors.shortDescription && <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>}
                        <p className="text-xs text-gray-500 mt-2">
                            Maximum 200 characters
                        </p>
                    </div>

                    {/* Full Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Description *
                        </label>
                        <RichTextEditor
                            value={formData.description}
                            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                            placeholder="Detailed product description..."
                            error={errors.description}
                        />
                    </div>
                </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Specifications</h3>

                <div className="space-y-4">
                    {/* Existing Specifications */}
                    {formData.specifications.map((spec, index) => (
                        <div key={index} className="flex gap-3 items-center">
                            <div className="flex-1">
                                <Input
                                    value={spec.key}
                                    onChange={(e) => {
                                        const newSpecs = [...formData.specifications];
                                        newSpecs[index].key = e.target.value;
                                        setFormData(prev => ({ ...prev, specifications: newSpecs }));
                                    }}
                                    placeholder="Specification name"
                                />
                            </div>
                            <div className="flex-1">
                                <Input
                                    value={spec.value}
                                    onChange={(e) => {
                                        const newSpecs = [...formData.specifications];
                                        newSpecs[index].value = e.target.value;
                                        setFormData(prev => ({ ...prev, specifications: newSpecs }));
                                    }}
                                    placeholder="Specification value"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveSpecification(index)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    ))}

                    {/* Add New Specification */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                value={specKey}
                                onChange={(e) => setSpecKey(e.target.value)}
                                placeholder="New specification name"
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                value={specValue}
                                onChange={(e) => setSpecValue(e.target.value)}
                                placeholder="New specification value"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddSpecification}
                            icon="plus"
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Features</h3>

                <div className="space-y-4">
                    {/* Features List */}
                    <div className="flex flex-wrap gap-2">
                        {formData.features.map((feature, index) => (
                            <div
                                key={index}
                                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                            >
                                <span>{feature}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFeature(index)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <i className="fas fa-times text-xs"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add Feature */}
                    <div className="flex gap-3">
                        <Input
                            value={featureInput}
                            onChange={(e) => setFeatureInput(e.target.value)}
                            placeholder="Enter feature"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddFeature}
                            icon="plus"
                        >
                            Add Feature
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Tags</h3>

                <div className="space-y-4">
                    {/* Tags List */}
                    <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                            <div
                                key={index}
                                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                            >
                                <span>{tag}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(index)}
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    <i className="fas fa-times text-xs"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add Tag */}
                    <div className="flex gap-3">
                        <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="Enter tag"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddTag}
                            icon="plus"
                        >
                            Add Tag
                        </Button>
                    </div>
                </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Product Images</h3>

                {errors.images && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                        {errors.images}
                    </div>
                )}

                {/* Existing Images */}
                {existingImages.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3">Current Images</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {existingImages.map((image, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={image}
                                        alt={`Product ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(index)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                                    >
                                        <i className="fas fa-times text-xs"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Image Upload */}
                <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">Upload New Images</h4>
                    <FileUploader
                        onUpload={handleImageUpload}
                        accept="image/*"
                        maxSize={5 * 1024 * 1024}
                        multiple={true}
                    >
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                            <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                            <p className="text-gray-600 mb-2">Drop images here or click to browse</p>
                            <p className="text-sm text-gray-500">
                                JPG, PNG, WebP up to 5MB each
                            </p>
                        </div>
                    </FileUploader>
                </div>

                {/* Preview Uploaded Images */}
                {images.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-700 mb-3">
                            New Images ({images.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {images.map((image, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={`Upload ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                                    >
                                        <i className="fas fa-times text-xs"></i>
                                    </button>
                                    <div className="absolute bottom-2 left-2 right-2">
                                        <div className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                                            {image.name}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                >
                    {initialData ? 'Update Product' : 'Create Product'}
                </Button>
            </div>
        </form>
    );
};

export default ProductForm;
