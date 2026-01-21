import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import authService from '../../services/authService'
import './Auth.css'

export interface RegisterInputs {
    name: string
    email: string
    password: string
    confirmPassword?: string
    phone?: string
}

const RegisterPage = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [verifiedEmail, setVerifiedEmail] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        trigger
    } = useForm<RegisterInputs>()

    const password = watch('password')

    const nextStep = async () => {
        if (currentStep === 1) {
            const isValid = await trigger(['name', 'email', 'phone', 'password', 'confirmPassword'])
            if (isValid) {
                setVerifiedEmail(watch('email'))
                setCurrentStep(2)
            }
        } else if (currentStep === 2) {
            // Verify logic here (mocked for now)
            await handleRegister()
        }
    }

    const prevStep = () => {
        setCurrentStep(currentStep - 1)
    }

    const handleRegister = async () => {
        setIsLoading(true)
        try {
            const data = watch()
            const { confirmPassword, ...registerData } = data
            await authService.register(registerData)
            setCurrentStep(3) // Move to success step
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.'
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
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

                <div>
                    <Link to="/cart" className="cart-btn" style={{ color: 'var(--dark)', marginRight: '1rem' }}>
                        <i className="fas fa-shopping-cart"></i>
                    </Link>
                </div>
            </header>

            <div className="auth-container">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <h1 className="welcome-title">Bergabunglah Dengan Kami</h1>
                    <p className="welcome-subtitle">
                        Daftar sekarang dan nikmati berbagai keuntungan eksklusif untuk member MesinCuci Store.
                    </p>

                    <div className="features">
                        <div className="feature">
                            <div className="feature-icon">
                                <i className="fas fa-gift"></i>
                            </div>
                            <div>
                                <h4>Voucher Selamat Datang</h4>
                                <p>Dapatkan diskon 10% untuk pembelian pertama</p>
                            </div>
                        </div>

                        <div className="feature">
                            <div className="feature-icon">
                                <i className="fas fa-history"></i>
                            </div>
                            <div>
                                <h4>Riwayat Order</h4>
                                <p>Pantau semua pesanan Anda di satu tempat</p>
                            </div>
                        </div>

                        <div className="feature">
                            <div className="feature-icon">
                                <i className="fas fa-bell"></i>
                            </div>
                            <div>
                                <h4>Notifikasi Promo</h4>
                                <p>Dapatkan info promo eksklusif langsung di email</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Register Form */}
                <div className="register-form">
                    <h2 className="form-title">Buat Akun Baru</h2>
                    <p className="form-subtitle">Isi data berikut untuk mulai berbelanja</p>

                    {/* Progress Bar */}
                    <div className="progress-bar">
                        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                            <div className="step-number">1</div>
                            <div className="step-label">Data Diri</div>
                        </div>
                        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                            <div className="step-number">2</div>
                            <div className="step-label">Verifikasi</div>
                        </div>
                        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                            <div className="step-number">3</div>
                            <div className="step-label">Selesai</div>
                        </div>
                    </div>

                    {/* Step 1: Personal Info */}
                    <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
                        <form>
                            <div className="form-group">
                                <label className="form-label" htmlFor="name">Nama Lengkap</label>
                                <input
                                    type="text"
                                    id="name"
                                    className="form-control"
                                    placeholder="Fauzan Teza Saputra"
                                    {...register('name', { required: 'Nama lengkap wajib diisi' })}
                                />
                                {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-control"
                                    placeholder="fauzan2@gmail.com"
                                    {...register('email', { required: 'Email wajib diisi' })}
                                />
                                <small style={{ color: 'var(--secondary)', marginTop: '0.25rem', display: 'block' }}>
                                    Kami akan mengirim email verifikasi ke alamat ini
                                </small>
                                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="phone">Nomor Telepon</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input
                                        type="tel"
                                        id="phone"
                                        className="form-control"
                                        placeholder="081234567890"
                                        {...register('phone')}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="password">Password</label>
                                <div className="password-input">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        className="form-control"
                                        placeholder="Minimal 8 karakter"
                                        {...register('password', {
                                            required: 'Password wajib diisi',
                                            minLength: { value: 8, message: 'Password minimal 8 karakter' }
                                        })}
                                    />
                                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                        <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                <small style={{ color: 'var(--secondary)', marginTop: '0.25rem', display: 'block' }}>
                                    Minimal 8 karakter dengan kombinasi huruf dan angka
                                </small>
                                {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="confirmPassword">Konfirmasi Password</label>
                                <div className="password-input">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        className="form-control"
                                        placeholder="Ulangi password"
                                        {...register('confirmPassword', {
                                            validate: value => value === password || 'Password tidak cocok'
                                        })}
                                    />
                                    <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <i className={`far ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>}
                            </div>

                            <div className="terms-checkbox">
                                <input type="checkbox" id="terms" required />
                                <label htmlFor="terms">
                                    Saya setuju dengan <Link to="/terms">Syarat & Ketentuan</Link>
                                    dan <Link to="/privacy-policy">Kebijakan Privasi</Link> MesinCuci Store
                                </label>
                            </div>

                            <div className="form-buttons">
                                <button type="button" className="btn-secondary" onClick={() => navigate('/login')}>
                                    <i className="fas fa-arrow-left"></i> Kembali
                                </button>
                                <button type="button" className="btn-primary" onClick={nextStep}>
                                    Lanjut <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Step 2: Verification */}
                    <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                                <i className="fas fa-envelope-open-text"></i>
                            </div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Verifikasi Email</h3>
                            <p style={{ color: 'var(--secondary)' }}>
                                Kami telah mengirim kode verifikasi ke <strong>{verifiedEmail}</strong>
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Kode Verifikasi (Mock)</label>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                {[...Array(6)].map((_, i) => (
                                    <input key={i} type="text" maxLength={1} className="form-control verification-input" style={{ textAlign: 'center', fontSize: '1.5rem' }} />
                                ))}
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                            <p style={{ color: 'var(--secondary)' }}>
                                Tidak menerima kode?
                                <button style={{ color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', marginLeft: '0.5rem' }}>Kirim ulang (60)</button>
                            </p>
                        </div>

                        <div className="form-buttons">
                            <button type="button" className="btn-secondary" onClick={prevStep}>
                                <i className="fas fa-arrow-left"></i> Kembali
                            </button>
                            <button type="button" className="btn-primary" onClick={nextStep} disabled={isLoading}>
                                {isLoading ? 'Verifikasi...' : <>Verifikasi <i className="fas fa-check"></i></>}
                            </button>
                        </div>
                    </div>

                    {/* Step 3: Complete */}
                    <div className={`form-step ${currentStep === 3 ? 'active' : ''}`}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '4rem', color: 'var(--success)', marginBottom: '1rem' }}>
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Pendaftaran Berhasil!</h3>
                            <p style={{ color: 'var(--secondary)' }}>
                                Selamat datang di MesinCuci Store. Akun Anda telah berhasil dibuat.
                            </p>
                        </div>

                        <div className="form-group" style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Voucher Selamat Datang</h4>
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '2px dashed var(--primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>DISKON10</strong>
                                        <p style={{ color: 'var(--secondary)', margin: '0.25rem 0 0' }}>Diskon 10% untuk pembelian pertama</p>
                                    </div>
                                    <button type="button" className="btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => toast.success('Kode voucher disalin!')}>
                                        Salin
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button type="button" className="btn-primary" onClick={() => navigate('/user/dashboard')}>
                            Mulai Berbelanja <i className="fas fa-shopping-cart"></i>
                        </button>
                    </div>

                    <div className="register-link">
                        Sudah punya akun? <Link to="/login">Masuk disini</Link>
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

export default RegisterPage
