import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice'
import authService from '../../services/authService'
import { RootState } from '../../store'
import Button from '../../components/UI/Button'

// Export interface for use in authService
export interface LoginInputs {
    email: string
    password: string
}

const LoginPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { isLoading } = useSelector((state: RootState) => state.auth)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInputs>()

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
        <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[60vh]">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Selamat Datang</h1>
                    <p className="text-gray-500 mt-2">Silakan masuk ke akun Anda</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="nama@email.com"
                            className={`w-full px-4 py-2 rounded-lg border ${errors.email
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-primary-500'
                                } focus:outline-none focus:ring-2 transition-all`}
                            {...register('email', {
                                required: 'Email harus diisi',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Format email tidak valid',
                                },
                            })}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            {/* Forgot password link could go here */}
                        </div>
                        <input
                            id="password"
                            type="password"
                            placeholder="********"
                            className={`w-full px-4 py-2 rounded-lg border ${errors.password
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-primary-500'
                                } focus:outline-none focus:ring-2 transition-all`}
                            {...register('password', {
                                required: 'Password harus diisi',
                                minLength: {
                                    value: 6,
                                    message: 'Password minimal 6 karakter',
                                },
                            })}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Memproses...' : 'Masuk'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Belum punya akun?{' '}
                    <Link
                        to="/register"
                        className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
                    >
                        Daftar sekarang
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
