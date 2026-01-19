import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, LoadingSpinner, Badge, Modal, Alert } from '../../components/UI';
import { PriceDisplay } from '../../components/Shared';
// import productService from '../../services/productService'; // Assuming this exists or will exist

const AdminProducts: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            // const data = await productService.getAllProducts(); 
            // Mock data
            const mockProducts = [
                {
                    id: '1',
                    name: 'Mesin Cuci LG 8kg',
                    price: 3450000,
                    stock: 10,
                    category: 'Front Load',
                    image: '/images/products/lg-8kg.jpg',
                    isActive: true,
                    sku: 'LG-FL8'
                },
                {
                    id: '2',
                    name: 'Samsung Top Load 10kg',
                    price: 4200000,
                    stock: 5,
                    category: 'Top Load',
                    image: '/images/products/samsung-tl10.jpg',
                    isActive: true,
                    sku: 'SAM-TL10'
                },
                {
                    id: '3',
                    name: 'Pipa Pembuangan Universal',
                    price: 75000,
                    stock: 50,
                    category: 'Aksesoris',
                    image: '/images/products/pipe.jpg',
                    isActive: true,
                    sku: 'ACC-PIPE'
                }
            ];
            setProducts(mockProducts);
        } catch (error) {
            console.error('Failed to load products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (product: any) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        setDeleting(true);
        try {
            // await productService.deleteProduct(productToDelete.id);
            setProducts(products.filter(p => p.id !== productToDelete.id));
            setShowDeleteModal(false);
            setProductToDelete(null);
            // Alert.success('Produk berhasil dihapus');
        } catch (error) {
            console.error('Failed to delete product', error);
            // Alert.error('Gagal menghapus produk');
        } finally {
            setDeleting(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Manajemen Produk</h1>
                <Link to="/admin/products/new">
                    <Button variant="primary" icon="plus">Tambah Produk</Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="p-4 border-b">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari produk berdasarkan nama atau SKU..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produk</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Harga</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-center">Stok</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-center">Status</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img className="h-10 w-10 rounded object-cover bg-gray-100" src={product.image} alt={product.name} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-sm text-gray-500">{product.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {product.category}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                            <PriceDisplay price={product.price} size="sm" />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant={product.isActive ? 'success' : 'danger'}>
                                                {product.isActive ? 'Aktif' : 'Non-Aktif'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-medium">
                                            <div className="flex justify-center space-x-2">
                                                <Link to={`/admin/products/${product.id}/edit`}>
                                                    <button className="text-blue-600 hover:text-blue-900 mx-1" title="Edit">
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteClick(product)}
                                                    className="text-red-600 hover:text-red-900 mx-1"
                                                    title="Hapus"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        Tidak ada produk yang ditemukan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Hapus Produk"
            >
                <div className="p-6">
                    <p className="mb-4">Apakah Anda yakin ingin menghapus produk <span className="font-bold">{productToDelete?.name}</span>?</p>
                    <p className="text-sm text-red-600 mb-6">Tindakan ini tidak dapat dibatalkan.</p>
                    <div className="flex justify-end space-x-3">
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Batal</Button>
                        <Button variant="danger" onClick={confirmDelete} loading={deleting}>Hapus</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminProducts;
