import React, { useState } from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Alert,
    Paper,
    IconButton,
    InputAdornment
} from '@mui/material';
import {
    LocationOn,
    Phone,
    Email,
    AccessTime,
    Send,
    WhatsApp,
    Facebook,
    Instagram,
    Twitter
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import emailjs from '@emailjs/browser';

interface ContactForm {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

const ContactPage: React.FC = () => {
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ContactForm>();

    const onSubmit = async (data: ContactForm) => {
        setSubmitting(true);
        try {
            // In production, replace with actual API call
            const templateParams = {
                from_name: data.name,
                from_email: data.email,
                from_phone: data.phone,
                subject: data.subject,
                message: data.message,
                to_name: 'Mesin Cuci Store',
                reply_to: data.email
            };

            // Using EmailJS for demo (configure in production)
            // const result = await emailjs.send(
            //   'YOUR_SERVICE_ID',
            //   'YOUR_TEMPLATE_ID',
            //   templateParams,
            //   'YOUR_PUBLIC_KEY'
            // );

            // Simulate success for now
            await new Promise(resolve => setTimeout(resolve, 1000));
            const result = { status: 200 };

            if (result.status === 200) {
                setSubmitStatus({
                    type: 'success',
                    message: 'Pesan berhasil dikirim! Kami akan membalas dalam 1x24 jam.'
                });
                reset();
            } else {
                throw new Error('Gagal mengirim pesan');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            setSubmitStatus({
                type: 'error',
                message: 'Gagal mengirim pesan. Silakan coba lagi atau hubungi langsung.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const contactInfo = [
        {
            icon: <LocationOn color="primary" sx={{ fontSize: 40 }} />,
            title: 'Alamat Kantor',
            details: [
                'Jl. Sudirman No. 123',
                'Jakarta Pusat 10220',
                'Indonesia'
            ],
            link: 'https://maps.google.com/?q=Jakarta+Sudirman+123'
        },
        {
            icon: <Phone color="primary" sx={{ fontSize: 40 }} />,
            title: 'Telepon',
            details: [
                '021-12345678',
                '0812-3456-7890 (WhatsApp)'
            ],
            link: 'tel:+622112345678'
        },
        {
            icon: <Email color="primary" sx={{ fontSize: 40 }} />,
            title: 'Email',
            details: [
                'info@mesincu.cu',
                'support@mesincu.cu',
                'sales@mesincu.cu'
            ],
            link: 'mailto:info@mesincu.cu'
        },
        {
            icon: <AccessTime color="primary" sx={{ fontSize: 40 }} />,
            title: 'Jam Operasional',
            details: [
                'Senin - Jumat: 08:00 - 17:00',
                'Sabtu: 08:00 - 15:00',
                'Minggu & Hari Libur: Tutup'
            ]
        }
    ];

    const socialMedia = [
        {
            name: 'WhatsApp',
            icon: <WhatsApp />,
            url: 'https://wa.me/6281234567890',
            color: '#25D366'
        },
        {
            name: 'Facebook',
            icon: <Facebook />,
            url: 'https://facebook.com/mesincucistore',
            color: '#1877F2'
        },
        {
            name: 'Instagram',
            icon: <Instagram />,
            url: 'https://instagram.com/mesincucistore',
            color: '#E4405F'
        },
        {
            name: 'Twitter',
            icon: <Twitter />,
            url: 'https://twitter.com/mesincucistore',
            color: '#1DA1F2'
        }
    ];

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #21CBF3 100%)',
                    color: 'white',
                    py: 8,
                    mb: 6
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                        Hubungi Kami
                    </Typography>
                    <Typography variant="h5" paragraph>
                        Kami siap membantu semua kebutuhan mesin cuci Anda
                    </Typography>
                    <Typography variant="body1" sx={{ maxWidth: '800px' }}>
                        Punya pertanyaan tentang produk, pemesanan, atau butuh bantuan teknis?
                        Tim kami siap membantu Anda dengan senang hati.
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg">
                <Grid container spacing={6}>
                    {/* Contact Information */}
                    <Grid item xs={12} lg={4}>
                        <Typography variant="h4" gutterBottom>
                            Informasi Kontak
                        </Typography>
                        <Typography variant="body1" paragraph color="textSecondary">
                            Jangan ragu untuk menghubungi kami melalui berbagai cara berikut:
                        </Typography>

                        {contactInfo.map((info, index) => (
                            <Card key={index} sx={{ mb: 3 }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        {info.icon}
                                        <Typography variant="h6" ml={2}>
                                            {info.title}
                                        </Typography>
                                    </Box>
                                    {info.details.map((detail, idx) => (
                                        <Typography key={idx} variant="body2" paragraph>
                                            {detail}
                                        </Typography>
                                    ))}
                                    {info.link && (
                                        <Button
                                            variant="text"
                                            color="primary"
                                            href={info.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Buka di Peta
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {/* Social Media */}
                        <Card sx={{ mt: 4 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Media Sosial
                                </Typography>
                                <Typography variant="body2" paragraph color="textSecondary">
                                    Ikuti kami untuk update produk dan promo terbaru
                                </Typography>
                                <Box display="flex" gap={2}>
                                    {socialMedia.map((social, index) => (
                                        <IconButton
                                            key={index}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                                bgcolor: social.color,
                                                color: 'white',
                                                '&:hover': {
                                                    bgcolor: social.color,
                                                    opacity: 0.9
                                                }
                                            }}
                                        >
                                            {social.icon}
                                        </IconButton>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Contact Form */}
                    <Grid item xs={12} lg={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" gutterBottom>
                                    Kirim Pesan
                                </Typography>
                                <Typography variant="body1" paragraph color="textSecondary" mb={4}>
                                    Isi form di bawah ini dan kami akan membalas secepatnya
                                </Typography>

                                {submitStatus.type && (
                                    <Alert
                                        severity={submitStatus.type}
                                        sx={{ mb: 3 }}
                                        onClose={() => setSubmitStatus({ type: null, message: '' })}
                                    >
                                        {submitStatus.message}
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Nama Lengkap"
                                                variant="outlined"
                                                {...register('name', {
                                                    required: 'Nama wajib diisi',
                                                    minLength: {
                                                        value: 3,
                                                        message: 'Nama minimal 3 karakter'
                                                    }
                                                })}
                                                error={!!errors.name}
                                                helperText={errors.name?.message}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                type="email"
                                                variant="outlined"
                                                {...register('email', {
                                                    required: 'Email wajib diisi',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Format email tidak valid'
                                                    }
                                                })}
                                                error={!!errors.email}
                                                helperText={errors.email?.message}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Nomor Telepon"
                                                variant="outlined"
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            +62
                                                        </InputAdornment>
                                                    )
                                                }}
                                                {...register('phone', {
                                                    required: 'Nomor telepon wajib diisi',
                                                    pattern: {
                                                        value: /^[0-9]{9,13}$/,
                                                        message: 'Format nomor telepon tidak valid'
                                                    }
                                                })}
                                                error={!!errors.phone}
                                                helperText={errors.phone?.message}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Subjek"
                                                variant="outlined"
                                                {...register('subject', {
                                                    required: 'Subjek wajib diisi'
                                                })}
                                                error={!!errors.subject}
                                                helperText={errors.subject?.message}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Pesan"
                                                variant="outlined"
                                                multiline
                                                rows={6}
                                                {...register('message', {
                                                    required: 'Pesan wajib diisi',
                                                    minLength: {
                                                        value: 10,
                                                        message: 'Pesan minimal 10 karakter'
                                                    }
                                                })}
                                                error={!!errors.message}
                                                helperText={errors.message?.message}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                size="large"
                                                startIcon={<Send />}
                                                disabled={submitting}
                                                sx={{ minWidth: 200 }}
                                            >
                                                {submitting ? 'Mengirim...' : 'Kirim Pesan'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </CardContent>
                        </Card>

                        {/* FAQ Preview */}
                        <Paper sx={{ mt: 4, p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Pertanyaan Umum
                            </Typography>
                            <Typography variant="body2" paragraph>
                                <strong>Q: Berapa lama waktu pengiriman?</strong><br />
                                A: 1-3 hari untuk Jabodetabek, 3-7 hari untuk luar Jawa, 7-14 hari untuk Indonesia Timur.
                            </Typography>
                            <Typography variant="body2" paragraph>
                                <strong>Q: Apakah ada garansi?</strong><br />
                                A: Ya, semua produk kami bergaransi resmi 1-2 tahun tergantung merek.
                            </Typography>
                            <Button
                                variant="text"
                                color="primary"
                                href="/faq"
                                sx={{ mt: 1 }}
                            >
                                Lihat Semua FAQ →
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Map Section */}
                <Box mt={8}>
                    <Typography variant="h4" gutterBottom>
                        Lokasi Kami
                    </Typography>
                    <Card>
                        <Box
                            sx={{
                                height: 400,
                                width: '100%',
                                bgcolor: '#e0e0e0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {/* In production, replace with actual Google Maps embed */}
                            <Typography variant="body1" color="textSecondary">
                                [Peta Google Maps akan ditampilkan di sini]
                            </Typography>
                        </Box>
                        <CardContent>
                            <Typography variant="body2" color="textSecondary">
                                Kunjungi showroom kami untuk melihat produk langsung atau konsultasi dengan ahli kami.
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
};

export default ContactPage;
