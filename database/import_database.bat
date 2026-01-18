@echo off
echo ====================================
echo IMPORT DATABASE MESIN CUCI STORE
echo ====================================

REM Set path ke XAMPP MySQL
set MYSQL_PATH="C:\xampp\mysql\bin\mysql.exe"
set DB_NAME=mesin_cuci_store
set DB_USER=root
set DB_PASS=

REM Cek apakah MySQL path ada
if not exist %MYSQL_PATH% (
    echo ❌ MySQL tidak ditemukan di %MYSQL_PATH%
    echo ℹ️ Pastikan XAMPP sudah terinstall
    pause
    exit /b 1
)

REM Buat database
echo 📦 Membuat database %DB_NAME%...
%MYSQL_PATH% -u %DB_USER% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME%;"

REM Import SQL file
echo 📥 Mengimport file SQL...
if exist "mesin_cuci_store_full.sql" (
    %MYSQL_PATH% -u %DB_USER% %DB_NAME% < mesin_cuci_store_full.sql
    echo ✅ Database berhasil diimport!
) else (
    echo ❌ File mesin_cuci_store_full.sql tidak ditemukan
)

REM Tampilkan informasi
echo.
echo 📊 INFORMASI DATABASE:
%MYSQL_PATH% -u %DB_USER% %DB_NAME% -e "SHOW TABLES;"

echo.
echo 🔑 LOGIN ADMIN:
echo Email: admin@mesincucistore.com
echo Password: Admin@123
echo.
echo 🚀 Aplikasi siap digunakan!
pause
