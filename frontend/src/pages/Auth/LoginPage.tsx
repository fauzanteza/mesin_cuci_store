import React from 'react'
import { Link } from 'react-router-dom'

const LoginPage = () => {
    return (
        <div className="container mx-auto py-12 px-4 flex justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Masuk</h1>
                <p className="mb-4 text-center">Form login belum diimplementasikan.</p>
                <div className="text-center">
                    <Link to="/register" className="text-primary-600 hover:underline">Belum punya akun? Daftar</Link>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
