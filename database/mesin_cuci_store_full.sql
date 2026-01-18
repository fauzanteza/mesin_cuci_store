-- ============================================
-- DATABASE: mesin_cuci_store
-- UNTUK: XAMPP / MySQL / MariaDB
-- ============================================
-- Hapus database jika sudah ada (optional)
-- DROP DATABASE IF EXISTS mesin_cuci_store;
-- Buat database
CREATE DATABASE IF NOT EXISTS mesin_cuci_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mesin_cuci_store;
-- ============================================
-- TABEL: users (pengguna)
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(255),
    role ENUM('admin', 'customer') DEFAULT 'customer',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;
-- ============================================
-- TABEL: addresses (alamat pengiriman)
-- ============================================
CREATE TABLE addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    label VARCHAR(50) NOT NULL,
    -- 'Rumah', 'Kantor', dll
    recipient_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    country VARCHAR(50) DEFAULT 'Indonesia',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: categories (kategori produk)
-- ============================================
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(255),
    parent_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE
    SET NULL,
        INDEX idx_parent_id (parent_id),
        INDEX idx_slug (slug)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: brands (merek mesin cuci)
-- ============================================
CREATE TABLE brands (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: products (produk mesin cuci)
-- ============================================
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    -- Harga
    price DECIMAL(12, 2) NOT NULL,
    compare_price DECIMAL(12, 2),
    cost DECIMAL(12, 2),
    -- Stok
    stock INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    -- Status
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    -- Rating
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    -- Relasi
    category_id INT NOT NULL,
    brand_id INT,
    -- Spesifikasi teknis (JSON)
    specifications JSON,
    -- Fitur-fitur (JSON array)
    features JSON,
    -- Garansi (bulan)
    warranty_months INT DEFAULT 12,
    -- Dimensi dan berat
    weight_kg DECIMAL(6, 2),
    dimensions JSON,
    -- {length, width, height} dalam cm
    -- SEO
    seo_title VARCHAR(200),
    seo_description VARCHAR(500),
    seo_keywords VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE
    SET NULL,
        INDEX idx_category_id (category_id),
        INDEX idx_brand_id (brand_id),
        INDEX idx_slug (slug),
        INDEX idx_sku (sku),
        INDEX idx_price (price),
        INDEX idx_is_available (is_available),
        INDEX idx_is_featured (is_featured),
        INDEX idx_created_at (created_at)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: product_images (gambar produk)
-- ============================================
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_is_primary (is_primary),
    INDEX idx_sort_order (sort_order)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: product_variants (varian produk)
-- ============================================
CREATE TABLE product_variants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    -- 'Warna', 'Model', dll
    variant_value VARCHAR(100) NOT NULL,
    -- 'Putih', 'Silver', dll
    sku VARCHAR(50) UNIQUE NOT NULL,
    price DECIMAL(12, 2),
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_variant (product_id, variant_name, variant_value),
    INDEX idx_product_id (product_id),
    INDEX idx_sku (sku)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: orders (pesanan)
-- ============================================
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    address_id INT NOT NULL,
    -- Status pesanan
    status ENUM(
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
    ) DEFAULT 'pending',
    -- Status pembayaran
    payment_status ENUM(
        'pending',
        'paid',
        'failed',
        'refunded'
    ) DEFAULT 'pending',
    -- Metode pembayaran
    payment_method ENUM(
        'bank_transfer',
        'credit_card',
        'e_wallet',
        'cod'
    ) NOT NULL,
    -- Pengiriman
    shipping_method VARCHAR(100) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tracking_number VARCHAR(100),
    -- Rincian harga
    subtotal DECIMAL(12, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(12, 2) NOT NULL,
    -- Catatan
    notes TEXT,
    -- Tanggal-tanggal penting
    shipped_at DATETIME,
    delivered_at DATETIME,
    cancelled_at DATETIME,
    cancel_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (address_id) REFERENCES addresses(id),
    INDEX idx_user_id (user_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: order_items (item dalam pesanan)
-- ============================================
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT,
    product_name VARCHAR(200) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE
    SET NULL,
        INDEX idx_order_id (order_id),
        INDEX idx_product_id (product_id)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: order_status_history (riwayat status)
-- ============================================
CREATE TABLE order_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    status ENUM(
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
    ) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_created_at (created_at)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: payments (pembayaran)
-- ============================================
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT UNIQUE NOT NULL,
    payment_method ENUM(
        'bank_transfer',
        'credit_card',
        'e_wallet',
        'cod'
    ) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_name VARCHAR(100),
    payment_proof VARCHAR(255),
    paid_at DATETIME,
    refunded_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_transaction_id (transaction_id)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: cart_items (keranjang belanja)
-- ============================================
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE
    SET NULL,
        UNIQUE KEY unique_cart_item (user_id, product_id, variant_id),
        INDEX idx_user_id (user_id)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: wishlist_items (daftar keinginan)
-- ============================================
CREATE TABLE wishlist_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_wishlist (user_id, product_id),
    INDEX idx_user_id (user_id)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: reviews (ulasan produk)
-- ============================================
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    order_item_id INT,
    rating INT NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    title VARCHAR(200),
    comment TEXT,
    images JSON,
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    not_helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE
    SET NULL,
        INDEX idx_product_id (product_id),
        INDEX idx_user_id (user_id),
        INDEX idx_rating (rating),
        INDEX idx_created_at (created_at)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: review_votes (vote ulasan)
-- ============================================
CREATE TABLE review_votes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review_vote (review_id, user_id),
    INDEX idx_review_id (review_id)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: promo_codes (kode promo)
-- ============================================
CREATE TABLE promo_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    discount_type ENUM('percentage', 'fixed_amount') DEFAULT 'percentage',
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase DECIMAL(12, 2) DEFAULT 0,
    max_discount DECIMAL(12, 2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_is_active (is_active),
    INDEX idx_dates (start_date, end_date)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: notifications (notifikasi)
-- ============================================
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM(
        'order_update',
        'payment_update',
        'shipping_update',
        'promotion',
        'system'
    ) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: site_settings (pengaturan website)
-- ============================================
CREATE TABLE site_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string',
    category VARCHAR(50) DEFAULT 'general',
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key),
    INDEX idx_category (category)
) ENGINE = InnoDB;
-- ============================================
-- TABEL: banners (banner promosi)
-- ============================================
CREATE TABLE banners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(200),
    image_url VARCHAR(255) NOT NULL,
    link_url VARCHAR(255),
    link_text VARCHAR(50),
    position ENUM(
        'home_top',
        'home_middle',
        'sidebar',
        'product_page'
    ) DEFAULT 'home_top',
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active),
    INDEX idx_position (position),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_sort_order (sort_order)
) ENGINE = InnoDB;
-- ============================================
-- TRIGGERS
-- ============================================
-- Hapus trigger jika sudah ada
DROP TRIGGER IF EXISTS update_product_rating;
DROP TRIGGER IF EXISTS update_product_rating_delete;
DROP TRIGGER IF EXISTS generate_order_number;
DELIMITER // -- Trigger: Update product rating when review is added/updated
CREATE TRIGGER update_product_rating
AFTER
INSERT ON reviews FOR EACH ROW BEGIN
DECLARE avg_rating DECIMAL(3, 2);
DECLARE total_reviews INT;
SELECT AVG(rating),
    COUNT(*) INTO avg_rating,
    total_reviews
