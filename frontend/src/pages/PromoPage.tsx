import { Tag, Clock, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';

const PromoPage = () => {
    const promos = [
        {
            id: 1,
            title: 'Diskon Akhir Tahun',
            description: 'Dapatkan diskon hingga 30% untuk semua produk mesin cuci',
            discount: '30%',
            code: 'TAHUNBARU30',
            validUntil: '31 Desember 2024',
            image: '/images/banner-1.jpg'
        },
        {
            id: 2,
            title: 'Gratis Ongkir',
            description: 'Gratis pengiriman untuk pembelian di atas Rp 2.000.000',
            discount: 'GRATIS',
            code: 'FREEONGKIR',
            validUntil: '31 Maret 2024',
            image: '/images/banner-1.jpg'
        },
        {
            id: 3,
            title: 'Welcome Voucher',
            description: 'Diskon 15% untuk member baru',
            discount: '15%',
            code: 'WELCOME15',
            validUntil: '30 Juni 2024',
            image: '/images/banner-1.jpg'
        }
    ];

    return (
        <div className="py-8">
            {/* Hero Section */}
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Promo & Diskon</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Nikmati berbagai promo menarik dan diskon spesial untuk pembelian mesin cuci di toko kami
                </p>
            </div>

            {/* Promo Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {promos.map((promo) => (
                    <div key={promo.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        {/* Promo Image */}
                        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-white text-center p-4">
                                    <Tag className="h-12 w-12 mx-auto mb-2" />
                                    <h3 className="text-2xl font-bold">{promo.discount}</h3>
                                    <p className="text-sm opacity-90">DISKON</p>
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                {promo.code}
                            </div>
                        </div>

                        {/* Promo Details */}
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{promo.title}</h3>
                            <p className="text-gray-600 mb-4">{promo.description}</p>

                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center text-gray-500">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span className="text-sm">Berlaku hingga {promo.validUntil}</span>
                                </div>
                            </div>

                            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Kode Promo:</span>
                                    <span className="font-mono font-bold text-green-600">{promo.code}</span>
                                </div>
                            </div>

                            <Link
                                to="/products"
                                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-medium transition"
                            >
                                Belanja Sekarang
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Section */}
            <div className="mt-12 bg-blue-50 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cara Menggunakan Promo</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-blue-600 font-bold text-xl">1</span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Pilih Produk</h3>
                        <p className="text-gray-600">Tambahkan produk ke keranjang belanja</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-blue-600 font-bold text-xl">2</span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Masukkan Kode</h3>
                        <p className="text-gray-600">Masukkan kode promo pada halaman checkout</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-blue-600 font-bold text-xl">3</span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Dapatkan Diskon</h3>
                        <p className="text-gray-600">Diskon akan diterapkan secara otomatis</p>
                    </div>
                </div>
            </div>

            {/* Terms & Conditions */}
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">Syarat & Ketentuan</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm">
                    <li>Promo berlaku untuk pembelian produk tertentu sesuai ketentuan masing-masing promo</li>
                    <li>Satu kode promo hanya dapat digunakan satu kali per transaksi</li>
                    <li>Promo tidak dapat digabungkan dengan promo lainnya</li>
                    <li>Promo berlaku hingga tanggal yang tertera atau hingga stok habis</li>
                    <li>MesinCuci Store berhak mengubah atau membatalkan promo tanpa pemberitahuan terlebih dahulu</li>
                </ul>
            </div>
        </div>
    );
};

export default PromoPage;
