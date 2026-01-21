import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Link,
    Divider
} from '@mui/material';
import {
    Security,
    Person,
    CreditCard,
    Email,
    LocationOn,
    Computer
} from '@mui/icons-material';

const PrivacyPolicyPage: React.FC = () => {
    const lastUpdated = "19 Januari 2026";

    const sections = [
        {
            title: 'Informasi yang Kami Kumpulkan',
            icon: <Person />,
            content: `
        Kami mengumpulkan informasi berikut ketika Anda menggunakan layanan kami:
        
        1. Informasi Pribadi:
           - Nama lengkap
           - Alamat email
           - Nomor telepon
           - Alamat pengiriman
           - Data pembayaran
        
        2. Informasi Transaksi:
           - Riwayat pembelian
           - Detail pesanan
           - Metode pembayaran
        
        3. Informasi Teknis:
           - Alamat IP
           - Jenis browser dan perangkat
           - Data cookies
           - Log aktivitas
      `
        },
        {
            title: 'Penggunaan Informasi',
            icon: <Computer />,
            content: `
        Informasi yang kami kumpulkan digunakan untuk:
        
        1. Memproses pesanan dan transaksi
        2. Mengirimkan produk dan konfirmasi
        3. Memberikan dukungan pelanggan
        4. Meningkatkan layanan dan pengalaman pengguna
        5. Mengirimkan informasi promosi (dengan persetujuan)
        6. Mematuhi kewajiban hukum
        
        Kami tidak akan menjual, menyewakan, atau membagikan informasi pribadi Anda kepada pihak ketiga tanpa persetujuan, kecuali diperlukan oleh hukum.
      `
        },
        {
            title: 'Keamanan Data',
            icon: <Security />,
            content: `
        Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi informasi pribadi Anda:
        
        1. Enkripsi data sensitif
        2. Firewall dan sistem deteksi intrusi
        3. Akses terbatas untuk karyawan yang berwenang
        4. Audit keamanan berkala
        5. Penyimpanan data yang aman
        
        Meskipun kami berusaha melindungi informasi Anda, tidak ada metode transmisi melalui internet atau penyimpanan elektronik yang 100% aman.
      `
        },
        {
            title: 'Pembayaran dan Data Finansial',
            icon: <CreditCard />,
            content: `
        Informasi pembayaran Anda diproses secara aman melalui penyedia pembayaran pihak ketiga yang terpercaya:
        
        1. Midtrans - Untuk transaksi online
        2. Bank lokal terkemuka - Untuk transfer
        3. Penyedia e-wallet - Untuk pembayaran digital
        
        Kami tidak menyimpan informasi kartu kredit atau data pembayaran sensitif di server kami. Semua transaksi dilindungi dengan enkripsi SSL 256-bit.
      `
        },
        {
            title: 'Cookie dan Teknologi Pelacakan',
            icon: <Email />,
            content: `
        Kami menggunakan cookies dan teknologi serupa untuk:
        
        1. Mengingat preferensi Anda
        2. Menganalisis penggunaan situs
        3. Menampilkan iklan yang relevan
        4. Meningkatkan kinerja situs
        
        Anda dapat mengatur browser untuk menolak cookies, namun ini dapat mempengaruhi fungsi beberapa fitur situs.
      `
        },
        {
            title: 'Hak Privasi Anda',
            icon: <LocationOn />,
            content: `
        Anda memiliki hak berikut terkait data pribadi Anda:
        
        1. Hak Akses - Meminta salinan data pribadi Anda
        2. Hak Perbaikan - Memperbaiki data yang tidak akurat
        3. Hak Penghapusan - Meminta penghapusan data pribadi
        4. Hak Pembatasan - Membatasi pemrosesan data
        5. Hak Portabilitas - Menerima data dalam format terstruktur
        6. Hak Keberatan - Menolak pemrosesan data untuk pemasaran
        
        Untuk menggunakan hak-hak ini, hubungi kami melalui halaman kontak.
      `
        }
    ];

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: 8,
                    mb: 6
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                        Kebijakan Privasi
                    </Typography>
                    <Typography variant="h5" paragraph>
                        Komitmen kami untuk melindungi data pribadi Anda
                    </Typography>
                    <Typography variant="body1">
                        Terakhir diperbarui: {lastUpdated}
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {/* Introduction */}
                <Paper sx={{ p: 4, mb: 4 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Pengantar
                    </Typography>
                    <Typography paragraph>
                        Selamat datang di Kebijakan Privasi Mesin Cuci Store. Kami menghargai kepercayaan yang Anda berikan dengan membagikan informasi pribadi Anda dengan kami, dan kami berkomitmen untuk melindunginya dengan serius.
                    </Typography>
                    <Typography paragraph>
                        Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, membagikan, dan melindungi informasi pribadi Anda ketika Anda menggunakan situs web kami, aplikasi, dan layanan terkait.
                    </Typography>
                    <Typography>
                        Dengan mengakses atau menggunakan layanan kami, Anda menyetujui pengumpulan dan penggunaan informasi sebagaimana dijelaskan dalam kebijakan ini.
                    </Typography>
                </Paper>

                {/* Sections */}
                {sections.map((section, index) => (
                    <Paper key={index} sx={{ p: 4, mb: 4 }}>
                        <Box display="flex" alignItems="center" mb={3}>
                            {section.icon}
                            <Typography variant="h5" ml={2}>
                                {section.title}
                            </Typography>
                        </Box>
                        <Typography style={{ whiteSpace: 'pre-line' }}>
                            {section.content}
                        </Typography>
                    </Paper>
                ))}

                {/* Children's Privacy */}
                <Paper sx={{ p: 4, mb: 4 }}>
                    <Typography variant="h5" gutterBottom color="primary">
                        Privasi Anak-anak
                    </Typography>
                    <Typography paragraph>
                        Layanan kami tidak ditujukan untuk anak-anak di bawah 13 tahun. Kami tidak dengan sengaja mengumpulkan informasi pribadi dari anak-anak di bawah 13 tahun. Jika Anda adalah orang tua atau wali dan mengetahui bahwa anak Anda telah memberikan data pribadi kepada kami, silakan hubungi kami.
                    </Typography>
                </Paper>

                {/* Changes to Policy */}
                <Paper sx={{ p: 4, mb: 4 }}>
                    <Typography variant="h5" gutterBottom color="primary">
                        Perubahan Kebijakan
                    </Typography>
                    <Typography paragraph>
                        Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan dengan memposting Kebijakan Privasi baru di halaman ini dan memperbarui tanggal "Terakhir Diperbarui" di atas.
                    </Typography>
                    <Typography>
                        Kami menyarankan Anda untuk meninjau Kebijakan Privasi ini secara berkala untuk setiap perubahan. Perubahan kebijakan ini efektif ketika diposting di halaman ini.
                    </Typography>
                </Paper>

                {/* Contact Information */}
                <Paper sx={{ p: 4, mb: 6 }}>
                    <Typography variant="h5" gutterBottom color="primary">
                        Hubungi Kami
                    </Typography>
                    <Typography paragraph>
                        Jika Anda memiliki pertanyaan atau kekhawatiran tentang Kebijakan Privasi ini atau praktik privasi kami, silakan hubungi kami:
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="Email"
                                secondary={
                                    <Link href="mailto:privacy@mesincu.cu" color="primary">
                                        privacy@mesincu.cu
                                    </Link>
                                }
                            />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText
                                primary="Telepon"
                                secondary={
                                    <Link href="tel:+622112345678" color="primary">
                                        (021) 1234-5678
                                    </Link>
                                }
                            />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText
                                primary="Alamat"
                                secondary="PT Mesin Cuci Store Indonesia, Jl. Sudirman No. 123, Jakarta Pusat 10220"
                            />
                        </ListItem>
                    </List>
                </Paper>

                {/* Quick Links */}
                <Box sx={{ mb: 8 }}>
                    <Typography variant="h6" gutterBottom>
                        Dokumen Terkait
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                        <Link href="/terms" color="primary" underline="hover">
                            Syarat & Ketentuan
                        </Link>
                        <Link href="/shipping-policy" color="primary" underline="hover">
                            Kebijakan Pengiriman
                        </Link>
                        <Link href="/return-policy" color="primary" underline="hover">
                            Kebijakan Pengembalian
                        </Link>
                        <Link href="/cookie-policy" color="primary" underline="hover">
                            Kebijakan Cookie
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default PrivacyPolicyPage;