FROM reviews
WHERE product_id = NEW.product_id;
UPDATE products
SET rating = COALESCE(avg_rating, 0),
    review_count = total_reviews
WHERE id = NEW.product_id;
END // -- Trigger: Update product rating when review is deleted
CREATE TRIGGER update_product_rating_delete
AFTER DELETE ON reviews FOR EACH ROW BEGIN
DECLARE avg_rating DECIMAL(3, 2);
DECLARE total_reviews INT;
SELECT AVG(rating),
    COUNT(*) INTO avg_rating,
    total_reviews
FROM reviews
WHERE product_id = OLD.product_id;
UPDATE products
SET rating = COALESCE(avg_rating, 0),
    review_count = total_reviews
WHERE id = OLD.product_id;
END // -- Trigger: Generate order number
CREATE TRIGGER generate_order_number BEFORE
INSERT ON orders FOR EACH ROW BEGIN
DECLARE order_year CHAR(4);
DECLARE order_month CHAR(2);
DECLARE sequence_num INT;
SET order_year = DATE_FORMAT(NOW(), '%Y');
SET order_month = DATE_FORMAT(NOW(), '%m');
-- Get next sequence number for this month
SELECT COALESCE(MAX(SUBSTRING(order_number, 10)), 0) + 1 INTO sequence_num
FROM orders
WHERE order_number LIKE CONCAT('ORD-', order_year, order_month, '-%');
SET NEW.order_number = CONCAT(
        'ORD-',
        order_year,
        order_month,
        '-',
        LPAD(sequence_num, 6, '0')
    );
