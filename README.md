# 🏪 Mesin Cuci Store

Website e-commerce untuk penjualan mesin cuci dengan fitur lengkap.

## 🚀 Fitur Utama

### Untuk Pelanggan

- ✅ Registrasi & Login
- ✅ Pencarian dan Filter Produk
- ✅ Keranjang Belanja
- ✅ Checkout Multi-step
- ✅ Riwayat Pembelian
- ✅ Ulasan Produk
- ✅ Wishlist/Favorit

### Untuk Admin

- ✅ Dashboard Admin
- ✅ Manajemen Produk (CRUD)
- ✅ Manajemen Pesanan
- ✅ Manajemen Pelanggan
- ✅ Laporan Penjualan
- ✅ Manajemen Stok

## 🛠️ Teknologi Stack

### Frontend

- React 18 dengan TypeScript
- Tailwind CSS
- Redux Toolkit untuk state management
- React Query untuk data fetching

### Backend

- Node.js + Express
- MySQL Database
- JWT Authentication
- Sequelize ORM

## 📦 Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd mesin-cuci-store
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Setup Backend

```bash
cd backend
npm install
npm run dev
```

### 4. Setup Database

```bash
mysql -u root -p < database/schema.sql
```

## 🚀 Deployment

### Docker (Recommended)

```bash
docker-compose up --build
```

### Manual Deployment

1. Build frontend: `npm run build`
2. Start backend: `npm start`
3. Setup Nginx/Apache untuk serving static files

## 📁 Struktur Proyek

```
mesin-cuci-store/
├── frontend/          # React application
├── backend/           # Node.js API
├── database/          # SQL scripts
├── docker/            # Docker configuration
├── documentation/     # Project docs
└── scripts/           # Utility scripts
```

## 📞 Kontak

Untuk pertanyaan atau bantuan, silakan hubungi:

- Email: <support@mesincucistore.com>
- Telepon: 021-1234567

## 📄 Lisensi

Proyek ini menggunakan lisensi MIT.
