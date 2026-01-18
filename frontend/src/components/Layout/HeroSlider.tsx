import React from 'react'
import { Link } from 'react-router-dom'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HeroSlider = () => {
    return (
        <div className="relative bg-gray-900 text-white">
            <Swiper
                spaceBetween={0}
                centeredSlides={true}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                }}
                navigation={false}
                modules={[Autoplay, Pagination, Navigation]}
                className="h-[500px] md:h-[600px]"
            >
                <SwiperSlide>
                    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-900 to-indigo-900">
                        {/* Placeholder for banner image */}
                        <div className="absolute inset-0 opacity-30 bg-[url('/images/banner-1.jpg')] bg-cover bg-center"></div>
                        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-slide-up">
                                Revolusi Mencuci <br /> Lebih Bersih & Hemat
                            </h1>
                            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                Dapatkan mesin cuci impian dengan teknologi terbaru dan harga terbaik.
                            </p>
                            <Link to="/products" className="inline-block bg-white text-blue-900 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition shadow-lg animate-slide-up" style={{ animationDelay: '0.4s' }}>
                                Belanja Sekarang
                            </Link>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900">
                        <div className="relative z-10 text-center px-4">
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                Diskon Spesial <br /> Akhir Tahun
                            </h1>
                            <p className="text-xl md:text-2xl mb-8 text-gray-300">
                                Hemat hingga 30% untuk produk pilihan.
                            </p>
                            <Link to="/products" className="inline-block bg-primary-600 text-white px-8 py-4 rounded-full font-bold hover:bg-primary-700 transition shadow-lg">
                                Lihat Promo
                            </Link>
                        </div>
                    </div>
                </SwiperSlide>
            </Swiper>
        </div>
    )
}

export default HeroSlider
