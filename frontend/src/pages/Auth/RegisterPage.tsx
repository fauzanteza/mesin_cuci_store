import React from 'react'
import { Link } from 'react-router-dom'

const RegisterPage = () => {
    return (
        <div className="container mx-auto py-12 px-4 flex justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Daftar</h1>
                <p className="mb-4 text-center">Form registrasi belum diimplementasikan.</p>
                <div className="text-center">
                    <Link to="/login" className="text-primary-600 hover:underline">Sudah punya akun? Masuk</Link>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
