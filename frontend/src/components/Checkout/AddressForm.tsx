// frontend/src/components/Checkout/AddressForm.tsx
import React, { useState } from 'react';
import { Button, Radio, Input } from '../UI';

interface Address {
    id: string;
    name: string;
    recipient: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    isDefault: boolean;
    notes?: string;
}

interface AddressFormProps {
    addresses: Address[];
    selectedAddress: Address | null;
    onSelect: (address: Address) => void;
    onNext: () => void;
    onAddNew: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
    addresses,
    selectedAddress,
    onSelect,
    onNext,
    onAddNew,
}) => {
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: 'Rumah',
        recipient: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        notes: '',
    });

    const handleAddressSelect = (address: Address) => {
        onSelect(address);
    };

    const handleNewAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In real app, save to backend
        const createdAddress: Address = {
            id: `addr-${Date.now()}`,
            ...newAddress,
            isDefault: addresses.length === 0,
        };
        onSelect(createdAddress);
        setShowNewAddressForm(false);
    };

    const canProceed = selectedAddress !== null;

    return (
        <div className="address-form">
            <h2 className="text-xl font-bold mb-6">Pilih Alamat Pengiriman</h2>

            {/* Existing Addresses */}
            <div className="space-y-4 mb-8">
                {addresses.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <i className="fas fa-map-marker-alt text-4xl text-gray-400 mb-4"></i>
                        <p className="text-gray-600 mb-4">Belum ada alamat tersimpan</p>
                        <Button variant="outline" onClick={onAddNew}>
                            Tambah Alamat Baru
                        </Button>
                    </div>
                ) : (
                    addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${selectedAddress?.id === address.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }
              `}
                            onClick={() => handleAddressSelect(address)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-gray-900">{address.name}</h3>
                                        {address.isDefault && (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                Utama
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-gray-700">
                                        <p className="font-medium">{address.recipient}</p>
                                        <p className="text-sm">{address.phone}</p>
                                        <p className="mt-2">{address.address}</p>
                                        <p className="text-sm">
                                            {address.city}, {address.province} {address.postalCode}
                                        </p>
                                        {address.notes && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                <i className="fas fa-sticky-note mr-1"></i>
                                                {address.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <Radio
                                        checked={selectedAddress?.id === address.id}
                                        onChange={() => handleAddressSelect(address)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add New Address Button */}
            {!showNewAddressForm && (
                <Button
                    variant="outline"
                    onClick={() => setShowNewAddressForm(true)}
                    className="w-full mb-8"
                    icon="plus"
                >
                    Tambah Alamat Baru
                </Button>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
                <div className="border rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-bold mb-4">Tambah Alamat Baru</h3>
                    <form onSubmit={handleNewAddressSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Alamat *
                                </label>
                                <select
                                    value={newAddress.name}
                                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="Rumah">Rumah</option>
                                    <option value="Kantor">Kantor</option>
                                    <option value="Kos">Kos</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Penerima *
                                </label>
                                <Input
                                    type="text"
                                    value={newAddress.recipient}
                                    onChange={(e) => setNewAddress({ ...newAddress, recipient: e.target.value })}
                                    placeholder="Nama lengkap penerima"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nomor Telepon *
                                </label>
                                <Input
                                    type="tel"
                                    value={newAddress.phone}
                                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                    placeholder="0812 3456 7890"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kode Pos *
                                </label>
                                <Input
                                    type="text"
                                    value={newAddress.postalCode}
                                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                    placeholder="12345"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Alamat Lengkap *
                                </label>
                                <textarea
                                    value={newAddress.address}
                                    onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Jl. Nama Jalan No. 123, RT/RW, Kelurahan, Kecamatan"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kota *
                                </label>
                                <Input
                                    type="text"
                                    value={newAddress.city}
                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                    placeholder="Nama Kota"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Provinsi *
                                </label>
                                <select
                                    value={newAddress.province}
                                    onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Pilih Provinsi</option>
                                    <option value="DKI Jakarta">DKI Jakarta</option>
                                    <option value="Jawa Barat">Jawa Barat</option>
                                    <option value="Jawa Tengah">Jawa Tengah</option>
                                    <option value="Jawa Timur">Jawa Timur</option>
                                    <option value="Banten">Banten</option>
                                    <option value="Bali">Bali</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Catatan (Opsional)
                                </label>
                                <Input
                                    type="text"
                                    value={newAddress.notes}
                                    onChange={(e) => setNewAddress({ ...newAddress, notes: e.target.value })}
                                    placeholder="Contoh: warna rumah hijau, pagar besi, dll."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowNewAddressForm(false)}
                                className="flex-1"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1"
                            >
                                Simpan Alamat
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-end">
                <Button
                    variant="primary"
                    onClick={onNext}
                    disabled={!canProceed}
                    icon="arrow-right"
                    iconPosition="right"
                >
                    Lanjut ke Pengiriman
                </Button>
            </div>
        </div>
    );
};

export default AddressForm;
