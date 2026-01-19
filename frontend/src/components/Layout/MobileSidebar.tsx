import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, ShoppingBag, User, LogIn, Percent, Layers, HelpCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white">
                    <h2 className="font-bold text-lg">Menu</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col h-full overflow-y-auto pb-20">
                    {/* User Section */}
                    <div className="p-4 border-b bg-gray-50">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" onClick={onClose} className="flex items-center gap-2 text-blue-600 font-medium">
                                <LogIn size={20} />
                                <span>Masuk / Daftar</span>
                            </Link>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="p-4 space-y-2">
                        <Link
                            to="/"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Home size={20} />
                            <span>Beranda</span>
                        </Link>
                        <Link
                            to="/products"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/products') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <ShoppingBag size={20} />
                            <span>Produk</span>
                        </Link>
                        <Link
                            to="/categories"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/categories') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Layers size={20} />
                            <span>Kategori</span>
                        </Link>
                        <Link
                            to="/promos"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/promos') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Percent size={20} />
                            <span>Promo</span>
                        </Link>
                        <Link
                            to="/help"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/help') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <HelpCircle size={20} />
                            <span>Bantuan</span>
                        </Link>
                    </nav>

                    {/* Auth Actions */}
                    {user && (
                        <div className="mt-auto p-4 border-t">
                            <Link to="/profile" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                                <User size={20} />
                                <span>Akun Saya</span>
                            </Link>
                            <button
                                onClick={() => { logout(); onClose(); }}
                                className="w-full text-left flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogIn size={20} className="rotate-180" />
                                <span>Keluar</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default MobileSidebar;
