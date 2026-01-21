import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    InputAdornment,
    Paper,
    Grid,
    Button,
    Chip
} from '@mui/material';
import {
    ExpandMore,
    Search,
    ShoppingCart,
    LocalShipping,
    Security,
    SupportAgent,
    Payment,
    AssignmentReturn,
    Build,
    WhatsApp
} from '@mui/icons-material';

interface FAQItem {
    id: number;
    question: string;
    answer: string;
    category: string;
    popular: boolean;
}

const FAQPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expanded, setExpanded] = useState<string | false>(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const handleAccordionChange = (panel: string) => (
        event: React.SyntheticEvent,
        isExpanded: boolean
    ) => {
        setExpanded(isExpanded ? panel : false);
    };

    const faqCategories = [
        { id: 'all', name: 'Semua', icon: null, count: 35 },
        { id: 'product', name: 'Produk', icon: <ShoppingCart />, count: 12 },
        { id: 'shipping', name: 'Pengiriman', icon: <LocalShipping />, count: 8 },
        { id: 'payment', name: 'Pembayaran', icon: <Payment />, count: 7 },
        { id: 'warranty', name: 'Garansi', icon: <Security />, count: 5 },
        { id: 'return', name: 'Pengembalian', icon: <AssignmentReturn />, count: 4 },
        { id: 'technical', name: 'Teknis', icon: <Build />, count: 6 },
        { id: 'support', name: 'Dukungan', icon: <SupportAgent />, count: 8 }
    ];

    const faqItems: FAQItem[] = [
        // Product Questions
        {
            id: 1,
            question: 'Apa perbedaan mesin cuci top loading dan front loading?',
            answer: 'Mesin cuci top loading memiliki pintu di atas dan umumnya lebih murah, hemat listrik, dan kapasitas besar. Front loading memiliki pintu di depan, lebih hemat air, hasil cucian lebih bersih, dan memiliki fitur lebih lengkap seperti dryer dan steam.',
            category: 'product',
            popular: true
        },
        {
            id: 2,
            question: 'Berapa kapasitas mesin cuci yang cocok untuk keluarga 4 orang?',
            answer: 'Untuk keluarga 4 orang, rekomendasi kapasitas adalah 8-10 kg. Kapasitas ini cukup untuk mencuci pakaian keluarga dalam 1-2 kali pencucian per minggu.',
            category: 'product',
            popular: true
        },
        {
            id: 3,
            question: 'Apakah semua mesin cuci bisa untuk air PAM dan sumur?',
            answer: 'Ya, kebanyakan mesin cuci modern sudah mendukung kedua jenis air. Namun untuk air sumur yang keruh atau banyak kandungan mineral, disarankan menggunakan filter air tambahan.',
            category: 'product',
            popular: false
        },

        // Shipping Questions
        {
            id: 4,
            question: 'Berapa lama waktu pengiriman ke daerah saya?',
            answer: 'Jakarta & Sekitarnya: 1-3 hari, Jawa & Sumatera: 3-7 hari, Bali & Kalimantan: 5-10 hari, Sulawesi & Indonesia Timur: 7-14 hari. Waktu dapat berubah tergantung ketersediaan stok dan kondisi cuaca.',
            category: 'shipping',
            popular: true
        },
        {
            id: 5,
            question: 'Apakah ada biaya pengiriman?',
            answer: 'Gratis ongkir untuk wilayah Jabodetabek dengan pembelian minimal Rp 3.000.000. Untuk daerah lain, biaya pengiriman dihitung berdasarkan berat dan jarak tujuan.',
            category: 'shipping',
            popular: false
        },

        // Payment Questions
        {
            id: 6,
            question: 'Metode pembayaran apa saja yang tersedia?',
            answer: 'Kami menerima: Transfer Bank (BCA, BNI, BRI, Mandiri), E-Wallet (GoPay, OVO, Dana, ShopeePay), QRIS, Kartu Kredit, dan COD (Cash on Delivery) untuk area tertentu.',
            category: 'payment',
            popular: true
        },
        {
            id: 7,
            question: 'Bagaimana jika pembayaran saya gagal?',
            answer: 'Jika pembayaran gagal, pesanan akan otomatis dibatalkan setelah 24 jam. Silakan coba lagi atau hubungi customer service untuk bantuan. Pastikan saldo atau limit kartu kredit mencukupi.',
            category: 'payment',
            popular: false
        },

        // Warranty Questions
        {
            id: 8,
            question: 'Berapa lama garansi mesin cuci?',
            answer: 'Garansi resmi bervariasi tergantung merek: LG & Samsung (2 tahun), Sharp & Panasonic (2 tahun), Modena (1 tahun), Polytron (1 tahun). Garansi spare parts dan service sesuai ketentuan masing-masing merek.',
            category: 'warranty',
            popular: true
        },
        {
            id: 9,
            question: 'Bagaimana cara klaim garansi?',
            answer: '1. Hubungi customer service kami dengan menyertakan nomor invoice. 2. Kami akan mengirim teknisi untuk pengecekan. 3. Jika termasuk garansi, perbaikan atau penggantian akan dilakukan. 4. Simpan buku garansi dan invoice asli untuk klaim.',
            category: 'warranty',
            popular: false
        },

        // Technical Questions
        {
            id: 10,
            question: 'Mesin cuci saya berisik, apa penyebabnya?',
            answer: 'Kebisingan dapat disebabkan oleh: 1. Pemasangan tidak rata, 2. Bearing rusak, 3. Ada benda asing di drum, 4. Motor listrik bermasalah. Hubungi teknisi kami untuk diagnosis lebih lanjut.',
            category: 'technical',
            popular: true
        }
    ];

    const filteredFaqs = faqItems.filter(item => {
        const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryIcon = (categoryId: string) => {
        const category = faqCategories.find(cat => cat.id === categoryId);
        return category?.icon || null;
    };

    const getCategoryName = (categoryId: string) => {
        const category = faqCategories.find(cat => cat.id === categoryId);
        return category?.name || '';
    };

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                    color: 'white',
                    py: 8,
                    mb: 6
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                        Pertanyaan yang Sering Diajukan
                    </Typography>
                    <Typography variant="h5" paragraph>
                        Temukan jawaban untuk pertanyaan umum tentang produk dan layanan kami
                    </Typography>

                    {/* Search Bar */}
                    <Paper sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
                        <TextField
                            fullWidth
                            placeholder="Cari pertanyaan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'white'
                                }
                            }}
                        />
                    </Paper>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {/* Category Filter */}
                <Box mb={4}>
                    <Typography variant="h6" gutterBottom>
                        Kategori FAQ
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                        {faqCategories.map((category) => (
                            <Chip
                                key={category.id}
                                icon={category.icon as any}
                                label={`${category.name} (${category.count})`}
                                onClick={() => setSelectedCategory(category.id)}
                                color={selectedCategory === category.id ? 'primary' : 'default'}
                                variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                                sx={{ mb: 1 }}
                            />
                        ))}
                    </Box>
                </Box>

                {/* FAQ List */}
                <Box mb={6}>
                    <Typography variant="h4" gutterBottom>
                        {selectedCategory === 'all' ? 'Semua Pertanyaan' : `Pertanyaan tentang ${getCategoryName(selectedCategory)}`}
                    </Typography>
                    <Typography variant="body1" color="textSecondary" paragraph mb={4}>
                        {filteredFaqs.length} pertanyaan ditemukan
                    </Typography>

                    {filteredFaqs.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                Tidak ditemukan pertanyaan yang sesuai
                            </Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                                Coba kata kunci lain atau hubungi customer service kami
                            </Typography>
                            <Button
                                variant="contained"
                                href="/contact"
                                sx={{ mt: 2 }}
                            >
                                Hubungi Kami
                            </Button>
                        </Paper>
                    ) : (
                        <Box>
                            {/* Popular Questions */}
                            {selectedCategory === 'all' && filteredFaqs.some(faq => faq.popular) && (
                                <Box mb={4}>
                                    <Typography variant="h5" gutterBottom color="primary">
                                        ⭐ Pertanyaan Populer
                                    </Typography>
                                    {filteredFaqs
                                        .filter(faq => faq.popular)
                                        .map((faq) => (
                                            <Accordion
                                                key={faq.id}
                                                expanded={expanded === `panel${faq.id}`}
                                                onChange={handleAccordionChange(`panel${faq.id}`)}
                                                sx={{ mb: 1 }}
                                            >
                                                <AccordionSummary expandIcon={<ExpandMore />}>
                                                    <Box display="flex" alignItems="center" gap={2}>
                                                        {getCategoryIcon(faq.category)}
                                                        <Typography fontWeight="bold">
                                                            {faq.question}
                                                        </Typography>
                                                        <Chip label="Populer" size="small" color="warning" />
                                                    </Box>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Typography color="textSecondary">
                                                        {faq.answer}
                                                    </Typography>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                </Box>
                            )}

                            {/* All Questions */}
                            <Typography variant="h5" gutterBottom>
                                {selectedCategory === 'all' ? 'Semua Pertanyaan Lainnya' : 'Semua Pertanyaan'}
                            </Typography>
                            {filteredFaqs
                                .filter(faq => selectedCategory !== 'all' || !faq.popular)
                                .map((faq) => (
                                    <Accordion
                                        key={faq.id}
                                        expanded={expanded === `panel${faq.id}`}
                                        onChange={handleAccordionChange(`panel${faq.id}`)}
                                        sx={{ mb: 1 }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                {getCategoryIcon(faq.category)}
                                                <Typography>
                                                    {faq.question}
                                                </Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography color="textSecondary">
                                                {faq.answer}
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                        </Box>
                    )}
                </Box>

                {/* Still Have Questions */}
                <Paper sx={{ p: 4, bgcolor: '#f5f5f5', mb: 6 }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Typography variant="h5" gutterBottom>
                                Masih punya pertanyaan?
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Jika Anda tidak menemukan jawaban yang Anda cari, tim customer service kami siap membantu Anda.
                            </Typography>
                            <Box display="flex" gap={2} flexWrap="wrap">
                                <Button
                                    variant="contained"
                                    href="/contact"
                                    startIcon={<SupportAgent />}
                                >
                                    Hubungi Customer Service
                                </Button>
                                <Button
                                    variant="outlined"
                                    href="https://wa.me/6281234567890"
                                    target="_blank"
                                    startIcon={<WhatsApp />}
                                >
                                    Chat via WhatsApp
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box textAlign="center">
                                <SupportAgent sx={{ fontSize: 80, color: 'primary.main' }} />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Quick Links */}
                <Box>
                    <Typography variant="h5" gutterBottom>
                        Informasi Lainnya
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>
                                    Kebijakan Pengembalian
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    Ketentuan pengembalian barang dalam 14 hari
                                </Typography>
                                <Button
                                    variant="text"
                                    href="/return-policy"
                                    size="small"
                                >
                                    Selengkapnya →
                                </Button>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>
                                    Panduan Instalasi
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    Tutorial pemasangan mesin cuci yang aman
                                </Typography>
                                <Button
                                    variant="text"
                                    href="/installation-guide"
                                    size="small"
                                >
                                    Selengkapnya →
                                </Button>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>
                                    Tips Perawatan
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    Cara merawat mesin cuci agar awet dan hemat
                                </Typography>
                                <Button
                                    variant="text"
                                    href="/maintenance-tips"
                                    size="small"
                                >
                                    Selengkapnya →
                                </Button>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>
                                    Download Manual
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    Manual book berbagai merek mesin cuci
                                </Typography>
                                <Button
                                    variant="text"
                                    href="/manuals"
                                    size="small"
                                >
                                    Selengkapnya →
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default FAQPage;