END // DELIMITER;
-- ============================================
-- INSERT DATA SAMPLE (DATA DUMMY)
-- ============================================
-- Insert admin user (password: Admin@123)
INSERT INTO users (
        email,
        password,
        name,
        phone,
        role,
        email_verified
    )
VALUES (
        'admin@mesincucistore.com',
        '$2y$10$YourHashedPasswordHere',
        'Admin Utama',
        '081234567890',
        'admin',
        TRUE
    ),
    (
        'customer1@example.com',
        '$2y$10$YourHashedPasswordHere',
        'Budi Santoso',
        '081234567891',
        'customer',
        TRUE
    ),
    (
        'customer2@example.com',
        '$2y$10$YourHashedPasswordHere',
        'Siti Aminah',
        '081234567892',
        'customer',
        TRUE
    );
-- Insert categories
INSERT INTO categories (name, slug, description, parent_id)
VALUES (
        'Mesin Cuci',
        'mesin-cuci',
        'Semua jenis mesin cuci',
        NULL
    ),
    (
        'Top Loading',
        'top-loading',
        'Mesin cuci bukaan atas',
        1
    ),
    (
        'Front Loading',
        'front-loading',
        'Mesin cuci bukaan depan',
        1
    ),
    (
        'Portable',
        'portable',
        'Mesin cuci portable kecil',
        1
    ),
    (
        'Twin Tub',
        'twin-tub',
        'Mesin cuci dua tabung',
        1
    );
-- Insert brands
INSERT INTO brands (name, slug, description)
VALUES ('Samsung', 'samsung', 'Samsung Electronics'),
    ('LG', 'lg', 'LG Electronics'),
    ('Sharp', 'sharp', 'Sharp Corporation'),
    (
        'Panasonic',
        'panasonic',
        'Panasonic Corporation'
    ),
    ('Polytron', 'polytron', 'Polytron Indonesia'),
    (
        'Electrolux',
        'electrolux',
        'Electrolux Home Appliances'
    );
-- Insert sample products
INSERT INTO products (
        name,
        slug,
        sku,
        description,
        short_description,
        price,
        compare_price,
        stock,
        category_id,
        brand_id,
        warranty_months,
        weight_kg
    )
VALUES (
        'Samsung Front Loading 8KG',
        'samsung-front-loading-8kg',
        'SAM-FL-8KG-001',
        'Mesin cuci Samsung 8KG Digital Inverter',
        'Samsung 8KG Front Load',
        4500000,
        4999000,
        15,
        3,
        1,
        24,
        65.5
    ),
    (
        'LG Twin Tub 8.5KG',
        'lg-twin-tub-8-5kg',
        'LG-TT-8.5KG-001',
        'Mesin cuci LG Twin Tub 8.5KG',
        'LG Twin Tub 8.5KG',
        2250000,
        2499000,
        25,
        5,
        2,
        12,
        32.0
    ),
    (
        'Sharp Top Loading 9KG',
        'sharp-top-loading-9kg',
        'SHP-TL-9KG-001',
        'Mesin cuci Sharp 9KG Top Load',
        'Sharp 9KG Top Load',
        3750000,
        3999000,
        12,
        2,
        3,
        24,
        58.0
    ),
    (
        'Polytron Portable 3.5KG',
        'polytron-portable-3-5kg',
        'POL-PT-3.5KG-001',
        'Mesin cuci Polytron Portable 3.5KG',
        'Polytron Portable 3.5KG',
        1250000,
        1499000,
        30,
        4,
        5,
        12,
        18.5
    ),
    (
        'Panasonic Front Loading 7KG',
        'panasonic-front-loading-7kg',
        'PAN-FL-7KG-001',
        'Mesin cuci Panasonic 7KG Front Load',
        'Panasonic 7KG Front Load',
        3500000,
        3799000,
        18,
        3,
        4,
        24,
        62.0
    );
-- Insert product images
INSERT INTO product_images (
        product_id,
        image_url,
        alt_text,
        is_primary,
        sort_order
    )
VALUES (
        1,
        'images/products/samsung-fl-1.jpg',
        'Samsung Front Loading 8KG',
        TRUE,
        1
    ),
    (
        2,
        'images/products/lg-tt-1.jpg',
        'LG Twin Tub 8.5KG',
        TRUE,
        1
    ),
    (
        3,
        'images/products/sharp-tl-1.jpg',
        'Sharp Top Loading 9KG',
        TRUE,
        1
    ),
    (
        4,
        'images/products/polytron-pt-1.jpg',
        'Polytron Portable 3.5KG',
        TRUE,
        1
    ),
    (
        5,
        'images/products/panasonic-fl-1.jpg',
        'Panasonic Front Loading 7KG',
        TRUE,
        1
    );
