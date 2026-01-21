import React, { useState, useEffect } from 'react';
import { Button } from '../UI/Button';
import { Alert } from '../UI/Alert';

declare global {
    interface Window {
        snap: any;
    }
}

interface MidtransPaymentProps {
    orderId: string;
    amount: number;
    customerDetails: {
        name: string;
        email: string;
        phone: string;
    };
    onSuccess: () => void;
    onError: (error: string) => void;
}

const MidtransPayment: React.FC<MidtransPaymentProps> = ({
    orderId,
    amount,
    customerDetails,
    onSuccess,
    onError
}) => {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>('');

    useEffect(() => {
        // Load Midtrans Snap script
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', process.env.REACT_APP_MIDTRANS_CLIENT_KEY || '');
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = async () => {
        try {
            setLoading(true);

            // Get payment token from backend
            // Note: Assuming axios or fetch wrapper is used in services, but using fetch directly here as per snippet
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderId,
                    paymentMethod,
                    customerDetails
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create payment token');
            }

            const { token: snapToken } = await response.json();

            if (!window.snap) {
                throw new Error('Midtrans Snap not loaded');
            }

            // Initialize Snap
            window.snap.pay(snapToken, {
                onSuccess: (result: any) => {
                    console.log('Payment success:', result);
                    onSuccess();
                },
                onPending: (result: any) => {
                    console.log('Payment pending:', result);
                    // Optional: Handle pending state specifically
                    onSuccess(); // Considering pending as success for redirecting to status page
                },
                onError: (result: any) => {
                    console.error('Payment error:', result);
                    onError(result.status_message || 'Payment failed');
                },
                onClose: () => {
                    console.log('Payment popup closed');
                    setLoading(false);
                }
            });
        } catch (error: any) {
            onError(error.message);
            setLoading(false);
        }
    };

    // Payment method options
    const paymentMethods = [
        { id: 'credit_card', name: 'Kartu Kredit', icon: '💳' },
        { id: 'gopay', name: 'GoPay', icon: '📱' },
        { id: 'shopeepay', name: 'ShopeePay', icon: '🛍️' },
        { id: 'bca_va', name: 'BCA Virtual Account', icon: '🏦' },
        { id: 'bni_va', name: 'BNI Virtual Account', icon: '🏦' },
        { id: 'bri_va', name: 'BRI Virtual Account', icon: '🏦' },
        { id: 'mandiri_va', name: 'Mandiri Virtual Account', icon: '🏦' },
        { id: 'qris', name: 'QRIS', icon: '📲' },
        { id: 'alfamart', name: 'Alfamart', icon: '🏪' },
        { id: 'indomaret', name: 'Indomaret', icon: '🏪' }
    ];

    return (
        <div className="midtrans-payment p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="text-lg font-semibold mb-4">Pilih Metode Pembayaran</h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {paymentMethods.map(method => (
                    <div
                        key={method.id}
                        className={`cursor-pointer p-3 border rounded-md flex flex-col items-center justify-center transition-colors ${paymentMethod === method.id
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                        onClick={() => setPaymentMethod(method.id)}
                    >
                        <span className="text-2xl mb-2">{method.icon}</span>
                        <span className="text-sm text-center font-medium">{method.name}</span>
                    </div>
                ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-semibold">{orderId}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Total Pembayaran:</span>
                    <span className="font-bold text-lg text-blue-600">Rp {amount.toLocaleString('id-ID')}</span>
                </div>
            </div>

            <Button
                onClick={handlePayment}
                disabled={!paymentMethod || loading}
                isLoading={loading}
                className="w-full mb-4"
                size="lg"
            >
                {loading ? 'Memproses...' : 'Bayar Sekarang'}
            </Button>

            <Alert type="info" title="Instruksi Pembayaran">
                <ul className="list-disc list-inside text-sm mt-1">
                    <li>Pilih metode pembayaran di atas</li>
                    <li>Klik "Bayar Sekarang"</li>
                    <li>Ikuti instruksi di popup yang muncul</li>
                    <li>Simpan bukti pembayaran Anda</li>
                </ul>
            </Alert>
        </div>
    );
};

export default MidtransPayment;
