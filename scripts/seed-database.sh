#!/bin/bash

# Script untuk seed database dengan data dummy

echo "🌱 Seeding database dengan data dummy..."

# Check if node_modules exists
if [ ! -d "backend/node_modules" ]; then
    echo "❌ Node modules belum diinstall. Jalankan 'npm install' di folder backend terlebih dahulu."
    exit 1
fi

# Navigate to backend directory
cd backend

# Run Prisma seed
echo "📊 Menjalankan Prisma seed..."
npx prisma db seed

if [ $? -eq 0 ]; then
    echo "✅ Database berhasil di-seed!"
    echo ""
    echo "📋 Data yang dibuat:"
    echo "- 1 user admin"
    echo "- 10 user customer"
    echo "- 5 kategori produk"
    echo "- 5 brand"
    echo "- 50 produk mesin cuci"
    echo "- 20 orders dummy"
else
    echo "❌ Gagal seeding database"
    exit 1
fi