-- Insert addresses
INSERT INTO addresses (
        user_id,
        label,
        recipient_name,
        phone,
        address_line1,
        city,
        province,
        postal_code,
        is_default
    )
VALUES (
        2,
        'Rumah',
        'Budi Santoso',
        '081234567891',
        'Jl. Sudirman No. 123',
        'Jakarta Selatan',
        'DKI Jakarta',
        '12190',
        TRUE
    ),
    (
        3,
        'Rumah',
        'Siti Aminah',
        '081234567892',
        'Jl. Merdeka No. 56',
        'Bandung',
        'Jawa Barat',
        '40115',
        TRUE
    );
-- Insert orders (order_number akan digenerate otomatis oleh trigger)
INSERT INTO orders (
        user_id,
        address_id,
        status,
        payment_status,
        payment_method,
        shipping_method,
        shipping_cost,
        subtotal,
        tax,
        discount,
        total
    )
VALUES (
        2,
        1,
        'delivered',
        'paid',
        'bank_transfer',
        'JNE REG',
        25000,
        4500000,
        0,
        0,
        4525000
    ),
    (
        3,
        2,
        'processing',
        'paid',
        'e_wallet',
        'SICEPAT REG',
        20000,
        1250000,
        0,
        0,
        1270000
    );
-- Insert order items
INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        price,
        quantity,
        subtotal
    )
VALUES (
        1,
        1,
        'Samsung Front Loading 8KG',
        4500000,
        1,
        4500000
    ),
    (
        2,
        4,
        'Polytron Portable 3.5KG',
        1250000,
        1,
        1250000
    );
-- Insert reviews
INSERT INTO reviews (
        user_id,
        product_id,
        rating,
        title,
        comment,
        is_verified
    )
VALUES (
        2,
        1,
        5,
        'Sangat puas!',
        'Mesin cuci Samsung ini sangat bagus',
        TRUE
    ),
    (
        3,
        4,
        4,
        'Cocok untuk kosan',
        'Ukuran pas untuk kamar kos',
        TRUE
    );
-- Insert site settings
INSERT INTO site_settings (
        setting_key,
        setting_value,
        setting_type,
        category,
        description
    )
VALUES (
        'site_name',
        'Mesin Cuci Store',
        'string',
        'general',
        'Nama website'
    ),
    (
        'site_description',
        'Toko mesin cuci online terpercaya',
        'string',
        'general',
        'Deskripsi website'
    ),
    (
        'contact_email',
        'info@mesincucistore.com',
        'string',
        'contact',
        'Email kontak'
    ),
    (
        'contact_phone',
        '021-1234567',
        'string',
        'contact',
        'Telepon kontak'
    ),
    (
        'shipping_cost',
        '25000',
        'number',
        'shipping',
        'Biaya pengiriman default'
    );
-- ============================================
-- VIEWS UNTUK REPORTING
-- ============================================
-- View: Sales Report
CREATE VIEW sales_report AS
SELECT DATE(o.created_at) as sale_date,
    COUNT(DISTINCT o.id) as total_orders,
    SUM(o.total) as total_revenue,
    SUM(oi.quantity) as total_items_sold,
    AVG(o.total) as average_order_value
FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
WHERE o.status NOT IN ('cancelled')
GROUP BY DATE(o.created_at);
-- View: Product Performance
CREATE VIEW product_performance AS
SELECT p.id,
    p.name,
    p.sku,
    p.price,
    p.stock,
    p.rating,
    p.review_count,
    COALESCE(SUM(oi.quantity), 0) as total_sold,
    COALESCE(SUM(oi.subtotal), 0) as total_revenue,
    c.name as category_name,
    b.name as brand_name
FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id
    AND o.status NOT IN ('cancelled')
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
GROUP BY p.id
ORDER BY total_sold DESC;
-- ============================================
-- TAMPILKAN INFO
-- ============================================
SELECT '✅ DATABASE BERHASIL DIBUAT!' as message;
SELECT '📊 Database: mesin_cuci_store' as info;
SELECT '👤 Admin Login: admin@mesincucistore.com / Admin@123' as credentials;
SELECT '🚀 Aplikasi siap digunakan!' as status;