<?php
/**
 * Script untuk setup database otomatis
 * Simpan di htdocs XAMPP dan akses via browser
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'mesin_cuci_store';

echo "<h1>🚀 Setup Database Mesin Cuci Store</h1>";

try {
    // Connect tanpa memilih database dulu
    $conn = new mysqli($host, $username, $password);
    
    if ($conn->connect_error) {
        die("❌ Koneksi gagal: " . $conn->connect_error);
    }
    
    echo "✅ Berhasil connect ke MySQL<br>";
    
    // Buat database
    $sql = "CREATE DATABASE IF NOT EXISTS $database 
            CHARACTER SET utf8mb4 
            COLLATE utf8mb4_unicode_ci";
    
    if ($conn->query($sql) === TRUE) {
        echo "✅ Database '$database' berhasil dibuat<br>";
    } else {
        echo "❌ Gagal membuat database: " . $conn->error . "<br>";
    }
    
    // Pilih database
    $conn->select_db($database);
    
    // Baca file SQL
    $sql_file = file_get_contents('mesin_cuci_store_full.sql');
    
    if (!$sql_file) {
        throw new Exception("File mesin_cuci_store_full.sql tidak ditemukan!");
    }

    // Eksekusi multi query
    if ($conn->multi_query($sql_file)) {
        do {
            if ($result = $conn->store_result()) {
                $result->free();
            }
        } while ($conn->more_results() && $conn->next_result());
        echo "✅ Database berhasil diimport!<br>";
    } else {
        echo "❌ Error importing database: " . $conn->error . "<br>";
    }
    
    // Hitung total data
    echo "<h2>📊 Summary Database</h2>";
    
    $tables = ['users', 'categories', 'products', 'orders', 'order_items'];
    foreach ($tables as $table) {
        $result = $conn->query("SELECT COUNT(*) as count FROM $table");
        if ($result) {
            $row = $result->fetch_assoc();
            echo "Tabel $table: " . $row['count'] . " records<br>";
        }
    }
    
    echo "<h2>🎉 Setup Selesai!</h2>";
    echo "<p><strong>Login Admin:</strong><br>";
    echo "Email: admin@mesincucistore.com<br>";
    echo "Password: Admin@123</p>";
    
    echo "<p><strong>Database:</strong> $database</p>";
    echo "<p><strong>Host:</strong> $host</p>";
    
    $conn->close();
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
