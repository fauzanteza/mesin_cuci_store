// frontend/src/components/Checkout/ShippingMethod.tsx
import React from 'react';
import { Button, Radio } from '../UI';

interface ShippingMethod {
    id: string;
    name: string;
    provider: string;
    cost: number;
    estimatedDays: string;
    description: string;
    features?: string[];
}

interface ShippingMethodProps {
    methods: ShippingMethod[];
    selectedMethod: ShippingMethod | null;
    onSelect: (method: ShippingMethod) => void;
    onBack: () => void;
    onNext: () => void;
    address?: any;
}

const ShippingMethod: React.FC<ShippingMethodProps> = ({
    methods,
    selectedMethod,
    onSelect,
    onBack,
    onNext,
    address,
}) => {
    const handleMethodSelect = (method: ShippingMethod) => {
        onSelect(method);
    };

    const canProceed = selectedMethod !== null;

    return (
        <div className="shipping-method">
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Pilih Metode Pengiriman</h2>
                {address && (
                    <p className="text-gray-600">
                        Dikirim ke: {address.address}, {address.city}
                    </p>
                )}
            </div>

            {methods.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <i className="fas fa-truck text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600 mb-2">Tidak ada metode pengiriman tersedia</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Silakan pilih alamat lain atau hubungi customer service
                    </p>
                    <Button variant="outline" onClick={onBack}>
                        Kembali ke Alamat
                    </Button>
                </div>
            ) : (
                <>
                    {/* Shipping Methods List */}
                    <div className="space-y-4 mb-8">
                        {methods.map((method) => (
                            <div
                                key={method.id}
                                className={`
                  border rounded-lg p-4 cursor-pointer transition-all
                  ${selectedMethod?.id === method.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }
                `}
                                onClick={() => handleMethodSelect(method)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900">{method.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {method.provider} • {method.estimatedDays}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg">
                                                    Rp {method.cost.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Biaya pengiriman
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-gray-700 mb-3">{method.description}</p>

                                        {method.features && method.features.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {method.features.map((feature, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                                                    >
                                                        <i className="fas fa-check text-green-500 text-xs"></i>
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="ml-4">
                                        <Radio
                                            checked={selectedMethod?.id === method.id}
                                            onChange={() => handleMethodSelect(method)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Free Shipping Banner */}
                    {selectedMethod && selectedMethod.cost === 0 && (
                        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <i className="fas fa-gift text-green-600"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-green-800">Gratis Pengiriman! 🎉</h4>
                                    <p className="text-sm text-green-700">
                                        Anda berhasil mendapatkan pengiriman gratis
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delivery Information */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-8">
                        <h4 className="font-bold text-blue-800 mb-2">
                            <i className="fas fa-info-circle mr-2"></i>
                            Informasi Pengiriman
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Pengiriman dilakukan pada hari kerja (Senin-Jumat)</li>
                            <li>• Waktu pengiriman: 09:00 - 17:00</li>
                            <li>• Penerima wajib menandatangani bukti penerimaan</li>
                            <li>• Pemasangan gratis untuk wilayah Jabodetabek</li>
                            <li>• Laporan kerusakan dalam 24 jam setelah penerimaan</li>
                        </ul>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={onBack}
                            icon="arrow-left"
                        >
                            Kembali
                        </Button>
                        <Button
                            variant="primary"
                            onClick={onNext}
                            disabled={!canProceed}
                            icon="arrow-right"
                            iconPosition="right"
                        >
                            Lanjut ke Pembayaran
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShippingMethod;
