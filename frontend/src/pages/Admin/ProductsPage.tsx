import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Input,
    Select,
    Modal,
    LoadingSpinner,
    Card,
    Badge
} from '../../components/UI';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/Admin/DataTable';
import ProductForm from '../../components/Admin/ProductForm';
// import adminService from '../../services/adminService'; // Not yet used
// import productService from '../../services/productService'; // Not yet used
// import { useAuth } from '../../hooks/useAuth';

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    discountPrice?: number;
    stock: number;
    status: 'active' | 'inactive' | 'draft';
    category: string;
    brand: string;
    featured: boolean;
    newArrival: boolean;
    createdAt: string;
    soldCount: number;
}

const AdminProductsPage: React.FC = () => {
    const navigate = useNavigate();
    // const { user } = useAuth(); // Commenting out to fix lint error if useAuth is not fully implemented or user unused

    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [bulkAction, setBulkAction] = useState('');

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [brandFilter, setBrandFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    // Mock data for categories and brands
    const [categories] = useState([
        { id: 'cat1', name: 'Front Loading' },
        { id: 'cat2', name: 'Top Loading' },
        { id: 'cat3', name: 'Portable' },
        { id: 'cat4', name: 'Dryer' }
    ]);

    const [brands] = useState([
        { id: 'brand1', name: 'LG' },
        { id: 'brand2', name: 'Samsung' },
        { id: 'brand3', name: 'Sharp' },
        { id: 'brand4', name: 'Panasonic' },
        { id: 'brand5', name: 'Electrolux' }
    ]);

    useEffect(() => {
        // if (user?.role !== 'admin') {
        //   navigate('/');
        //   return;
        // }

        loadProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, searchQuery, statusFilter, categoryFilter, brandFilter, sortBy]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            // Mock data - in real app, fetch from API
            const mockProducts: Product[] = [
                {
                    id: '1',
                    name: 'Mesin Cuci LG 8kg Front Loading',
                    sku: 'LG-WM-8KG',
                    price: 3500000,
                    discountPrice: 3200000,
                    stock: 15,
                    status: 'active',
                    category: 'Front Loading',
                    brand: 'LG',
                    featured: true,
                    newArrival: true,
                    createdAt: '2024-01-15',
                    soldCount: 42
                },
                {
                    id: '2',
                    name: 'Mesin Cuci Samsung 10kg Top Loading',
                    sku: 'SS-WM-10KG',
                    price: 4500000,
                    discountPrice: 4200000,
                    stock: 8,
                    status: 'active',
                    category: 'Top Loading',
                    brand: 'Samsung',
                    featured: true,
                    newArrival: false,
                    createdAt: '2024-01-10',
                    soldCount: 28
                },
                {
                    id: '3',
                    name: 'Mesin Cuci Sharp 7kg Portable',
                    sku: 'SH-WM-7KG',
                    price: 2500000,
                    discountPrice: 2300000,
                    stock: 0,
                    status: 'inactive',
                    category: 'Portable',
                    brand: 'Sharp',
                    featured: false,
                    newArrival: false,
                    createdAt: '2024-01-05',
                    soldCount: 15
                },
                {
                    id: '4',
                    name: 'Mesin Cuci Panasonic 9kg',
                    sku: 'PN-WM-9KG',
                    price: 3800000,
                    stock: 22,
                    status: 'active',
                    category: 'Top Loading',
                    brand: 'Panasonic',
                    featured: false,
                    newArrival: true,
                    createdAt: '2024-02-01',
                    soldCount: 8
                },
                {
                    id: '5',
                    name: 'Dryer Electrolux 8kg',
                    sku: 'EL-DR-8KG',
                    price: 5200000,
                    discountPrice: 4800000,
                    stock: 5,
                    status: 'active',
                    category: 'Dryer',
                    brand: 'Electrolux',
                    featured: true,
                    newArrival: false,
                    createdAt: '2024-01-20',
                    soldCount: 12
                }
            ];

            setProducts(mockProducts);
            setFilteredProducts(mockProducts);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = [...products];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.sku.toLowerCase().includes(query) ||
                product.brand.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(product => product.status === statusFilter);
        }

        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(product => product.category === categoryFilter);
        }

        // Brand filter
        if (brandFilter !== 'all') {
            filtered = filtered.filter(product => product.brand === brandFilter);
        }

        // Sort
        switch (sortBy) {
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price_low':
                filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
                break;
            case 'price_high':
                filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
                break;
            case 'stock_low':
                filtered.sort((a, b) => a.stock - b.stock);
                break;
            case 'sold_high':
                filtered.sort((a, b) => b.soldCount - a.soldCount);
                break;
            default: // newest
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setFilteredProducts(filtered);
    };

    const handleSaveProduct = async (formData: any, _images: File[]) => {
        try {
            // In real app: Call API to save product
            if (editingProduct) {
                // Update existing product
                setProducts(prev => prev.map(p =>
                    p.id === editingProduct.id
                        ? { ...p, ...formData }
                        : p
                ));
                toast.success('Product updated successfully');
            } else {
                // Add new product
                const newProduct: Product = {
                    id: Date.now().toString(),
                    name: formData.name,
                    sku: formData.sku,
                    price: formData.price,
                    discountPrice: formData.discountPrice,
                    stock: formData.stock,
                    status: formData.status,
                    category: categories.find(c => c.id === formData.categoryId)?.name || 'Uncategorized',
                    brand: brands.find(b => b.id === formData.brandId)?.name || 'Unknown',
                    featured: formData.featured,
                    newArrival: formData.newArrival,
                    createdAt: new Date().toISOString().split('T')[0],
                    soldCount: 0
                };

                setProducts(prev => [newProduct, ...prev]);
                toast.success('Product created successfully');
            }

            setShowForm(false);
            setEditingProduct(null);
        } catch (error) {
            toast.error('Failed to save product');
        }
    };

    const handleDeleteProduct = async () => {
        if (!selectedProduct) return;

        try {
            setProducts(prev => prev.filter(p => p.id !== selectedProduct));
            toast.success('Product deleted successfully');
            setShowDeleteModal(false);
            setSelectedProduct(null);
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handleBulkAction = async () => {
        if (selectedRows.length === 0 || !bulkAction) {
            toast.error('Please select products and an action');
            return;
        }

        try {
            switch (bulkAction) {
                case 'activate':
                    setProducts(prev => prev.map(p =>
                        selectedRows.includes(p.id) ? { ...p, status: 'active' } : p
                    ));
                    toast.success(`${selectedRows.length} products activated`);
                    break;
                case 'deactivate':
                    setProducts(prev => prev.map(p =>
                        selectedRows.includes(p.id) ? { ...p, status: 'inactive' } : p
                    ));
                    toast.success(`${selectedRows.length} products deactivated`);
                    break;
                case 'delete':
                    if (window.confirm(`Delete ${selectedRows.length} products?`)) {
                        setProducts(prev => prev.filter(p => !selectedRows.includes(p.id)));
                        toast.success(`${selectedRows.length} products deleted`);
                    }
                    break;
                case 'feature':
                    setProducts(prev => prev.map(p =>
                        selectedRows.includes(p.id) ? { ...p, featured: true } : p
                    ));
                    toast.success(`${selectedRows.length} products featured`);
                    break;
                case 'unfeature':
                    setProducts(prev => prev.map(p =>
                        selectedRows.includes(p.id) ? { ...p, featured: false } : p
                    ));
                    toast.success(`${selectedRows.length} products unfeatured`);
                    break;
            }

            setSelectedRows([]);
            setBulkAction('');
        } catch (error) {
            toast.error('Failed to perform bulk action');
        }
    };

    const handleExport = async () => {
        try {
            // In real app: Export products to CSV/Excel
            toast.success('Export feature will be implemented soon');
        } catch (error) {
            toast.error('Failed to export products');
        }
    };

    const handleImport = async () => {
        try {
            // In real app: Import products from CSV/Excel
            toast.success('Import feature will be implemented soon');
        } catch (error) {
            toast.error('Failed to import products');
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Product',
            render: (value: string, row: Product) => (
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3 flex-shrink-0"></div>
                    <div>
                        <div className="font-medium">{value}</div>
                        <div className="text-xs text-gray-500">{row.sku}</div>
                    </div>
                </div>
            ),
            sortable: true,
            width: '300px'
        },
        {
            key: 'category',
            header: 'Category',
            sortable: true
        },
        {
            key: 'brand',
            header: 'Brand',
            sortable: true
        },
        {
            key: 'price',
            header: 'Price',
            render: (value: number, row: Product) => (
                <div>
                    {row.discountPrice ? (
                        <>
                            <div className="text-gray-400 line-through text-sm">
                                Rp {value.toLocaleString('id-ID')}
                            </div>
                            <div className="font-medium text-green-600">
                                Rp {row.discountPrice.toLocaleString('id-ID')}
                            </div>
                        </>
                    ) : (
                        <div className="font-medium">
                            Rp {value.toLocaleString('id-ID')}
                        </div>
                    )}
                </div>
            ),
            sortable: true
        },
        {
            key: 'stock',
            header: 'Stock',
            render: (value: number) => (
                <div className={value === 0 ? 'text-red-600 font-medium' : ''}>
                    {value}
                    {value === 0 && <Badge variant="danger" className="ml-2">Out of Stock</Badge>}
                </div>
            ),
            sortable: true
        },
        {
            key: 'status',
            header: 'Status',
            render: (value: string) => (
                <Badge variant={
                    value === 'active' ? 'success' :
                        value === 'inactive' ? 'danger' : 'warning'
                }>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'featured',
            header: 'Featured',
            render: (value: boolean) => (
                <div className="flex items-center gap-2">
                    {value ? (
                        <i className="fas fa-star text-yellow-500"></i>
                    ) : (
                        <i className="far fa-star text-gray-300"></i>
                    )}
                    {value && <Badge variant="primary">Featured</Badge>}
                </div>
            )
        }
    ];

    const actions = (row: Product) => (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/products/${row.id}`)}
                icon="eye"
                title="View"
            />
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    setEditingProduct(row);
                    setShowForm(true);
                }}
                icon="edit"
                title="Edit"
            />
            <Button
                variant="danger"
                size="sm"
                onClick={() => {
                    setSelectedProduct(row.id);
                    setShowDeleteModal(true);
                }}
                icon="trash"
                title="Delete"
            />
        </>
    );

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
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                        <p className="text-gray-600">
                            Manage your products inventory and listings
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            icon="download"
                        >
                            Export
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleImport}
                            icon="upload"
                        >
                            Import
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setShowForm(true)}
                            icon="plus"
                        >
                            Add Product
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters & Stats */}
            <Card className="p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon="search"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { value: "all", label: "All Status" },
                                { value: "active", label: "Active" },
                                { value: "inactive", label: "Inactive" },
                                { value: "draft", label: "Draft" }
                            ]}
                        />
                    </div>

                    {/* Category Filter */}
                    <div>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            options={[
                                { value: "all", label: "All Categories" },
                                ...categories.map(c => ({ value: c.name, label: c.name }))
                            ]}
                        />
                    </div>

                    {/* Brand Filter */}
                    <div>
                        <Select
                            value={brandFilter}
                            onChange={(e) => setBrandFilter(e.target.value)}
                            options={[
                                { value: "all", label: "All Brands" },
                                ...brands.map(b => ({ value: b.name, label: b.name }))
                            ]}
                        />
                    </div>
                </div>

                {/* Sort & Bulk Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-48"
                            options={[
                                { value: "newest", label: "Sort by: Newest" },
                                { value: "name", label: "Sort by: Name A-Z" },
                                { value: "price_low", label: "Sort by: Price Low-High" },
                                { value: "price_high", label: "Sort by: Price High-Low" },
                                { value: "stock_low", label: "Sort by: Stock Low-High" },
                                { value: "sold_high", label: "Sort by: Most Sold" }
                            ]}
                        />

                        <span className="text-sm text-gray-600">
                            {filteredProducts.length} products found
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedRows.length > 0 && (
                            <>
                                <Select
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                    // placeholder="Bulk Actions" 
                                    className="w-40"
                                    options={[
                                        { value: "", label: "Bulk Actions" },
                                        { value: "activate", label: "Activate" },
                                        { value: "deactivate", label: "Deactivate" },
                                        { value: "feature", label: "Mark as Featured" },
                                        { value: "unfeature", label: "Remove Featured" },
                                        { value: "delete", label: "Delete" }
                                    ]}
                                />
                                <Button
                                    variant="primary"
                                    onClick={handleBulkAction}
                                    disabled={!bulkAction}
                                >
                                    Apply
                                </Button>
                                <span className="text-sm text-gray-600">
                                    {selectedRows.length} selected
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </Card>

            {/* Products Table */}
            <DataTable
                columns={columns}
                data={filteredProducts}
                actions={actions}
                selectable
                searchable={false}
                pagination
                onSelectionChange={setSelectedRows}
            />

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {products.filter(p => p.status === 'active').length}
                        </div>
                        <div className="text-sm text-gray-600">Active Products</div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {products.filter(p => p.featured).length}
                        </div>
                        <div className="text-sm text-gray-600">Featured Products</div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {products.filter(p => p.stock === 0).length}
                        </div>
                        <div className="text-sm text-gray-600">Out of Stock</div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {products.filter(p => p.newArrival).length}
                        </div>
                        <div className="text-sm text-gray-600">New Arrivals</div>
                    </div>
                </Card>
            </div>

            {/* Product Form Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                }}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
                size="full"
            >
                <div className="max-h-[80vh] overflow-y-auto p-1">
                    <ProductForm
                        initialData={editingProduct ? {
                            name: editingProduct.name,
                            sku: editingProduct.sku,
                            brandId: brands.find(b => b.name === editingProduct.brand)?.id || '',
                            categoryId: categories.find(c => c.name === editingProduct.category)?.id || '',
                            price: editingProduct.price,
                            discountPrice: editingProduct.discountPrice,
                            stock: editingProduct.stock,
                            minimumStock: 10,
                            weight: 0,
                            dimensions: '',
                            warranty: '1 year',
                            description: 'Product description...',
                            shortDescription: 'Short description...',
                            specifications: [],
                            features: [],
                            tags: [],
                            status: editingProduct.status,
                            featured: editingProduct.featured,
                            newArrival: editingProduct.newArrival
                        } : undefined}
                        onSubmit={handleSaveProduct}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingProduct(null);
                        }}
                        categories={categories}
                        brands={brands}
                        loading={false}
                    />
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
                }}
                title="Delete Product"
            >
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-bold mb-2">Delete Product?</h3>
                        <p className="text-gray-600">
                            This action cannot be undone. All product data will be permanently deleted.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setSelectedProduct(null);
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteProduct}
                            className="flex-1"
                        >
                            Delete Product
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminProductsPage;
