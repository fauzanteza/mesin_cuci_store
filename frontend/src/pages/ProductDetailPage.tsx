import React from 'react'
import { useParams } from 'react-router-dom'

const ProductDetailPage = () => {
    const { id } = useParams()
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">Detail Produk {id}</h1>
            <p>Halaman ini sedang dalam pengembangan.</p>
        </div>
    )
}

export default ProductDetailPage
