import React from 'react'
import { Outlet } from 'react-router-dom'
// Placeholder for Header and Footer
// In a real app these would be in components/Layout
import { Link } from 'react-router-dom'
import { ShoppingCart, User, Search } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

const Header = () => {
    const { totalQuantity } = useSelector((state: RootState) => state.cart)
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-primary-600">
                    MesinCuci<span className="text-gray-900">Store</span>
                </Link>

                <div className="hidden md:flex flex-1 max-w-lg mx-8">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Cari mesin cuci..."
                            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        />
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <Link to="/cart" className="relative text-gray-600 hover:text-primary-600">
                        <ShoppingCart className="w-6 h-6" />
                        {totalQuantity > 0 && (
                            <span className="absolute -top-2 -right-2 bg-danger-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {totalQuantity}
                            </span>
                        )}
                    </Link>

                    {isAuthenticated ? (
                        <Link to={user?.role === 'admin' ? '/admin' : '/profile'} className="flex items-center space-x-2 text-gray-600 hover:text-primary-600">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                            ) : (
                                <User className="w-6 h-6" />
                            )}
                            <span className="hidden md:inline font-medium">{user?.name}</span>
                        </Link>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium">Masuk</Link>
                            <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium">Daftar</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

const Footer = () => (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div>
                    <h3 className="text-xl font-bold mb-4">MesinCuciStore</h3>
                    <p className="text-gray-400">Solusi terbaik untuk kebutuhan mencuci Anda. Hemat, Bersih, dan Terpercaya.</p>
                </div>
                <div>
                    <h4 className="font-bold mb-4">Layanan</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li><Link to="/products" className="hover:text-white">Produk</Link></li>
                        <li><Link to="/about" className="hover:text-white">Tentang Kami</Link></li>
                        <li><Link to="/contact" className="hover:text-white">Hubungi Kami</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4">Bantuan</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                        <li><Link to="/shipping" className="hover:text-white">Pengiriman</Link></li>
                        <li><Link to="/returns" className="hover:text-white">Pengembalian</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4">Hubungi Kami</h4>
                    <p className="text-gray-400">Jl. Teknologi No. 123<br />Jakarta Selatan, 12345<br />support@mesincucistore.com<br />021-1234-5678</p>
                </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
                &copy; {new Date().getFullYear()} Mesin Cuci Store. All rights reserved.
            </div>
        </div>
    </footer>
)

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default Layout
