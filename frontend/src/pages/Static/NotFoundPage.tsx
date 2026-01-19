import { Link } from 'react-router-dom'

const NotFoundPage = () => {
    return (
        <div className="container mx-auto py-24 px-4 text-center">
            <h1 className="text-6xl font-bold mb-6 text-primary-600">404</h1>
            <h2 className="text-2xl font-bold mb-4">Halaman Tidak Ditemukan</h2>
            <p className="mb-8 text-gray-600">Maaf, halaman yang Anda cari tidak tersedia.</p>
            <Link to="/" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium">
                Kembali ke Beranda
            </Link>
        </div>
    )
}

export default NotFoundPage
