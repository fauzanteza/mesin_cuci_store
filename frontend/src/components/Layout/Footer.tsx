import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
    const currentYear = new Date().getFullYear();

    // Handle Scroll for Back to Top
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = (e: React.MouseEvent) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const toggleAccordion = (section: string) => {
        setActiveAccordion(activeAccordion === section ? null : section);
    };

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const input = form.querySelector('input');

        if (input && input.value) {
            alert('Terima kasih telah berlangganan newsletter kami!');
            input.value = '';
        } else {
            alert('Harap masukkan alamat email');
        }
    };

    return (
        <>
            {/* DESKTOP FOOTER */}
            <footer className="footer">
                <div className="footer-container">
                    {/* Footer Grid */}
                    <div className="footer-grid">
                        {/* About Section */}
                        <div className="footer-section footer-about">
                            <Link to="/" className="footer-logo">
                                <div className="logo-icon">
                                    <i className="fas fa-washing-machine"></i>
                                </div>
                                <span className="logo-text">MesinCuci Store</span>
                            </Link>

                            <p>
                                Menyediakan mesin cuci berkualitas terbaik dengan harga terjangkau
                                untuk kebutuhan rumah tangga dan laundry Anda. Kami berkomitmen
                                memberikan pelayanan terbaik dan produk berkualitas.
                            </p>

                            <div className="social-links">
                                <a href="#" className="social-link" aria-label="Facebook">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="#" className="social-link" aria-label="Instagram">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a href="#" className="social-link" aria-label="Twitter">
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a href="#" className="social-link" aria-label="YouTube">
                                    <i className="fab fa-youtube"></i>
                                </a>
                                <a href="#" className="social-link" aria-label="TikTok">
                                    <i className="fab fa-tiktok"></i>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer-section footer-links">
                            <h3>Tautan Cepat</h3>
                            <ul>
                                <li>
                                    <Link to="/products">
                                        <i className="fas fa-chevron-right"></i>
                                        <span>Produk</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/about">
                                        <i className="fas fa-chevron-right"></i>
                                        <span>Tentang Kami</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact">
                                        <i className="fas fa-chevron-right"></i>
                                        <span>Hubungi Kami</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/faq">
                                        <i className="fas fa-chevron-right"></i>
                                        <span>FAQ</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/blog">
                                        <i className="fas fa-chevron-right"></i>
                                        <span>Blog & Tips</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/promo">
                                        <i className="fas fa-chevron-right"></i>
                                        <span>Promo & Diskon</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Customer Service */}
                        <div className="footer-section footer-links">
                            <h3>Layanan Pelanggan</h3>
                            <ul>
                                <li>
                                    <Link to="/track-order">
                                        <i className="fas fa-chevron-right"></i>
                                        <span>Lacak Pesanan</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/privacy">
                                        <i className="fas fa-chevron-right"></i>
                                        <span>Kebijakan Privasi</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms">
                                        <i className="fas fa-chevron-right"></i>
                                        <span>Syarat & Ketentuan</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/warranty">
                                        <i className="fas fa-chevron-right"></i>
                                        <span>Garansi</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/return-policy">
                                        <i className="fas fa-chevron-right"></i>
                                        <span>Kebijakan Pengembalian</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/shipping">
                                        <i className="fas fa-chevron-right"></i>
                                        <span>Pengiriman</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="footer-section">
                            <h3>Hubungi Kami</h3>
                            <div className="contact-info">
                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <i className="fas fa-map-marker-alt"></i>
                                    </div>
                                    <div className="contact-details">
                                        <h4>Alamat</h4>
                                        <p>
                                            JL. Teknologi No. 123<br />
                                            Jakarta Selatan, 12190<br />
                                            Indonesia
                                        </p>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <i className="fas fa-phone"></i>
                                    </div>
                                    <div className="contact-details">
                                        <h4>Telepon</h4>
                                        <p>
                                            <a href="tel:+6281234567890">+62 812 3456 7890</a><br />
                                            <a href="tel:+62211234567">+62 21 1234 567</a>
                                        </p>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <div className="contact-details">
                                        <h4>Email</h4>
                                        <p>
                                            <a href="mailto:support@mesincuci.store">support@mesincuci.store</a><br />
                                            <a href="mailto:sales@mesincuci.store">sales@mesincuci.store</a>
                                        </p>
                                    </div>
                                </div>

                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                    <div className="contact-details">
                                        <h4>Jam Operasional</h4>
                                        <p>
                                            Senin - Jumat: 08:00 - 17:00<br />
                                            Sabtu: 08:00 - 15:00
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Newsletter Subscription */}
                            <div className="newsletter">
                                <h4>Berlangganan Newsletter</h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                    Dapatkan info promo & tips perawatan mesin cuci
                                </p>
                                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                                    <input
                                        type="email"
                                        className="newsletter-input"
                                        placeholder="Email Anda"
                                        required
                                    />
                                    <button type="submit" className="newsletter-btn">
                                        <i className="fas fa-paper-plane"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="footer-bottom">
                        <div className="footer-bottom-content">
                            <div className="copyright">
                                &copy; 1999-{currentYear} <strong>MesinCuci Store</strong>. Hak Cipta Dilindungi.
                            </div>

                            <div className="payment-methods">
                                <div className="payment-method">BCA</div>
                                <div className="payment-method">MDR</div>
                                <div className="payment-method">BRI</div>
                                <div className="payment-method">BNI</div>
                                <div className="payment-method">GOPAY</div>
                                <div className="payment-method">OVO</div>
                                <div className="payment-method">DANA</div>
                            </div>

                            <div className="footer-links-bottom">
                                <Link to="/sitemap">Peta Situs</Link>
                                <Link to="/careers">Karir</Link>
                                <Link to="/affiliate">Program Afiliasi</Link>
                                <Link to="/partnership">Kemitraan</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* MOBILE FOOTER */}
            <footer className="mobile-footer">
                {/* Header */}
                <div className="footer-header">
                    <Link to="/" className="mobile-logo">
                        <div className="mobile-logo-icon">
                            <i className="fas fa-washing-machine"></i>
                        </div>
                        <span className="mobile-logo-text">MesinCuci Store</span>
                    </Link>

                    <div className="mobile-social">
                        <a href="#" className="mobile-social-link">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="#" className="mobile-social-link">
                            <i className="fab fa-whatsapp"></i>
                        </a>
                    </div>
                </div>

                {/* Quick Links Accordion */}
                <div className="footer-accordion">
                    <div
                        className={`accordion-header ${activeAccordion === 'quick-links' ? 'active' : ''}`}
                        onClick={() => toggleAccordion('quick-links')}
                    >
                        <h3>Tautan Cepat</h3>
                        <span className="accordion-icon">
                            <i className="fas fa-chevron-down"></i>
                        </span>
                    </div>
                    <div className={`accordion-content ${activeAccordion === 'quick-links' ? 'active' : ''}`}>
                        <ul className="mobile-links">
                            <li><Link to="/products"><i className="fas fa-box"></i> Produk</Link></li>
                            <li><Link to="/about"><i className="fas fa-info-circle"></i> Tentang Kami</Link></li>
                            <li><Link to="/contact"><i className="fas fa-phone"></i> Hubungi Kami</Link></li>
                            <li><Link to="/faq"><i className="fas fa-question-circle"></i> FAQ</Link></li>
                            <li><Link to="/promo"><i className="fas fa-tag"></i> Promo</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Customer Service Accordion */}
                <div className="footer-accordion">
                    <div
                        className={`accordion-header ${activeAccordion === 'customer-service' ? 'active' : ''}`}
                        onClick={() => toggleAccordion('customer-service')}
                    >
                        <h3>Layanan Pelanggan</h3>
                        <span className="accordion-icon">
                            <i className="fas fa-chevron-down"></i>
                        </span>
                    </div>
                    <div className={`accordion-content ${activeAccordion === 'customer-service' ? 'active' : ''}`}>
                        <ul className="mobile-links">
                            <li><Link to="/track-order"><i className="fas fa-truck"></i> Lacak Pesanan</Link></li>
                            <li><Link to="/privacy"><i className="fas fa-shield-alt"></i> Kebijakan Privasi</Link></li>
                            <li><Link to="/terms"><i className="fas fa-file-contract"></i> Syarat & Ketentuan</Link></li>
                            <li><Link to="/warranty"><i className="fas fa-certificate"></i> Garansi</Link></li>
                            <li><Link to="/return-policy"><i className="fas fa-exchange-alt"></i> Pengembalian</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="mobile-contact">
                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1rem' }}>Hubungi Kami</h3>

                    <div className="contact-item-mobile">
                        <div className="contact-icon-mobile">
                            <i className="fas fa-map-marker-alt"></i>
                        </div>
                        <div className="contact-details-mobile">
                            <h4>Alamat</h4>
                            <p>JL. Teknologi No. 123, Jakarta Selatan</p>
                        </div>
                    </div>

                    <div className="contact-item-mobile">
                        <div className="contact-icon-mobile">
                            <i className="fas fa-phone"></i>
                        </div>
                        <div className="contact-details-mobile">
                            <h4>Telepon</h4>
                            <p><a href="tel:+6281234567890" style={{ color: '#cbd5e1' }}>+62 812 3456 7890</a></p>
                        </div>
                    </div>

                    <div className="contact-item-mobile">
                        <div className="contact-icon-mobile">
                            <i className="fas fa-envelope"></i>
                        </div>
                        <div className="contact-details-mobile">
                            <h4>Email</h4>
                            <p><a href="mailto:support@mesincuci.store" style={{ color: '#cbd5e1' }}>support@mesincuci.store</a></p>
                        </div>
                    </div>
                </div>

                {/* Newsletter */}
                <div className="mobile-newsletter">
                    <h4>Berlangganan Newsletter</h4>
                    <form className="mobile-newsletter-form" onSubmit={handleNewsletterSubmit}>
                        <input
                            type="email"
                            className="mobile-newsletter-input"
                            placeholder="Email Anda"
                            required
                        />
                        <button type="submit" className="mobile-newsletter-btn">
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>

                {/* App Download */}
                <div className="app-download">
                    <a href="#" className="app-store-btn">
                        <i className="fab fa-apple"></i>
                        <div>
                            <div style={{ fontSize: '0.625rem' }}>Download on the</div>
                            <div style={{ fontWeight: 600 }}>App Store</div>
                        </div>
                    </a>
                    <a href="#" className="play-store-btn">
                        <i className="fab fa-google-play"></i>
                        <div>
                            <div style={{ fontSize: '0.625rem' }}>GET IT ON</div>
                            <div style={{ fontWeight: 600 }}>Google Play</div>
                        </div>
                    </a>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom-mobile">
                    <div className="payment-methods-mobile">
                        <div className="payment-method-mobile">BCA</div>
                        <div className="payment-method-mobile">MDR</div>
                        <div className="payment-method-mobile">BRI</div>
                        <div className="payment-method-mobile">GOPAY</div>
                        <div className="payment-method-mobile">OVO</div>
                    </div>

                    <div className="copyright-mobile">
                        &copy; {currentYear} MesinCuci Store. Hak Cipta Dilindungi.
                    </div>
                </div>
            </footer>

            {/* Back to Top Button and WhatsApp Float Button removed per user request */}
            {/*
            <a
                href="#"
                className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Kembali ke atas"
            >
                <i className="fas fa-chevron-up"></i>
            </a>

            <a
                href="https://wa.me/6281234567890"
                className="whatsapp-float"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat via WhatsApp"
            >
                <i className="fab fa-whatsapp"></i>
            </a>
            */}
        </>
    );
};

export default Footer;
