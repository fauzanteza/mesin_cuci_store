import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../Auth/Auth.css' // Reusing Auth.css for consistency

const NotFoundPage = () => {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <div className="auth-body">
            {/* Header */}
            <header className="auth-header">
                <Link to="/" className="auth-logo">
                    <div className="auth-logo-icon">
                        <i className="fas fa-soap"></i>
                    </div>
                    <div className="auth-logo-text">MesinCuci Store</div>
                </Link>

                <div className="auth-search-bar">
                    <i className="fas fa-search auth-search-icon"></i>
                    <input type="text" placeholder="Cari mesin cuci, sparepart..." />
                </div>

                <nav>
                    <Link to="/" style={{ color: 'var(--dark)', textDecoration: 'none', marginRight: '1.5rem' }}>Beranda</Link>
                    <Link to="/products" style={{ color: 'var(--dark)', textDecoration: 'none', marginRight: '1.5rem' }}>Produk</Link>
                    <Link to="/cart" style={{ color: 'var(--dark)', textDecoration: 'none' }}><i className="fas fa-shopping-cart"></i></Link>
                </nav>
            </header>

            {/* 404 Content */}
            <div className="error-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 1rem' }}>
                <div className="error-icon" style={{ fontSize: '8rem', color: 'var(--primary)', marginBottom: '2rem', animation: 'float 3s ease-in-out infinite' }}>
                    <i className="fas fa-search"></i>
                </div>

                <div className="error-code" style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '1rem', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    404
                </div>
                <h1 className="error-title" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '1rem' }}>Halaman Tidak Ditemukan</h1>
                <p className="error-message" style={{ fontSize: '1.2rem', color: 'var(--secondary)', maxWidth: '600px', marginBottom: '3rem', lineHeight: '1.6' }}>
                    Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
                    Mungkin Anda salah mengetik URL atau halaman telah dihapus.
                </p>

                <div className="action-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
                    <Link to="/" className="btn-primary" style={{ textDecoration: 'none', width: 'auto' }}>
                        <i className="fas fa-home"></i> Kembali ke Beranda
                    </Link>
                    <button onClick={() => navigate(-1)} className="btn-secondary" style={{ width: 'auto' }}>
                        <i className="fas fa-arrow-left"></i> Kembali ke Halaman Sebelumnya
                    </button>
                    <Link to="/contact" className="btn-secondary" style={{ textDecoration: 'none', width: 'auto' }}>
                        <i className="fas fa-headset"></i> Hubungi Bantuan
                    </Link>
                </div>

                <div className="search-suggestions" style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', maxWidth: '800px', width: '100%', marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--dark)' }}>Mungkin yang Anda cari:</h3>
                    <div className="suggestions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <Link to="/products" className="feature" style={{ textDecoration: 'none', color: 'var(--dark)', boxShadow: 'none', background: 'var(--light)', transition: 'all 0.3s' }}>
                            <div className="feature-icon" style={{ fontSize: '1.25rem', width: '40px', height: '40px' }}>
                                <i className="fas fa-soap"></i>
                            </div>
                            <div>
                                <strong style={{ display: 'block' }}>Mesin Cuci</strong>
                                <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Top Loading, Front Loading, dll</p>
                            </div>
                        </Link>

                        <Link to="/products?category=sparepart" className="feature" style={{ textDecoration: 'none', color: 'var(--dark)', boxShadow: 'none', background: 'var(--light)', transition: 'all 0.3s' }}>
                            <div className="feature-icon" style={{ fontSize: '1.25rem', width: '40px', height: '40px' }}>
                                <i className="fas fa-cogs"></i>
                            </div>
                            <div>
                                <strong style={{ display: 'block' }}>Sparepart</strong>
                                <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Suku cadang & aksesoris</p>
                            </div>
                        </Link>

                        <Link to="/faq" className="feature" style={{ textDecoration: 'none', color: 'var(--dark)', boxShadow: 'none', background: 'var(--light)', transition: 'all 0.3s' }}>
                            <div className="feature-icon" style={{ fontSize: '1.25rem', width: '40px', height: '40px' }}>
                                <i className="fas fa-question-circle"></i>
                            </div>
                            <div>
                                <strong style={{ display: 'block' }}>FAQ</strong>
                                <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Pertanyaan umum</p>
                            </div>
                        </Link>

                        <Link to="/about" className="feature" style={{ textDecoration: 'none', color: 'var(--dark)', boxShadow: 'none', background: 'var(--light)', transition: 'all 0.3s' }}>
                            <div className="feature-icon" style={{ fontSize: '1.25rem', width: '40px', height: '40px' }}>
                                <i className="fas fa-info-circle"></i>
                            </div>
                            <div>
                                <strong style={{ display: 'block' }}>Tentang Kami</strong>
                                <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Profil perusahaan</p>
                            </div>
                        </Link>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <p style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>Atau coba cari sesuatu yang lain:</p>
                        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
                            <input
                                type="text"
                                placeholder="Cari produk, artikel, atau bantuan..."
                                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', border: '2px solid var(--border)', borderRadius: '50px', fontSize: '1rem' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }}></i>
                            <button
                                onClick={handleSearch}
                                style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '50px', cursor: 'pointer' }}
                            >
                                Cari
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="auth-footer">
                <div className="footer-grid">
                    <div className="footer-section">
                        <h3>MesinCuci Store</h3>
                        <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                            Menyediakan mesin cuci berkualitas terbaik dengan harga terjangkau
                            untuk kebutuhan rumah tangga dan laundry Anda.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <a href="#" style={{ color: 'white' }}><i className="fab fa-facebook fa-lg"></i></a>
                            <a href="#" style={{ color: 'white' }}><i className="fab fa-instagram fa-lg"></i></a>
                            <a href="#" style={{ color: 'white' }}><i className="fab fa-twitter fa-lg"></i></a>
                            <a href="#" style={{ color: 'white' }}><i className="fab fa-youtube fa-lg"></i></a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h3>Tautan Cepat</h3>
                        <ul className="footer-links">
                            <li><Link to="/products">Produk</Link></li>
                            <li><Link to="/about">Tentang Kami</Link></li>
                            <li><Link to="/contact">Hubungi Kami</Link></li>
                            <li><Link to="/faq">FAQ</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Layanan Pelanggan</h3>
                        <ul className="footer-links">
                            <li><Link to="/track-order">Lacak Pesanan</Link></li>
                            <li><Link to="/privacy-policy">Kebijakan Privasi</Link></li>
                            <li><Link to="/terms">Syarat & Ketentuan</Link></li>
                            <li><Link to="/warranty">Garansi</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Hubungi Kami</h3>
                        <div className="contact-info">
                            <div className="contact-item">
                                <i className="fas fa-map-marker-alt"></i>
                                <span>JL. Teknologi No. 123, Jakarta Selatan, 12190</span>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-phone"></i>
                                <span>+62 812 3456 7890</span>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-envelope"></i>
                                <span>support@mesincuci.store</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2024 MesinCuci Store. Hak Cipta Dilindungi.</p>
                </div>
            </footer>
        </div>
    )
}

export default NotFoundPage
