import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, Package, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
// import { useCart } from '../../hooks/useCart'; // MiniCart handles this
import { SearchBar } from '../Common';
import MiniCart from '../Cart/MiniCart';
import MobileSidebar from './MobileSidebar';

const Header = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    // const { count } = useCart(); // MiniCart handles this
    const navigate = useNavigate();

    // const handleSearch = (query: string) => {
    //     if (query.trim()) {
    //         navigate(`/products?search=${encodeURIComponent(query)}`);
    //     }
    // };

    return (
        <>
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden text-gray-700 hover:text-blue-600 focus:outline-none"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-1">
                                MesinCuci<span className="text-gray-800">Store</span>
                            </Link>
                        </div>

                        {/* Search Bar - Desktop */}
                        <div className="hidden md:flex flex-1 max-w-xl mx-4">
                            <SearchBar placeholder="Cari mesin cuci, sparepart..." onSearch={(val: string) => { /* Debounce handled in page or enter key? For now simple input */ }} />
                        </div>

                        {/* Desktop Navigation Links (Optional/Secondary) */}
                        <nav className="hidden lg:flex space-x-6">
                            <Link to="/products" className="text-gray-600 hover:text-blue-600 font-medium">Produk</Link>
                            <Link to="/promos" className="text-gray-600 hover:text-blue-600 font-medium">Promo</Link>
                        </nav>

                        {/* Right Area: Cart & User */}
                        <div className="flex items-center space-x-4">
                            {/* MiniCart Component */}
                            <MiniCart />

                            {isAuthenticated ? (
                                <div className="hidden md:block relative group">
                                    <button className="flex items-center text-gray-700 hover:text-blue-600 focus:outline-none gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium max-w-[100px] truncate">{user?.name}</span>
                                    </button>

                                    {/* Dropdown */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100 hidden group-hover:block animate-fade-in z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-semibold">{user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>

                                        {user?.role === 'admin' && (
                                            <Link to="/admin" className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                <LayoutDashboard size={14} />
                                                Admin Panel
                                            </Link>
                                        )}

                                        <Link to="/profile" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                            <User size={14} />
                                            Profil Saya
                                        </Link>
                                        <Link to="/orders" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                            <Package size={14} />
                                            Pesanan Saya
                                        </Link>

                                        <div className="border-t border-gray-100 mt-1 pt-1">
                                            <button
                                                onClick={() => { logout(); navigate('/login'); }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <LogOut size={14} />
                                                Keluar
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center space-x-3">
                                    <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2">
                                        Masuk
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
                                    >
                                        Daftar
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Search Bar (visible only on small screens) */}
                    <div className="md:hidden pb-3">
                        <SearchBar placeholder="Cari produk..." />
                    </div>
                </div>
            </header>

            <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
    );
};

export default Header;
