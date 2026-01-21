import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Paper,
    Button
} from '@mui/material';
import {
    LocalShipping,
    Security,
    SupportAgent,
    VerifiedUser,
    Eco,
    Speed
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
    const teamMembers = [
        {
            name: 'Budi Santoso',
            role: 'CEO & Founder',
            bio: 'Pengalaman 15 tahun di industri elektronik rumah tangga',
            image: '/images/team/ceo.jpg'
        },
        {
            name: 'Sari Dewi',
            role: 'Head of Operations',
            bio: 'Spesialis logistik dan manajemen rantai pasokan',
            image: '/images/team/operations.jpg'
        },
        {
            name: 'Agus Wijaya',
            role: 'Technical Director',
            bio: 'Ahni teknisi mesin cuci dengan sertifikasi internasional',
            image: '/images/team/technical.jpg'
        },
        {
            name: 'Maya Fitri',
            role: 'Customer Service Manager',
            bio: 'Dedikasi tinggi dalam memberikan pelayanan terbaik',
            image: '/images/team/customer-service.jpg'
        }
    ];

    const values = [
        {
            icon: <VerifiedUser fontSize="large" />,
            title: 'Keaslian Produk',
            description: '100% produk original dengan garansi resmi dari brand'
        },
        {
            icon: <LocalShipping fontSize="large" />,
            title: 'Pengiriman Cepat',
            description: 'Gratis ongkir untuk Jabodetabek, pengiriman seluruh Indonesia'
        },
        {
            icon: <SupportAgent fontSize="large" />,
            title: 'Dukungan Teknis',
            description: 'Tim teknisi profesional siap membantu instalasi dan perbaikan'
        },
        {
            icon: <Security fontSize="large" />,
            title: 'Transaksi Aman',
            description: 'Sistem pembayaran terenkripsi dengan berbagai pilihan metode'
        },
        {
            icon: <Eco fontSize="large" />,
            title: 'Ramah Lingkungan',
            description: 'Promosikan mesin cuci hemat energi dan ramah lingkungan'
        },
        {
            icon: <Speed fontSize="large" />,
            title: 'Layanan Cepat',
            description: 'Respon cepat 24 jam untuk semua kebutuhan Anda'
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
                        Tentang Mesin Cuci Store
                    </Typography>
                    <Typography variant="h5" paragraph>
                        Solusi Pencucian Modern untuk Keluarga Indonesia
                    </Typography>
                    <Typography variant="body1" sx={{ maxWidth: '800px' }}>
                        Sejak didirikan pada tahun 2018, Mesin Cuci Store telah menjadi
                        destinasi utama bagi keluarga Indonesia untuk menemukan mesin cuci
                        berkualitas dengan harga terbaik. Kami berkomitmen untuk
                        menyediakan produk yang dapat diandalkan dan layanan yang
                        memuaskan.
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {/* Mission & Vision */}
                <Grid container spacing={6} mb={8}>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                            <Typography variant="h4" gutterBottom color="primary">
                                Misi Kami
                            </Typography>
                            <Typography paragraph>
                                Menyediakan mesin cuci berkualitas tinggi dengan harga kompetitif
                                untuk meningkatkan kualitas hidup keluarga Indonesia melalui
                                teknologi pencucian yang modern dan efisien.
                            </Typography>
                            <Typography paragraph>
                                Kami berkomitmen untuk memberikan pengalaman belanja yang mudah,
                                aman, dan menyenangkan dengan dukungan layanan purna jual yang
                                terpercaya.
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                            <Typography variant="h4" gutterBottom color="primary">
                                Visi Kami
                            </Typography>
                            <Typography paragraph>
                                Menjadi platform e-commerce terdepan di Indonesia untuk
                                peralatan rumah tangga dengan fokus pada mesin cuci dan
                                perawatan pakaian.
                            </Typography>
                            <Typography paragraph>
                                Inovasi terus-menerus dalam layanan dan teknologi untuk
                                memenuhi kebutuhan yang terus berkembang dari pelanggan kami.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Values */}
                <Box mb={8}>
                    <Typography variant="h3" component="h2" gutterBottom align="center" mb={4}>
                        Nilai-nilai Kami
                    </Typography>
                    <Grid container spacing={4}>
                        {values.map((value, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                                        {value.icon}
                                    </Box>
                                    <Typography variant="h6" gutterBottom>
                                        {value.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {value.description}
                                    </Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Team */}
                <Box mb={8}>
                    <Typography variant="h3" component="h2" gutterBottom align="center" mb={4}>
                        Tim Kami
                    </Typography>
                    <Grid container spacing={4}>
                        {teamMembers.map((member, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Avatar
                                            src={member.image}
                                            sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                                        />
                                        <Typography variant="h6" gutterBottom>
                                            {member.name}
                                        </Typography>
                                        <Typography variant="subtitle1" color="primary" gutterBottom>
                                            {member.role}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {member.bio}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Stats */}
                <Box mb={8}>
                    <Paper elevation={3} sx={{ p: 4, bgcolor: 'primary.light', color: 'white' }}>
                        <Grid container spacing={4} textAlign="center">
                            <Grid item xs={6} md={3}>
                                <Typography variant="h3" fontWeight="bold">
                                    5,000+
                                </Typography>
                                <Typography variant="h6">
                                    Pelanggan Puas
                                </Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="h3" fontWeight="bold">
                                    50+
                                </Typography>
                                <Typography variant="h6">
                                    Merek Terpercaya
                                </Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="h3" fontWeight="bold">
                                    15,000+
                                </Typography>
                                <Typography variant="h6">
                                    Mesin Terjual
                                </Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="h3" fontWeight="bold">
                                    24/7
                                </Typography>
                                <Typography variant="h6">
                                    Dukungan Teknis
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>

                {/* CTA */}
                <Box textAlign="center" mb={8}>
                    <Typography variant="h4" gutterBottom>
                        Siap Memulai?
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ maxWidth: '600px', mx: 'auto' }}>
                        Temukan mesin cuci yang sempurna untuk kebutuhan keluarga Anda.
                        Nikmati pengalaman belanja yang mudah dengan garansi dan dukungan
                        teknis terbaik.
                    </Typography>
                    <Button
                        component={Link}
                        to="/products"
                        variant="contained"
                        size="large"
                        sx={{ mr: 2 }}
                    >
                        Lihat Produk
                    </Button>
                    <Button
                        component={Link}
                        to="/contact"
                        variant="outlined"
                        size="large"
                    >
                        Hubungi Kami
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default AboutPage;
