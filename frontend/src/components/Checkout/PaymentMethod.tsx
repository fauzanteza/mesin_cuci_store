// frontend/src/components/Checkout/PaymentMethod.tsx
import React, { useState } from 'react';
import { Button, Radio } from '../UI';

interface PaymentMethod {
    id: string;
    name: string;
    type: string;
    icon: string;
    description: string;
    banks?: string[];
    wallets?: string[];
    cards?: string[];
    note?: string;
    instructions?: string[];
}

interface PaymentMethodProps {
    methods: PaymentMethod[];
    selectedMethod: PaymentMethod | null;
    onSelect: (method: PaymentMethod) => void;
    onBack: () => void;
    onNext: () => void;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({
    methods,
    selectedMethod,
    onSelect,
    onBack,
    onNext,
}) => {
    const [selectedBank, setSelectedBank] = useState<string>('');
    const [selectedWallet, setSelectedWallet] = useState<string>('');
    const [selectedCard, setSelectedCard] = useState<string>('');

    const handleMethodSelect = (method: PaymentMethod) => {
        onSelect(method);
        // Reset selections when method changes
        setSelectedBank('');
        setSelectedWallet('');
        setSelectedCard('');
    };

    const canProceed = selectedMethod !== null &&
        ((selectedMethod.type === 'bank_transfer' && selectedBank) ||
            (selectedMethod.type === 'ewallet' && selectedWallet) ||
            (selectedMethod.type === 'credit_card' && selectedCard) ||
            ['cod'].includes(selectedMethod.type));

    return (
        <div className="payment-method">
            <h2 className="text-xl font-bold mb-6">Pilih Metode Pembayaran</h2>

            {/* Payment Methods List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
                        <div className="flex items-start">
                            <div className="mr-4">
                                <div className="w-12 h-12 bg-white border rounded-lg flex items-center justify-center">
                                    <i className={`fas fa-${method.icon} text-2xl text-blue-600`}></i>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">{method.name}</h3>
                                    <Radio
                                        checked={selectedMethod?.id === method.id}
                                        onChange={() => handleMethodSelect(method)}
                                    />
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{method.description}</p>

                                {method.note && (
                                    <p className="text-sm text-yellow-600 mt-2">
                                        <i className="fas fa-exclamation-circle mr-1"></i>
                                        {method.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Method Details */}
            {selectedMethod && (
                <div className="bg-white border rounded-lg p-6 mb-8">
                    <h3 className="font-bold text-lg mb-4">Detail {selectedMethod.name}</h3>

                    {selectedMethod.type === 'bank_transfer' && selectedMethod.banks && (
                        <div>
                            <p className="text-gray-700 mb-3">Pilih Bank:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {selectedMethod.banks.map((bank) => (
                                    <button
                                        key={bank}
                                        type="button"
                                        onClick={() => setSelectedBank(bank)}
                                        className={`
                      p-4 border rounded-lg text-center transition-colors
                      ${selectedBank === bank
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }
                    `}
                                    >
                                        <div className="font-medium">{bank}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Transfer Bank
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {selectedBank && (
                                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                                    <h4 className="font-bold text-blue-800 mb-2">
                                        Instruksi Pembayaran {selectedBank}:
                                    </h4>
                                    <ol className="text-sm text-blue-700 space-y-2">
                                        <li>1. Login ke internet/mobile banking {selectedBank}</li>
                                        <li>2. Pilih menu Transfer</li>
                                        <li>3. Masukkan nomor rekening: <strong>1234567890</strong></li>
                                        <li>4. Masukkan nominal sesuai total pembayaran</li>
                                        <li>5. Konfirmasi dan selesaikan transaksi</li>
                                        <li>6. Simpan bukti transfer untuk upload</li>
                                    </ol>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedMethod.type === 'ewallet' && selectedMethod.wallets && (
                        <div>
                            <p className="text-gray-700 mb-3">Pilih E-Wallet:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {selectedMethod.wallets.map((wallet) => (
                                    <button
                                        key={wallet}
                                        type="button"
                                        onClick={() => setSelectedWallet(wallet)}
                                        className={`
                      p-4 border rounded-lg text-center transition-colors
                      ${selectedWallet === wallet
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }
                    `}
                                    >
                                        <div className="font-medium">{wallet}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            E-Wallet
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedMethod.type === 'credit_card' && selectedMethod.cards && (
                        <div>
                            <p className="text-gray-700 mb-3">Pilih Kartu:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {selectedMethod.cards.map((card) => (
                                    <button
                                        key={card}
                                        type="button"
                                        onClick={() => setSelectedCard(card)}
                                        className={`
                      p-4 border rounded-lg text-center transition-colors
                      ${selectedCard === card
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }
                    `}
                                    >
                                        <div className="font-medium">{card}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Credit Card
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedMethod.type === 'cod' && (
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <h4 className="font-bold text-yellow-800 mb-2">
                                <i className="fas fa-money-bill-wave mr-2"></i>
                                Cash on Delivery (COD)
                            </h4>
                            <p className="text-yellow-700">
                                Bayar saat barang sampai. Pastikan Anda menyiapkan uang cash sesuai total pembayaran.
                                Driver akan memberikan struk sebagai bukti pembayaran.
                            </p>
                            <div className="mt-4 text-sm text-yellow-600">
                                <p><strong>Catatan:</strong></p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Pastikan nomor telepon aktif</li>
                                    <li>Siapkan uang pas</li>
                                    <li>Periksa barang sebelum membayar</li>
                                    <li>Minta invoice dari driver</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {selectedMethod.instructions && (
                        <div className="mt-6 bg-gray-50 rounded-lg p-4">
                            <h4 className="font-bold text-gray-800 mb-2">
                                Panduan Umum:
                            </h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                                {selectedMethod.instructions.map((instruction, idx) => (
                                    <li key={idx}>• {instruction}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Payment Security */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-shield-alt text-green-600"></i>
                    </div>
                    <div>
                        <h4 className="font-bold text-green-800">Pembayaran 100% Aman</h4>
                        <p className="text-sm text-green-700">
                            Data pembayaran Anda dienkripsi dan diamankan. Kami tidak menyimpan informasi kartu kredit.
                        </p>
                    </div>
                </div>
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
                    Review Pesanan
                </Button>
            </div>
        </div>
    );
};

export default PaymentMethod;
