import React, { useState, useEffect } from 'react';
import { Button, LoadingSpinner, Modal } from '../../components/UI';
// import addressService from '../../services/addressService';
import AddressForm from '../../components/User/AddressCard';
// import { useAuth } from '../../hooks/useAuth';

interface Address {
    id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    isDefault: boolean;
    label: 'home' | 'office' | 'other';
}

const UserAddressesPage: React.FC = () => {
    // const { user } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            setLoading(true);
            // Mock data
            const mockAddresses: Address[] = [
                {
                    id: '1',
                    name: 'John Doe',
                    phone: '081234567890',
                    address: 'Jl. Contoh No. 123',
                    city: 'Jakarta',
                    province: 'DKI Jakarta',
                    postalCode: '12345',
                    isDefault: true,
                    label: 'home'
                },
                {
                    id: '2',
                    name: 'John Doe',
                    phone: '081234567891',
                    address: 'Jl. Kantor No. 456',
                    city: 'Jakarta',
                    province: 'DKI Jakarta',
                    postalCode: '54321',
                    isDefault: false,
                    label: 'office'
                }
            ];
            setAddresses(mockAddresses);
        } catch (error) {
            // Alert.error('Gagal memuat alamat');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAddress = async (addressData: Omit<Address, 'id'>) => {
        try {
            if (editingAddress) {
                // Update
                setAddresses(prev => prev.map(addr =>
                    addr.id === editingAddress.id ? { ...addressData, id: editingAddress.id } : addr
                ));
                // Alert.success('Alamat berhasil diperbarui');
                alert('Alamat berhasil diperbarui');
            } else {
                // Add new
                const newAddress: Address = {
                    ...addressData,
                    id: Date.now().toString()
                };
                setAddresses(prev => [...prev, newAddress]);
                // Alert.success('Alamat berhasil ditambahkan');
                alert('Alamat berhasil ditambahkan');
            }
            setShowForm(false);
            setEditingAddress(null);
        } catch (error) {
            // Alert.error('Gagal menyimpan alamat');
            alert('Gagal menyimpan alamat');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setAddresses(prev => prev.filter(addr => addr.id !== id));
            // Alert.success('Alamat berhasil dihapus');
            alert('Alamat berhasil dihapus');
            setDeletingId(null);
        } catch (error) {
            // Alert.error('Gagal menghapus alamat');
            alert('Gagal menghapus alamat');
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            setAddresses(prev => prev.map(addr => ({
                ...addr,
                isDefault: addr.id === id
            })));
            // Alert.success('Alamat default berhasil diubah');
            alert('Alamat default berhasil diubah');
        } catch (error) {
            // Alert.error('Gagal mengubah alamat default');
            alert('Gagal mengubah alamat default');
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Alamat Saya</h1>
                    <p className="text-gray-600">Kelola alamat pengiriman Anda</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowForm(true)}
                    icon="plus"
                >
                    Tambah Alamat Baru
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {addresses.map(address => (
                    <div key={address.id} className="border rounded-lg p-6 relative">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs ${address.label === 'home'
                                        ? 'bg-blue-100 text-blue-800'
                                        : address.label === 'office'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {address.label === 'home' ? '🏠 Rumah' :
                                            address.label === 'office' ? '🏢 Kantor' : '📍 Lainnya'}
                                    </span>
                                    {address.isDefault && (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg mt-2">{address.name}</h3>
                                <p className="text-gray-600">{address.phone}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingAddress(address);
                                        setShowForm(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 p-2"
                                    title="Edit"
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button
                                    onClick={() => setDeletingId(address.id)}
                                    className="text-red-600 hover:text-red-800 p-2"
                                    title="Hapus"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>

                        <div className="text-gray-700 space-y-1">
                            <p>{address.address}</p>
                            <p>{address.city}, {address.province}</p>
                            <p>Kode Pos: {address.postalCode}</p>
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t">
                            {!address.isDefault && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetDefault(address.id)}
                                >
                                    Jadikan Default
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    // Navigate to checkout with this address
                                    // Alert.info('Fitur akan ditambahkan');
                                    alert('Fitur akan ditambahkan');
                                }}
                            >
                                Gunakan untuk Pengiriman
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {addresses.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <i className="fas fa-map-marker-alt text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                        Belum Ada Alamat
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Tambahkan alamat untuk memudahkan pengiriman pesanan
                    </p>
                    <Button
                        variant="primary"
                        onClick={() => setShowForm(true)}
                        icon="plus"
                    >
                        Tambah Alamat Pertama
                    </Button>
                </div>
            )}

            {/* Address Form Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditingAddress(null);
                }}
                title={editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                size="lg"
            >
                <div className="p-6">
                    <AddressForm
                        initialData={editingAddress || undefined}
                        onSubmit={handleSaveAddress}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingAddress(null);
                        }}
                    />
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deletingId !== null}
                onClose={() => setDeletingId(null)}
                title="Hapus Alamat"
            >
                <div className="p-6">
                    <div className="mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-center mb-2">
                            Hapus Alamat?
                        </h3>
                        <p className="text-gray-600 text-center">
                            Alamat yang sudah dihapus tidak dapat dikembalikan
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeletingId(null)}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => deletingId && handleDelete(deletingId)}
                            className="flex-1"
                        >
                            Ya, Hapus
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserAddressesPage;
