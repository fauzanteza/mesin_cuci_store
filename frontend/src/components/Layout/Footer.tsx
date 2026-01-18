import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-12 pb-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold">MesinCuciStore</h3>
                        <p className="text-gray-400 text-sm">
                            Menyediakan mesin cuci berkualitas terbaik dengan harga terjangkau untuk kebutuhan rumah tangga dan laundry Anda.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition"><Facebook className="h-5 w-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition"><Instagram className="h-5 w-5" /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Tautan Cepat</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/products" className="hover:text-blue-400 transition">Produk</Link></li>
                            <li><Link to="/about" className="hover:text-blue-400 transition">Tentang Kami</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-400 transition">Hubungi Kami</Link></li>
                            <li><Link to="/faq" className="hover:text-blue-400 transition">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Layanan Pelanggan</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/orders" className="hover:text-blue-400 transition">Lacak Pesanan</Link></li>
                            <li><Link to="/policy" className="hover:text-blue-400 transition">Kebijakan Privasi</Link></li>
                            <li><Link to="/terms" className="hover:text-blue-400 transition">Syarat & Ketentuan</Link></li>
                            <li><Link to="/warranty" className="hover:text-blue-400 transition">Garansi</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Hubungi Kami</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 mr-3 flex-shrink-0 text-blue-500" />
                                <span>Jl. Teknologi No. 123, Jakarta Selatan, 12190</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 mr-3 text-blue-500" />
                                <span>+62 812 3456 7890</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 mr-3 text-blue-500" />
                                <span>support@mesincucistore.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Mesin Cuci Store. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
