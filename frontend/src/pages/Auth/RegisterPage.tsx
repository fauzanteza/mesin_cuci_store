import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

import { authService } from '../../services/auth.service'
import Button from '../../components/UI/Button'

// Export interface for use in authService
export interface RegisterInputs {
    name: string
    email: string
    password: string
    confirmPassword?: string
}

const RegisterPage = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = React.useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<RegisterInputs>()

    const password = watch('password')

    const onSubmit = async (data: RegisterInputs) => {
        setIsLoading(true)
        try {
            // Remove confirmPassword before sending to API if needed, 
            // but usually API ignores extra fields or we create a new object
            const { confirmPassword, ...registerData } = data

            await authService.register(registerData)
            toast.success('Registrasi berhasil! Silakan login.')
            navigate('/login')
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.'
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[60vh]">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Daftar Akun</h1>
                    <p className="text-gray-500 mt-2">Buat akun baru untuk mulai belanja</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Nama Lengkap
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Nama Anda"
                            className={`w-full px-4 py-2 rounded-lg border ${errors.name
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-primary-500'
                                } focus:outline-none focus:ring-2 transition-all`}
                            {...register('name', {
                                required: 'Nama harus diisi',
                            })}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

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
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Password
                        </label>
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

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Konfirmasi Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="********"
                            className={`w-full px-4 py-2 rounded-lg border ${errors.confirmPassword
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-primary-500'
                                } focus:outline-none focus:ring-2 transition-all`}
                            {...register('confirmPassword', {
                                required: 'Konfirmasi password harus diisi',
                                validate: (value) =>
                                    value === password || 'Password tidak cocok',
                            })}
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.confirmPassword.message}
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
                        {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Sudah punya akun?{' '}
                    <Link
                        to="/login"
                        className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
                    >
                        Masuk disini
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
