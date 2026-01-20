import React, { useState } from 'react';
import { Button, Input } from '../UI';

interface AddressFormData {
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    isDefault: boolean;
    label: 'home' | 'office' | 'other';
}

interface AddressFormProps {
    initialData?: AddressFormData;
    onSubmit: (data: AddressFormData) => void;
    onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
    initialData,
    onSubmit,
    onCancel
}) => {
    const [formData, setFormData] = useState<AddressFormData>({
        name: initialData?.name || '',
        phone: initialData?.phone || '',
        address: initialData?.address || '',
        city: initialData?.city || '',
        province: initialData?.province || '',
        postalCode: initialData?.postalCode || '',
        isDefault: initialData?.isDefault || false,
        label: initialData?.label || 'home'
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!formData.name.trim()) {
                throw new Error('Nama penerima wajib diisi');
            }

            if (!formData.phone.trim()) {
                throw new Error('Nomor telepon wajib diisi');
            }

            if (!/^[0-9+\-\s]{10,15}$/.test(formData.phone)) {
                throw new Error('Format nomor telepon tidak valid');
            }

            if (!formData.address.trim()) {
                throw new Error('Alamat wajib diisi');
            }

            if (!formData.city.trim()) {
                throw new Error('Kota wajib diisi');
            }

            if (!formData.province.trim()) {
                throw new Error('Provinsi wajib diisi');
            }

            if (!formData.postalCode.trim()) {
                throw new Error('Kode pos wajib diisi');
            }

            if (!/^[0-9]{5}$/.test(formData.postalCode)) {
                throw new Error('Kode pos harus 5 digit');
            }

            onSubmit(formData);
        } catch (error: any) {
            // Alert.error(error.message);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Penerima *
                    </label>
                    <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nama lengkap penerima"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon *
                    </label>
                    <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0812 3456 7890"
                        required
                    />
                </div>
            </div>

            {/* Address Label */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label Alamat
                </label>
                <div className="flex gap-3">
                    {(['home', 'office', 'other'] as const).map((label) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, label }))}
                            className={`
                flex-1 py-3 rounded-lg border text-center
                ${formData.label === label
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 hover:border-gray-400'
                                }
              `}
                        >
                            <i className={`
                fas fa-${label === 'home' ? 'home' : label === 'office' ? 'building' : 'map-marker-alt'}
                mb-2
              `}></i>
                            <div className="text-sm font-medium">
                                {label === 'home' ? 'Rumah' :
                                    label === 'office' ? 'Kantor' : 'Lainnya'}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Address Details */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap *
                </label>
                <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Jl. Nama Jalan No. 123, RT/RW, Kelurahan"
                    required
                />
            </div>

            {/* City, Province, Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kota *
                    </label>
                    <Input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Nama kota"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provinsi *
                    </label>
                    <Input
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        placeholder="Nama provinsi"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kode Pos *
                    </label>
                    <Input
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="12345"
                        pattern="[0-9]{5}"
                        required
                    />
                </div>
            </div>

            {/* Default Address */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                    Jadikan alamat default untuk pengiriman
                </label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                    disabled={loading}
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="flex-1"
                >
                    {initialData ? 'Simpan Perubahan' : 'Tambah Alamat'}
                </Button>
            </div>
        </form>
    );
};

export default AddressForm;
