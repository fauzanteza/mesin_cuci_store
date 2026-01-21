import React, { useState } from 'react';
import { Button } from '../UI/Button';
import { Alert } from '../UI/Alert';
// Assuming FileUploader or similar exists, if not using a simple input for now as per "UI Components" task status 
// The user requested `FileUploader` which might be part of the `uploadService` or common components. 
// I'll check if FileUploader exists, but for now I'll implement a simple one or use a hypothetical one.
// Actually, I'll implement a basic file input here to be safe and strictly follow the logic.
// Wait, I can use the existing 'uploadService' style or check if there is an Input component for file.

const ManualPaymentUpload: React.FC<{ orderId: string, amount: number }> = ({ orderId, amount }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [bank, setBank] = useState('bca');

    const banks = [
        { id: 'bca', name: 'BCA', account: '1234567890', holder: 'PT MESIN CUCI STORE' },
        { id: 'mandiri', name: 'Mandiri', account: '0987654321', holder: 'PT MESIN CUCI STORE' },
        { id: 'bni', name: 'BNI', account: '1122334455', holder: 'PT MESIN CUCI STORE' }
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('paymentProof', file);
            formData.append('bank', bank);
            formData.append('orderId', orderId);

            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments/manual`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                alert('Bukti pembayaran berhasil diupload! Admin akan memverifikasi.');
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error: any) {
            alert('Upload gagal: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="manual-payment p-4 border rounded-lg shadow-sm bg-white">
            <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Transfer Manual</h4>
                <p className="text-gray-600 mb-4">Lakukan transfer sebesar <span className="font-bold text-blue-600">Rp {amount.toLocaleString('id-ID')}</span> ke salah satu rekening berikut:</p>

                <div className="space-y-3">
                    {banks.map(b => (
                        <div
                            key={b.id}
                            className={`p-3 border rounded-md cursor-pointer flex items-center transition-colors ${bank === b.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            onClick={() => setBank(b.id)}
                        >
                            <input
                                type="radio"
                                id={b.id}
                                name="bank"
                                className="mr-3"
                                checked={bank === b.id}
                                onChange={() => setBank(b.id)}
                            />
                            <label htmlFor={b.id} className="cursor-pointer flex-1">
                                <div className="font-bold">{b.name}</div>
                                <div className="text-sm">No. Rek: {b.account}</div>
                                <div className="text-xs text-gray-500">a.n. {b.holder}</div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="upload-section border-t pt-4">
                <h5 className="font-medium mb-3">Upload Bukti Transfer</h5>

                <div className="mb-4">
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                    />
                </div>

                {file && (
                    <div className="file-preview bg-gray-50 p-3 rounded-md mb-4">
                        <p className="text-sm text-gray-700 mb-2 truncate">File: {file.name}</p>
                        <Button
                            onClick={handleUpload}
                            isLoading={uploading}
                            disabled={uploading}
                            className="w-full"
                        >
                            {uploading ? 'Mengupload...' : 'Kirim Bukti Pembayaran'}
                        </Button>
                    </div>
                )}
            </div>

            <div className="instructions mt-4">
                <Alert type="warning" title="Perhatian">
                    <ul className="list-disc list-inside text-sm mt-1">
                        <li>Transfer sesuai jumlah yang tertera</li>
                        <li>Upload bukti transfer yang jelas (struk ATM / screenshot M-Banking)</li>
                        <li>Pesanan akan diproses setelah pembayaran diverifikasi (1-3 jam kerja)</li>
                    </ul>
                </Alert>
            </div>
        </div>
    );
};

export default ManualPaymentUpload;
