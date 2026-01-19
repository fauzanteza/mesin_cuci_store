import React from 'react';

export const BannerSlider = () => (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-64 md:h-96 w-full flex items-center justify-center text-white rounded-xl mb-8">
        <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Promo Spesial Bulan Ini</h2>
            <p className="text-xl">Diskon hingga 50% untuk mesin cuci pilihan</p>
        </div>
    </div>
);

export const CategoryMenu = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {['Top Load', 'Front Load', '2 Tabung', 'Dryer', 'Sparepart', 'Jasa'].map((cat) => (
            <div key={cat} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center text-blue-600">
                    <i className="fas fa-list"></i>
                </div>
                <span className="font-medium text-sm text-gray-700">{cat}</span>
            </div>
        ))}
    </div>
);

export const SearchBar = ({ placeholder, onSearch }: any) => (
    <div className="relative w-full">
        <input
            type="text"
            placeholder={placeholder || "Cari product..."}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => onSearch && onSearch(e.target.value)}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <i className="fas fa-search"></i>
        </div>
    </div>
);

export const NotificationBell = () => (
    <button className="relative p-2 text-gray-600 hover:text-blue-600">
        <i className="far fa-bell text-xl"></i>
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
    </button>
);
