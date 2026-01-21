import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    LocalShipping,
    Timer,
    CheckCircle,
    Warning,
    LocationOn,
    Package,
    MoneyOff,
    SupportAgent
} from '@mui/icons-material';

const ShippingPolicyPage: React.FC = () => {
    const shippingAreas = [
        {
            zone: 'Zona 1',
            areas: ['Jakarta', 'Bogor', 'Depok', 'Tangerang', 'Bekasi'],
            deliveryTime: '1-2 hari',
            freeShipping: '> Rp 3.000.000',
            cost: 'Gratis*',
            notes: '*Sesuai syarat'
        },
        {
            zone: 'Zona 2',
            areas: ['Bandung', 'Semarang', 'Yogyakarta', 'Surabaya', 'Malang'],
            deliveryTime: '2-4 hari',
            freeShipping: '> Rp 5.000.000',
            cost: 'Rp 50.000 - 150.000',
            notes: 'Tergantung berat'
        },
        {
            zone: 'Zona 3',
            areas: ['Medan', 'Palembang', 'Lampung', 'Padang', 'Pekanbaru'],
            deliveryTime: '3-5 hari',
            freeShipping: '> Rp 8.000.000',
            cost: 'Rp 100.000 - 300.000',
            notes: 'Termasuk kepulauan'
        },
        {
            zone: 'Zona 4',
            areas: ['Bali', 'Lombok', 'Makassar', 'Manado', 'Balikpapan'],
            deliveryTime: '4-7 hari',
            freeShipping: 'Tidak tersedia',
            cost: 'Rp 200.000 - 500.000',
            notes: 'Via udara & laut'
        },
        {
            zone: 'Zona 5',
            areas: ['Papua', 'Maluku', 'NTT', 'NTB pedalaman'],
            deliveryTime: '7-14 hari',
            freeShipping: 'Tidak tersedia',
            cost: 'Rp 500.000 - 1.500.000',
            notes: 'Pengiriman khusus'
        }
    ];

    const shippingPartners = [
        {
            name: 'JNE',
            services: ['REG', 'YES', 'OKE'],
            coverage: 'Seluruh Indonesia',
            tracking: true,
            insurance: true
        },
        {
            name: 'TIKI',
            services: ['REG', 'ONS'],
            coverage: 'Pulau Jawa & Sumatera',
            tracking: true,
            insurance: true
        },
        {
            name: 'SiCepat',
            services: ['REG', 'BEST'],
            coverage: 'Jabodetabek & Jawa',
            tracking: true,
            insurance: true
        },
        {
            name: 'J&T Express',
            services: ['REG', 'EZ'],
            coverage: 'Seluruh Indonesia',
            tracking: true,
            insurance: true
        },
        {
            name: 'GoSend',
            services: ['Instant', 'Same Day'],
            coverage: 'Jabodetabek',
            tracking: true,
            insurance: false
        }
    ];

    const installationServices = [
        {
            type: 'Standar',
            description: 'Pemasangan dasar dan pengecekan fungsi',
            duration: '1-2 jam',
            cost: 'Rp 150.000',
            includes: ['Pengecekan instalasi listrik', 'Penyetelan level', 'Tes fungsi dasar']
        },
        {
            type: 'Premium',
            description: 'Pemasangan lengkap dengan konsultasi',
            duration: '2-3 jam',
            cost: 'Rp 250.000',
            includes: ['Semua fitur standar', 'Konsultasi penggunaan', 'Demo fitur lengkap', 'Buku panduan']
        },
        {
            type: 'Komprehensif',
            description: 'Pemasangan + perawatan awal',
            duration: '3-4 jam',
            cost: 'Rp 400.000',
            includes: ['Semua fitur premium', 'Pembersihan awal', 'Kalibrasi lengkap', 'Garansi pemasangan 30 hari']
        }
    ];

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
                    color: 'white',
                    py: 8,
                    mb: 6
                }}
            >
                <Container maxWidth="lg">
                    <Box display="flex" alignItems="center" mb={3}>
                        <LocalShipping sx={{ fontSize: 60, mr: 3 }} />
                        <Box>
                            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                                Kebijakan Pengiriman
                            </Typography>
                            <Typography variant="h5">
                                Pengiriman aman, cepat, dan terpercaya ke seluruh Indonesia
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {/* Introduction */}
                <Paper sx={{ p: 4, mb: 4 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Pengantar
                    </Typography>
                    <Typography paragraph>
                        Di Mesin Cuci Store, kami memahami bahwa pengiriman yang tepat waktu dan aman sangat penting untuk pengalaman belanja Anda. Kebijakan pengiriman ini dirancang untuk memberikan kejelasan tentang proses pengiriman kami, estimasi waktu, biaya, dan layanan terkait.
                    </Typography>
                    <Typography>
                        Kami bekerja sama dengan mitra pengiriman terkemuka untuk memastikan produk Anda sampai dengan selamat dan tepat waktu.
                    </Typography>
                </Paper>

                {/* Important Notice */}
                <Alert severity="info" sx={{ mb: 4 }}>
                    <Typography fontWeight="bold">
                        🚚 Pengiriman Mesin Cuci Khusus
                    </Typography>
                    <Typography variant="body2">
                        Karena ukuran dan beratnya, pengiriman mesin cuci memerlukan penanganan khusus. Semua pengiriman dilakukan oleh kurir khusus dengan armada yang sesuai.
                    </Typography>
                </Alert>

                {/* Shipping Zones Table */}
                <Paper sx={{ p: 4, mb: 4 }}>
                    <Typography variant="h5" gutterBottom color="primary">
                        Zona dan Estimasi Pengiriman
                    </Typography>
                    <Typography variant="body2" paragraph color="textSecondary">
                        Estimasi waktu mulai dari konfirmasi pembayaran
                    </Typography>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Zona</strong></TableCell>
                                    <TableCell><strong>Daerah</strong></TableCell>
                                    <TableCell><strong>Estimasi Waktu</strong></TableCell>
                                    <TableCell><strong>Gratis Ongkir</strong></TableCell>
                                    <TableCell><strong>Biaya</strong></TableCell>
                                    <TableCell><strong>Catatan</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {shippingAreas.map((area, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Chip label={area.zone} color="primary" size="small" />
                                        </TableCell>
                                        <TableCell>
                                            {area.areas.map((a, i) => (
                                                <Typography key={i} variant="body2">
                                                    {a}
                                                </Typography>
                                            ))}
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Timer sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                                                {area.deliveryTime}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {area.freeShipping}
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight="bold">
                                                {area.cost}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">
                                                {area.notes}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                <Grid container spacing={4} mb={4}>
                    {/* Shipping Partners */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Mitra Pengiriman
                            </Typography>
                            <Typography variant="body2" paragraph color="textSecondary">
                                Kami bekerja sama dengan berbagai mitra untuk fleksibilitas pengiriman
                            </Typography>

                            <List>
                                {shippingPartners.map((partner, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <CheckCircle color="success" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={partner.name}
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2">
                                                        Layanan: {partner.services.join(', ')}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Cakupan: {partner.coverage}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Tracking: {partner.tracking ? '✅ Tersedia' : '❌ Tidak tersedia'} |
                                                        Asuransi: {partner.insurance ? '✅ Termasuk' : '❌ Tidak termasuk'}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Installation Services */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Layanan Instalasi
                            </Typography>
                            <Typography variant="body2" paragraph color="textSecondary">
                                Pemasangan profesional oleh teknisi bersertifikat
                            </Typography>

                            {installationServices.map((service, index) => (
                                <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography fontWeight="bold">
                                            {service.type}
                                        </Typography>
                                        <Chip label={service.cost} color="primary" size="small" />
                                    </Box>
                                    <Typography variant="body2" paragraph>
                                        {service.description}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="textSecondary">
                                        ⏱️ Durasi: {service.duration}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="textSecondary">
                                        ✅ Termasuk: {service.includes.join(', ')}
                                    </Typography>
                                </Paper>
                            ))}
                        </Paper>
                    </Grid>
                </Grid>

                {/* Shipping Process */}
                <Paper sx={{ p: 4, mb: 4 }}>
                    <Typography variant="h5" gutterBottom color="primary">
                        Proses Pengiriman
                    </Typography>

                    <Grid container spacing={3}>
                        {[
                            {
                                step: 1,
                                title: 'Pesanan Diproses',
                                description: 'Setelah pembayaran dikonfirmasi, pesanan diverifikasi dan dipersiapkan untuk pengiriman.',
                                duration: '1-3 jam',
                                icon: <Package />
                            },
                            {
                                step: 2,
                                title: 'Pengemasan',
                                description: 'Produk dikemas dengan material khusus untuk melindungi selama pengiriman.',
                                duration: '1-2 jam',
                                icon: <Package />
                            },
                            {
                                step: 3,
                                title: 'Penjemputan Kurir',
                                description: 'Kurir khusus menjemput paket dari gudang kami.',
                                duration: 'Sesuai jadwal',
                                icon: <LocalShipping />
                            },
                            {
                                step: 4,
                                title: 'Dalam Perjalanan',
                                description: 'Paket dikirim ke alamat tujuan dengan sistem tracking aktif.',
                                duration: 'Lihat estimasi zona',
                                icon: <LocationOn />
                            },
                            {
                                step: 5,
                                title: 'Penerimaan',
                                description: 'Penerima memeriksa paket sebelum menandatangani bukti penerimaan.',
                                duration: 'Instan',
                                icon: <CheckCircle />
                            },
                            {
                                step: 6,
                                title: 'Instalasi (Opsional)',
                                description: 'Teknisi kami melakukan instalasi sesuai jadwal yang disepakati.',
                                duration: '1-4 jam',
                                icon: <SupportAgent />
                            }
                        ].map((step, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 2
                                        }}
                                    >
                                        {step.icon}
                                    </Box>
                                    <Typography variant="h6" gutterBottom>
                                        Langkah {step.step}: {step.title}
                                    </Typography>
                                    <Typography variant="body2" paragraph color="textSecondary">
                                        {step.description}
                                    </Typography>
                                    <Chip
                                        label={`⏱️ ${step.duration}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>

                {/* Important Notes */}
                <Paper sx={{ p: 4, mb: 6 }}>
                    <Typography variant="h5" gutterBottom color="primary">
                        Catatan Penting
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, bgcolor: '#fff8e1' }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Warning color="warning" sx={{ mr: 2 }} />
                                    <Typography variant="h6">
                                        Kewajiban Pembeli
                                    </Typography>
                                </Box>
                                <List dense>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Typography color="primary">•</Typography>
                                        </ListItemIcon>
                                        <ListItemText primary="Menyediakan alamat yang jelas dan lengkap" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Typography color="primary">•</Typography>
                                        </ListItemIcon>
                                        <ListItemText primary="Memastikan ada orang yang menerima paket" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Typography color="primary">•</Typography>
                                        </ListItemIcon>
                                        <ListItemText primary="Memeriksa paket sebelum tanda tangan" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Typography color="primary">•</Typography>
                                        </ListItemIcon>
                                        <ListItemText primary="Melaporkan kerusakan dalam 24 jam" />
                                    </ListItem>
                                </List>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, bgcolor: '#e8f5e9' }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <CheckCircle color="success" sx={{ mr: 2 }} />
                                    <Typography variant="h6">
                                        Jaminan Kami
                                    </Typography>
                                </Box>
                                <List dense>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Typography color="primary">•</Typography>
                                        </ListItemIcon>
                                        <ListItemText primary="Pengemasan yang aman dan profesional" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Typography color="primary">•</Typography>
                                        </ListItemIcon>
                                        <ListItemText primary="Asuransi pengiriman untuk nilai tertentu" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Typography color="primary">•</Typography>
                                        </ListItemIcon>
                                        <ListItemText primary="Sistem tracking real-time" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Typography color="primary">•</Typography>
                                        </ListItemIcon>
                                        <ListItemText primary="Dukungan customer service 24/7" />
                                    </ListItem>
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Contact for Shipping Issues */}
                <Paper sx={{ p: 4, bgcolor: '#e3f2fd' }}>
                    <Box display="flex" alignItems="center" mb={3}>
                        <SupportAgent sx={{ fontSize: 40, color: 'primary.main', mr: 3 }} />
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                Butuh Bantuan Pengiriman?
                            </Typography>
                            <Typography paragraph>
                                Jika Anda mengalami masalah dengan pengiriman atau memiliki pertanyaan, tim logistik kami siap membantu.
                            </Typography>
                            <Typography variant="body2">
                                📞 0812-3456-7890 (Logistik) | 📧 shipping@mesincu.cu
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ShippingPolicyPage;
