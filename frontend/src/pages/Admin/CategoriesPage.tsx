import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Button,
    Input,
    Modal,
    LoadingSpinner,
    Card,
    Badge
} from '../../components/UI';
import DataTable from '../../components/Admin/DataTable';
import adminService from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    parentName?: string;
    image?: string;
    icon?: string;
    sortOrder: number;
    isActive: boolean;
    isFeatured: boolean;
    productCount: number;
    createdAt: string;
    updatedAt: string;
    children?: Category[];
    level: number;
}

const AdminCategoriesPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    // Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReorderModal, setShowReorderModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [actionLoading, setActionLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parentId: '',
        image: '',
        icon: '',
        sortOrder: 0,
        isActive: true,
        isFeatured: false
    });

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');

    useEffect(() => {
        if (user?.role !== 'admin') {
            // navigate('/'); 
        }
        loadCategories();
    }, [user]);

    useEffect(() => {
        filterCategories();
    }, [categories, searchQuery, statusFilter]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            // Mock data - in real app, fetch from API
            const mockCategories: Category[] = [
                {
                    id: '1',
                    name: 'Mesin Cuci',
                    slug: 'mesin-cuci',
                    description: 'Berbagai jenis mesin cuci front loading, top loading, dan portable',
                    parentId: '',
                    image: '/images/categories/washing-machine.jpg',
                    icon: 'washer',
                    sortOrder: 1,
                    isActive: true,
                    isFeatured: true,
                    productCount: 45,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-02-15',
                    level: 0,
                    children: [
                        {
                            id: '2',
                            name: 'Front Loading',
                            slug: 'front-loading',
                            description: 'Mesin cuci front loading hemat air dan energi',
                            parentId: '1',
                            parentName: 'Mesin Cuci',
                            image: '/images/categories/front-loading.jpg',
                            icon: 'arrow-down',
                            sortOrder: 1,
                            isActive: true,
                            isFeatured: true,
                            productCount: 25,
                            createdAt: '2024-01-01',
                            updatedAt: '2024-02-10',
                            level: 1,
                            children: [
                                {
                                    id: '3',
                                    name: '8-9 kg',
                                    slug: 'front-loading-8-9kg',
                                    description: 'Kapasitas 8-9 kg untuk keluarga kecil',
                                    parentId: '2',
                                    parentName: 'Front Loading',
                                    image: '',
                                    icon: 'weight',
                                    sortOrder: 1,
                                    isActive: true,
                                    isFeatured: false,
                                    productCount: 12,
                                    createdAt: '2024-01-01',
                                    updatedAt: '2024-02-01',
                                    level: 2,
                                    children: []
                                },
                                {
                                    id: '4',
                                    name: '10-12 kg',
                                    slug: 'front-loading-10-12kg',
                                    description: 'Kapasitas 10-12 kg untuk keluarga besar',
                                    parentId: '2',
                                    parentName: 'Front Loading',
                                    image: '',
                                    icon: 'weight',
                                    sortOrder: 2,
                                    isActive: true,
                                    isFeatured: true,
                                    productCount: 13,
                                    createdAt: '2024-01-01',
                                    updatedAt: '2024-02-05',
                                    level: 2,
                                    children: []
                                }
                            ]
                        },
                        {
                            id: '5',
                            name: 'Top Loading',
                            slug: 'top-loading',
                            description: 'Mesin cuci top loading mudah penggunaan',
                            parentId: '1',
                            parentName: 'Mesin Cuci',
                            image: '/images/categories/top-loading.jpg',
                            icon: 'arrow-up',
                            sortOrder: 2,
                            isActive: true,
                            isFeatured: false,
                            productCount: 15,
                            createdAt: '2024-01-01',
                            updatedAt: '2024-02-08',
                            level: 1,
                            children: []
                        },
                        {
                            id: '6',
                            name: 'Portable',
                            slug: 'portable',
                            description: 'Mesin cuci portable praktis dan ringkas',
                            parentId: '1',
                            parentName: 'Mesin Cuci',
                            image: '/images/categories/portable.jpg',
                            icon: 'truck-loading',
                            sortOrder: 3,
                            isActive: true,
                            isFeatured: false,
                            productCount: 5,
                            createdAt: '2024-01-01',
                            updatedAt: '2024-01-20',
                            level: 1,
                            children: []
                        }
                    ]
                },
                {
                    id: '7',
                    name: 'Dryer',
                    slug: 'dryer',
                    description: 'Mesin pengering pakaian berbagai tipe',
                    parentId: '',
                    image: '/images/categories/dryer.jpg',
                    icon: 'wind',
                    sortOrder: 2,
                    isActive: true,
                    isFeatured: true,
                    productCount: 18,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-02-12',
                    level: 0,
                    children: [
                        {
                            id: '8',
                            name: 'Electric Dryer',
                            slug: 'electric-dryer',
                            description: 'Dryer listrik hemat energi',
                            parentId: '7',
                            parentName: 'Dryer',
                            image: '',
                            icon: 'bolt',
                            sortOrder: 1,
                            isActive: true,
                            isFeatured: true,
                            productCount: 10,
                            createdAt: '2024-01-01',
                            updatedAt: '2024-02-10',
                            level: 1,
                            children: []
                        },
                        {
                            id: '9',
                            name: 'Gas Dryer',
                            slug: 'gas-dryer',
                            description: 'Dryer gas lebih ekonomis',
                            parentId: '7',
                            parentName: 'Dryer',
                            image: '',
                            icon: 'fire',
                            sortOrder: 2,
                            isActive: true,
                            isFeatured: false,
                            productCount: 8,
                            createdAt: '2024-01-01',
                            updatedAt: '2024-01-15',
                            level: 1,
                            children: []
                        }
                    ]
                },
                {
                    id: '10',
                    name: 'Spare Parts',
                    slug: 'spare-parts',
                    description: 'Suku cadang dan aksesoris mesin cuci',
                    parentId: '',
                    image: '/images/categories/spare-parts.jpg',
                    icon: 'cogs',
                    sortOrder: 3,
                    isActive: true,
                    isFeatured: false,
                    productCount: 32,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-02-14',
                    level: 0,
                    children: []
                },
                {
                    id: '11',
                    name: 'Inactive Category',
                    slug: 'inactive-category',
                    description: 'Kategori tidak aktif',
                    parentId: '',
                    image: '',
                    icon: 'ban',
                    sortOrder: 4,
                    isActive: false,
                    isFeatured: false,
                    productCount: 0,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01',
                    level: 0,
                    children: []
                }
            ];

            setCategories(mockCategories);
            setFilteredCategories(flattenCategories(mockCategories));
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const flattenCategories = (catList: Category[], level = 0): Category[] => {
        let flatList: Category[] = [];

        catList.forEach(category => {
            flatList.push({
                ...category,
                level
            });

            if (category.children && category.children.length > 0) {
                flatList = [...flatList, ...flattenCategories(category.children, level + 1)];
            }
        });

        return flatList;
    };

    const filterCategories = () => {
        let filtered = flattenCategories(categories);

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(category =>
                category.name.toLowerCase().includes(query) ||
                category.description?.toLowerCase().includes(query) ||
                category.slug.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            filtered = filtered.filter(category => category.isActive === isActive);
        }

        setFilteredCategories(filtered);
    };

    const toggleRowExpand = (categoryId: string) => {
        setExpandedRows(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleSaveCategory = async () => {
        try {
            setActionLoading(true);

            // Validation
            if (!formData.name.trim()) {
                throw new Error('Category name is required');
            }

            if (!formData.slug.trim()) {
                throw new Error('Slug is required');
            }

            // Generate slug if empty
            let slug = formData.slug;
            if (!slug) {
                slug = formData.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }

            if (selectedCategory) {
                // Update existing category
                const updatedCategories = updateCategoryInTree(categories, selectedCategory.id, {
                    ...formData,
                    slug,
                    updatedAt: new Date().toISOString().split('T')[0]
                });
                setCategories(updatedCategories);
                toast.success('Category updated successfully');
            } else {
                const newCategory: Category = {
                    id: Date.now().toString(),
                    name: formData.name,
                    slug,
                    description: formData.description,
                    parentId: formData.parentId || '',
                    parentName: formData.parentId ?
                        findCategoryName(categories, formData.parentId) : undefined,
                    image: formData.image,
                    icon: formData.icon,
                    sortOrder: formData.sortOrder,
                    isActive: formData.isActive,
                    isFeatured: formData.isFeatured,
                    productCount: 0,
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0],
                    level: formData.parentId ? 1 : 0,
                    children: []
                };

                if (formData.parentId) {
                    // Add as child
                    const updatedCategories = addCategoryAsChild(categories, formData.parentId, newCategory);
                    setCategories(updatedCategories);
                } else {
                    // Add as top-level
                    setCategories(prev => [newCategory, ...prev]);
                }

                toast.success('Category created successfully');
            }

            setShowFormModal(false);
            setSelectedCategory(null);
            resetForm();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save category');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (!selectedCategory) return;

        try {
            setActionLoading(true);

            // Check if category has products
            if (selectedCategory.productCount > 0) {
                toast.error('Cannot delete category with products. Move products first.');
                return;
            }

            // Check if category has children
            const hasChildren = categories.some(cat => cat.parentId === selectedCategory.id);
            if (hasChildren) {
                toast.error('Cannot delete category with sub-categories. Delete sub-categories first.');
                return;
            }

            // Delete category
            const updatedCategories = deleteCategoryFromTree(categories, selectedCategory.id);
            setCategories(updatedCategories);

            toast.success('Category deleted successfully');
            setShowDeleteModal(false);
            setSelectedCategory(null);
        } catch (error) {
            toast.error('Failed to delete category');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBulkAction = async (action: string) => {
        if (selectedRows.length === 0) {
            toast.error('Please select categories');
            return;
        }

        try {
            setActionLoading(true);

            switch (action) {
                case 'activate':
                    const activatedCategories = updateCategoriesStatus(categories, selectedRows, true);
                    setCategories(activatedCategories);
                    toast.success(`${selectedRows.length} categories activated`);
                    break;

                case 'deactivate':
                    const deactivatedCategories = updateCategoriesStatus(categories, selectedRows, false);
                    setCategories(deactivatedCategories);
                    toast.success(`${selectedRows.length} categories deactivated`);
                    break;

                case 'feature':
                    const featuredCategories = updateCategoriesFeatured(categories, selectedRows, true);
                    setCategories(featuredCategories);
                    toast.success(`${selectedRows.length} categories featured`);
                    break;

                case 'unfeature':
                    const unfeaturedCategories = updateCategoriesFeatured(categories, selectedRows, false);
                    setCategories(unfeaturedCategories);
                    toast.success(`${selectedRows.length} categories unfeatured`);
                    break;

                case 'delete':
                    const categoriesToDelete = filteredCategories.filter(cat =>
                        selectedRows.includes(cat.id)
                    );

                    const hasProducts = categoriesToDelete.some(cat => cat.productCount > 0);
                    const hasChildren = categoriesToDelete.some(cat =>
                        categories.some(c => c.parentId === cat.id)
                    );

                    if (hasProducts || hasChildren) {
                        toast.error('Some categories have products or sub-categories. Cannot delete.');
                        return;
                    }

                    if (window.confirm(`Delete ${selectedRows.length} categories?`)) {
                        const updatedCategories = deleteMultipleCategories(categories, selectedRows);
                        setCategories(updatedCategories);
                        toast.success(`${selectedRows.length} categories deleted`);
                        setSelectedRows([]);
                    }
                    break;
            }

        } catch (error) {
            toast.error('Failed to perform bulk action');
        } finally {
            setActionLoading(false);
        }
    };

    const updateCategoryInTree = (catList: Category[], id: string, updates: any): Category[] => {
        return catList.map(category => {
            if (category.id === id) {
                return { ...category, ...updates };
            }

            if (category.children && category.children.length > 0) {
                return {
                    ...category,
                    children: updateCategoryInTree(category.children, id, updates)
                };
            }

            return category;
        });
    };

    const addCategoryAsChild = (catList: Category[], parentId: string, newCategory: Category): Category[] => {
        return catList.map(category => {
            if (category.id === parentId) {
                return {
                    ...category,
                    children: [...(category.children || []), newCategory]
                };
            }

            if (category.children && category.children.length > 0) {
                return {
                    ...category,
                    children: addCategoryAsChild(category.children, parentId, newCategory)
                };
            }

            return category;
        });
    };

    const deleteCategoryFromTree = (catList: Category[], id: string): Category[] => {
        return catList.filter(category => {
            if (category.id === id) return false;

            if (category.children && category.children.length > 0) {
                category.children = deleteCategoryFromTree(category.children, id);
            }

            return true;
        });
    };

    const findCategoryName = (catList: Category[], id: string): string => {
        for (const category of catList) {
            if (category.id === id) return category.name;

            if (category.children && category.children.length > 0) {
                const found = findCategoryName(category.children, id);
                if (found) return found;
            }
        }

        return '';
    };

    const updateCategoriesStatus = (catList: Category[], ids: string[], isActive: boolean): Category[] => {
        return catList.map(category => {
            if (ids.includes(category.id)) {
                return { ...category, isActive };
            }

            if (category.children && category.children.length > 0) {
                return {
                    ...category,
                    children: updateCategoriesStatus(category.children, ids, isActive)
                };
            }

            return category;
        });
    };

    const updateCategoriesFeatured = (catList: Category[], ids: string[], isFeatured: boolean): Category[] => {
        return catList.map(category => {
            if (ids.includes(category.id)) {
                return { ...category, isFeatured };
            }

            if (category.children && category.children.length > 0) {
                return {
                    ...category,
                    children: updateCategoriesFeatured(category.children, ids, isFeatured)
                };
            }

            return category;
        });
    };

    const deleteMultipleCategories = (catList: Category[], ids: string[]): Category[] => {
        return catList.filter(category => {
            if (ids.includes(category.id)) return false;

            if (category.children && category.children.length > 0) {
                category.children = deleteMultipleCategories(category.children, ids);
            }

            return true;
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            parentId: '',
            image: '',
            icon: '',
            sortOrder: 0,
            isActive: true,
            isFeatured: false
        });
    };

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            parentId: category.parentId || '',
            image: category.image || '',
            icon: category.icon || '',
            sortOrder: category.sortOrder,
            isActive: category.isActive,
            isFeatured: category.isFeatured
        });
        setShowFormModal(true);
    };

    const generateSlug = () => {
        if (!formData.name) return;

        const slug = formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        setFormData(prev => ({ ...prev, slug }));
    };

    const getParentOptions = (excludeId?: string) => {
        const options: Array<{ id: string; name: string; level: number }> = [];

        const addOptions = (catList: Category[], level: number) => {
            catList.forEach(category => {
                if (category.id !== excludeId) {
                    options.push({
                        id: category.id,
                        name: '— '.repeat(level) + category.name,
                        level
                    });

                    if (category.children && category.children.length > 0) {
                        addOptions(category.children, level + 1);
                    }
                }
            });
        };

        addOptions(categories.filter(cat => !cat.parentId), 0);
        return options;
    };

    const getStatusBadge = (isActive: boolean) => (
        <Badge variant={isActive ? 'success' : 'danger'}>
            <i className={`fas fa-${isActive ? 'check' : 'times'} mr-1`}></i>
            {isActive ? 'Active' : 'Inactive'}
        </Badge>
    );

    const getFeaturedBadge = (isFeatured: boolean) => (
        isFeatured && (
            <Badge variant="primary">
                <i className="fas fa-star mr-1"></i>
                Featured
            </Badge>
        )
    );

    const columns = [
        {
            key: 'name',
            header: 'Category',
            render: (value: string, row: Category) => (
                <div className="flex items-center">
                    <div
                        className="mr-3 cursor-pointer"
                        onClick={() => toggleRowExpand(row.id)}
                    >
                        {row.children && row.children.length > 0 ? (
                            <i className={`fas fa-chevron-${expandedRows.includes(row.id) ? 'down' : 'right'} text-gray-400`}></i>
                        ) : (
                            <i className="fas fa-minus text-gray-300"></i>
                        )}
                    </div>

                    <div style={{ marginLeft: `${row.level * 24}px` }}>
                        <div className="flex items-center gap-2">
                            {row.icon && (
                                <i className={`fas fa-${row.icon} text-gray-500`}></i>
                            )}
                            <span className="font-medium">{value}</span>
                            {getFeaturedBadge(row.isFeatured)}
                        </div>
                        {row.parentName && (
                            <div className="text-xs text-gray-500">
                                Parent: {row.parentName}
                            </div>
                        )}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'slug',
            header: 'Slug',
            render: (value: string) => (
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{value}</code>
            )
        },
        {
            key: 'productCount',
            header: 'Products',
            render: (value: number) => (
                <Badge variant={value > 0 ? 'primary' : 'gray'}>
                    {value}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'sortOrder',
            header: 'Order',
            sortable: true
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (value: boolean) => getStatusBadge(value),
            sortable: true
        }
    ];

    const actions = (row: Category) => (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditCategory(row)}
                icon="edit"
                title="Edit"
            />
            <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/products?category=${row.id}`)}
                icon="box"
                title="View Products"
            />
            <Button
                variant="danger"
                size="sm"
                onClick={() => {
                    setSelectedCategory(row);
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
                        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                        <p className="text-gray-600">
                            Manage product categories and hierarchy
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowReorderModal(true)}
                            icon="sort"
                        >
                            Reorder
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setSelectedCategory(null);
                                resetForm();
                                setShowFormModal(true);
                            }}
                            icon="plus"
                        >
                            Add Category
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <Input
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon="search"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                </div>

                {/* View Toggle & Bulk Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-1 rounded-md ${viewMode === 'table'
                                        ? 'bg-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <i className="fas fa-list"></i>
                            </button>
                            <button
                                onClick={() => setViewMode('tree')}
                                className={`px-3 py-1 rounded-md ${viewMode === 'tree'
                                        ? 'bg-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <i className="fas fa-sitemap"></i>
                            </button>
                        </div>

                        <span className="text-sm text-gray-600">
                            {filteredCategories.length} categories found
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedRows.length > 0 && (
                            <>
                                <select
                                    onChange={(e) => handleBulkAction(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg"
                                    defaultValue=""
                                >
                                    <option value="">Bulk Actions</option>
                                    <option value="activate">Activate</option>
                                    <option value="deactivate">Deactivate</option>
                                    <option value="feature">Feature</option>
                                    <option value="unfeature">Unfeature</option>
                                    <option value="delete">Delete</option>
                                </select>
                                <span className="text-sm text-gray-600">
                                    {selectedRows.length} selected
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </Card>

            {/* Categories Content */}
            {viewMode === 'table' ? (
                // Table View
                <DataTable
                    columns={columns}
                    data={filteredCategories}
                    actions={actions}
                    selectable
                    searchable={false}
                    pagination
                    onSelectionChange={setSelectedRows}
                />
            ) : (
                // Tree View
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Category Tree</h3>
                    <div className="space-y-2">
                        {renderCategoryTree(categories, 0, {
                            onEdit: handleEditCategory,
                            onDelete: (cat) => {
                                setSelectedCategory(cat);
                                setShowDeleteModal(true);
                            },
                            onViewProducts: (cat) => navigate(`/admin/products?category=${cat.id}`)
                        })}
                    </div>
                </Card>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {categories.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Categories</div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {categories.filter(c => c.isActive).length}
                        </div>
                        <div className="text-sm text-gray-600">Active Categories</div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {categories.filter(c => c.isFeatured).length}
                        </div>
                        <div className="text-sm text-gray-600">Featured Categories</div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Products</div>
                    </div>
                </Card>
            </div>

            {/* Category Form Modal */}
            <Modal
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false);
                    setSelectedCategory(null);
                    resetForm();
                }}
                title={selectedCategory ? 'Edit Category' : 'Add New Category'}
                size="lg"
            >
                <div className="p-6">
                    <div className="space-y-4">
                        {/* Name & Slug */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="e.g., Front Loading"
                                    required
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Slug *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={generateSlug}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Generate from name
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="e.g., front-loading"
                                    required
                                />
                            </div>
                        </div>

                        {/* Parent Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Parent Category
                            </label>
                            <select
                                value={formData.parentId}
                                onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">No Parent (Top Level)</option>
                                {getParentOptions(selectedCategory?.id).map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                Leave empty to create a top-level category
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                rows={3}
                                placeholder="Category description for SEO and display..."
                            ></textarea>
                        </div>

                        {/* Icon & Image */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Icon (Font Awesome)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="e.g., washer, home, car"
                                    />
                                    {formData.icon && (
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <i className={`fas fa-${formData.icon} text-gray-600`}></i>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Enter Font Awesome icon name without "fa-"
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image URL
                                </label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="https://example.com/image.jpg"
                                />
                                {formData.image && (
                                    <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden">
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sort Order & Flags */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    min="0"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                                    Active
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                                <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
                                    Featured
                                </label>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <i className="fas fa-lightbulb"></i>
                                Category Tips:
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Use clear, descriptive names for better SEO</li>
                                <li>• Keep slug short and keyword-rich</li>
                                <li>• Use hierarchy for better organization</li>
                                <li>• Featured categories appear on homepage</li>
                                <li>• Sort order determines display sequence</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowFormModal(false);
                                setSelectedCategory(null);
                                resetForm();
                            }}
                            className="flex-1"
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSaveCategory}
                            loading={actionLoading}
                            className="flex-1"
                        >
                            {selectedCategory ? 'Update Category' : 'Create Category'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedCategory(null);
                }}
                title="Delete Category"
            >
                <div className="p-6">
                    {selectedCategory && (
                        <>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                                </div>
                                <h3 className="text-lg font-bold mb-2">Delete "{selectedCategory.name}"?</h3>
                                <p className="text-gray-600">
                                    This action cannot be undone. Please confirm deletion.
                                </p>

                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-sm text-gray-700 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Products:</span>
                                            <span className="font-medium">{selectedCategory.productCount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Sub-categories:</span>
                                            <span className="font-medium">
                                                {categories.filter(c => c.parentId === selectedCategory.id).length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Status:</span>
                                            {getStatusBadge(selectedCategory.isActive)}
                                        </div>
                                    </div>
                                </div>

                                {selectedCategory.productCount > 0 && (
                                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                        <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                                            <i className="fas fa-exclamation-circle"></i>
                                            Warning
                                        </h4>
                                        <p className="text-sm text-red-700">
                                            This category contains {selectedCategory.productCount} products.
                                            You must move or delete these products before deleting the category.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedCategory(null);
                                    }}
                                    className="flex-1"
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleDeleteCategory}
                                    loading={actionLoading}
                                    disabled={selectedCategory.productCount > 0}
                                    className="flex-1"
                                >
                                    Delete Category
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Reorder Modal */}
            <Modal
                isOpen={showReorderModal}
                onClose={() => setShowReorderModal(false)}
                title="Reorder Categories"
                size="lg"
            >
                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-gray-600">
                            Drag and drop categories to reorder. Changes are saved automatically.
                        </p>
                    </div>

                    <div className="border rounded-lg p-4">
                        <div className="space-y-2">
                            {categories
                                .filter(cat => !cat.parentId)
                                .sort((a, b) => a.sortOrder - b.sortOrder)
                                .map((category, index) => (
                                    <div key={category.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-gray-400 cursor-move">
                                            <i className="fas fa-grip-vertical"></i>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{category.name}</div>
                                            <div className="text-sm text-gray-600">
                                                Order: {category.sortOrder} • Products: {category.productCount}
                                            </div>
                                        </div>
                                        <div className="text-gray-600">
                                            <i className="fas fa-chevron-down"></i>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setShowReorderModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                toast.success('Category order saved');
                                setShowReorderModal(false);
                            }}
                            className="flex-1"
                        >
                            Save Order
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Helper component to render category tree
const renderCategoryTree = (
    categories: Category[],
    level: number,
    actions: {
        onEdit: (category: Category) => void;
        onDelete: (category: Category) => void;
        onViewProducts: (category: Category) => void;
    }
) => {
    return categories
        .filter(cat => !cat.parentId || level > 0)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(category => (
            <div key={category.id}>
                <div
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                    style={{ marginLeft: `${level * 24}px` }}
                >
                    <div className="flex items-center gap-3">
                        {category.children && category.children.length > 0 ? (
                            <i className="fas fa-folder text-blue-500"></i>
                        ) : (
                            <i className="fas fa-folder-open text-gray-400"></i>
                        )}
                        <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs text-gray-500">
                                {category.productCount} products • {category.slug}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant={category.isActive ? 'success' : 'danger'}>
                            <i className={`fas fa-${category.isActive ? 'check' : 'times'} mr-1`}></i>
                            {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {category.isFeatured && (
                            <Badge variant="primary">
                                <i className="fas fa-star"></i>
                            </Badge>
                        )}
                        <div className="flex gap-1">
                            <button
                                onClick={() => actions.onEdit(category)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Edit"
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                            <button
                                onClick={() => actions.onViewProducts(category)}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="View Products"
                            >
                                <i className="fas fa-box"></i>
                            </button>
                            <button
                                onClick={() => actions.onDelete(category)}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Delete"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Render children */}
                {category.children && category.children.length > 0 && (
                    <div>
                        {renderCategoryTree(category.children, level + 1, actions)}
                    </div>
                )}
            </div>
        ));
};

export default AdminCategoriesPage;
