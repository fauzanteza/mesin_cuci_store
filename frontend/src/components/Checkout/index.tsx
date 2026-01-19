import React from 'react';

export const CheckoutSteps = ({ steps, currentStep }: any) => {
    return (
        <div className="flex justify-between mb-8">
            {steps.map((step: any) => (
                <div key={step.number} className={`flex flex-col items-center ${step.number <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 ${step.number <= currentStep ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                        {step.number}
                    </div>
                    <span className="text-sm">{step.title}</span>
                </div>
            ))}
        </div>
    );
};

export const AddressForm = ({ onSelect, selectedAddress, onNext }: any) => {
    return (
        <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Alamat Pengiriman</h2>
            <div className="mb-4">
                <p className="text-gray-500 mb-2">Pilih alamat atau tambah baru</p>
                {/* Placeholder for form */}
                <div className="border p-4 rounded cursor-pointer hover:border-blue-500" onClick={() => onSelect({ name: 'John Doe', address: 'Jl. Contoh No. 123', city: 'Jakarta', postalCode: '12345', phone: '08123456789' })}>
                    <p className="font-bold">John Doe</p>
                    <p>Jl. Contoh No. 123</p>
                    <p>Jakarta, 12345</p>
                    <p>08123456789</p>
                </div>
            </div>
            <button onClick={onNext} className="bg-blue-600 text-white px-4 py-2 rounded">
                Lanjut ke Pengiriman
            </button>
        </div>
    );
};

export const ShippingMethod = ({ onSelect, selectedMethod, onNext, onBack }: any) => {
    return (
        <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Metode Pengiriman</h2>
            <div className="space-y-2 mb-4">
                <div className="border p-4 rounded cursor-pointer hover:border-blue-500" onClick={() => onSelect({ name: 'JNE Reguler', cost: 20000 })}>
                    <div className="flex justify-between">
                        <span className="font-bold">JNE Reguler</span>
                        <span>Rp 20.000</span>
                    </div>
                    <p className="text-sm text-gray-500">Estimasi 2-3 hari</p>
                </div>
                <div className="border p-4 rounded cursor-pointer hover:border-blue-500" onClick={() => onSelect({ name: 'SiCepat BEST', cost: 35000 })}>
                    <div className="flex justify-between">
                        <span className="font-bold">SiCepat BEST</span>
                        <span>Rp 35.000</span>
                    </div>
                    <p className="text-sm text-gray-500">Estimasi 1 hari</p>
                </div>
            </div>
            <div className="flex justify-between">
                <button onClick={onBack} className="text-gray-600 px-4 py-2">Kembali</button>
                <button onClick={onNext} className="bg-blue-600 text-white px-4 py-2 rounded">Lanjut ke Pembayaran</button>
            </div>
        </div>
    );
};

export const PaymentMethod = ({ onSelect, selectedMethod, onNext, onBack }: any) => {
    return (
        <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Metode Pembayaran</h2>
            <div className="space-y-2 mb-4">
                <div className="border p-4 rounded cursor-pointer hover:border-blue-500" onClick={() => onSelect({ name: 'Bank Transfer BCA' })}>
                    <span className="font-bold">Bank Transfer BCA</span>
                </div>
                <div className="border p-4 rounded cursor-pointer hover:border-blue-500" onClick={() => onSelect({ name: 'Gopay' })}>
                    <span className="font-bold">Gopay</span>
                </div>
            </div>
            <div className="flex justify-between">
                <button onClick={onBack} className="text-gray-600 px-4 py-2">Kembali</button>
                <button onClick={onNext} className="bg-blue-600 text-white px-4 py-2 rounded">Konfirmasi Pesanan</button>
            </div>
        </div>
    );
};

export const OrderSummary = ({ items, subtotal, shippingCost, onEditCart }: any) => {
    return (
        <div className="bg-gray-50 p-6 rounded shadow">
            <h2 className="text-lg font-bold mb-4">Ringkasan Pesanan</h2>
            <div className="space-y-2 mb-4">
                {items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span>Rp {(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                ))}
            </div>
            <div className="border-t pt-2 space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Pengiriman</span>
                    <span>Rp {shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>Rp {(subtotal + shippingCost).toLocaleString()}</span>
                </div>
            </div>
            <button onClick={onEditCart} className="w-full mt-4 text-blue-600 text-sm hover:underline">
                Edit Keranjang
            </button>
        </div>
    );
};
