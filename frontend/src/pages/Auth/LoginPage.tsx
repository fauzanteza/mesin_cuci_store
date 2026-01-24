import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react' // Keeping for loading state if needed, though user design uses standard buttons
// Importing FontAwesome via CDN in index.html is preferred if not installed
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice'
import authService from '../../services/authService'
import { RootState } from '../../store'
import './Auth.css' // Import the custom CSS

export interface LoginInputs {
    email: string
    password: string
}

const LoginPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { isLoading } = useSelector((state: RootState) => state.auth)
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInputs>()

    const togglePassword = () => {
        setShowPassword(!showPassword)
    }

    const onSubmit = async (data: LoginInputs) => {
        dispatch(loginStart())
        try {
            const response = await authService.login(data)
            dispatch(
                loginSuccess({
                    user: response.user,
                    token: response.token,
                })
            )
            toast.success('Login berhasil! Selamat datang kembali.')
            navigate('/')
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || 'Gagal login. Periksa email dan password.'
            dispatch(loginFailure(errorMessage))
            toast.error(errorMessage)
        }
    }

    return (
        <div className="auth-body">
            {/* Main Content */}
            <div className="auth-container">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <h1 className="welcome-title">Selamat Datang di MesinCuci Store</h1>
                    <p className="welcome-subtitle">
                        Temukan mesin cuci berkualitas terbaik untuk kebutuhan rumah tangga dan laundry Anda.
                        Nikmati pengalaman belanja yang mudah, aman, dan terpercaya.
                    </p>

                    <div className="features">
                        <div className="feature">
                            <div className="feature-icon">
                                <i className="fas fa-shipping-fast"></i>
                            </div>
                            <div>
                                <h4>Gratis Ongkir</h4>
                                <p>Gratis pengiriman untuk order di atas Rp 2.000.000</p>
                            </div>
                        </div>

                        <div className="feature">
                            <div className="feature-icon">
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <div>
                                <h4>Garansi Resmi</h4>
                                <p>Semua produk dilengkapi garansi resmi 1-2 tahun</p>
                            </div>
                        </div>

                        <div className="feature">
                            <div className="feature-icon">
                                <i className="fas fa-headset"></i>
                            </div>
                            <div>
                                <h4>Bantuan 24/7</h4>
                                <p>Customer service siap membantu kapan saja</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Form */}
                <div className="login-form">
                    <h2 className="form-title">Masuk ke Akun Anda</h2>
                    <p className="form-subtitle">Silakan masukkan email dan password Anda</p>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="form-control"
                                placeholder="contoh@email.com"
                                {...register('email', { required: 'Email is required' })}
                            />
                            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <div className="password-input">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="form-control"
                                    placeholder="Masukkan password"
                                    {...register('password', { required: 'Password is required' })}
                                />
                                <button type="button" className="password-toggle" onClick={togglePassword}>
                                    <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                            {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                        </div>

                        <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <input type="checkbox" id="remember" />
                                <label htmlFor="remember" style={{ color: 'var(--secondary)', marginLeft: '0.5rem' }}>Ingat saya</label>
                            </div>
                            <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Lupa password?</Link>
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <i className="fas fa-sign-in-alt"></i>}
                            {isLoading ? 'Loading...' : 'Masuk'}
                        </button>

                        <div className="divider">atau lanjutkan dengan</div>

                        <div className="social-login">
                            <button type="button" className="social-btn">
                                <i className="fab fa-google" style={{ color: '#DB4437' }}></i>
                            </button>
                            <button type="button" className="social-btn">
                                <i className="fab fa-facebook-f" style={{ color: '#4267B2' }}></i>
                            </button>
                            <button type="button" className="social-btn">
                                <i className="fab fa-apple" style={{ color: '#000' }}></i>
                            </button>
                        </div>

                        <div className="register-link">
                            Belum punya akun? <Link to="/register">Daftar sekarang</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
