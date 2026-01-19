// frontend/src/pages/User/AddressesPage.tsx
import React, { useState, useEffect } from 'react';
import { Button, LoadingSpinner } from '../../components/UI';
import userService, { Address } from '../../services/userService';

const AddressesPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            // const data = await userService.getAddresses();
            // setAddresses(data);

            // Mock data
            setAddresses([
                {
                    id: '1',
                    name: 'Rumah',
                    recipient: 'Fauzan',
                    phone: '081234567890',
                    address: 'Jl. Merdeka No. 123',
                    city: 'Jakarta Pusat',
                    province: 'DKI Jakarta',
                    postalCode: '10110',
                    isDefault: true
                }
            ]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus alamat ini?')) return;
        try {
            await userService.deleteAddress(id);
            setAddresses(addresses.filter(a => a.id !== id));
        } catch (error) {
            alert('Gagal menghapus alamat');
        }
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setShowForm(true);
    };

    // Note: AddressForm component in Checkout expects slightly different props (selection mode).
    // Ideally, we should refactor AddressForm to be more generic or create a separate AddressEditor.
    // For MVP speed, I will create a placeholder view here showing logic.

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Daftar Alamat</h1>
                <Button onClick={() => setShowForm(true)} icon="plus">Tambah Alamat</Button>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                        <div key={addr.id} className="bg-white rounded-xl shadow p-6 relative">
                            {addr.isDefault && (
                                <span className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    Utama
                                </span>
                            )}
                            <h3 className="font-bold text-lg mb-2">{addr.name}</h3>
                            <p className="text-gray-600 font-medium">{addr.recipient}</p>
                            <p className="text-gray-600">{addr.phone}</p>
                            <p className="text-gray-500 mt-2">
                                {addr.address}<br />
                                {addr.city}, {addr.province} {addr.postalCode}
                            </p>
                            <div className="mt-4 flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(addr)}>
                                    Edit
                                </Button>
                                {!addr.isDefault && (
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(addr.id)}>
                                        Hapus
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Basic Modal or Form logic would go here */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">{editingAddress ? 'Edit Alamat' : 'Tambah Alamat'}</h2>
                        <p className="text-gray-500 mb-4">Fitur form lengkap akan segera hadir.</p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => { setShowForm(false); setEditingAddress(null); }}>Batal</Button>
                            <Button variant="primary" onClick={() => { setShowForm(false); setEditingAddress(null); }}>Simpan</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressesPage;
