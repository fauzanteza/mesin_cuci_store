import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    Alert,
    Tabs,
    Tab,
    Card,
    CardContent,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    IconButton,
    CircularProgress
} from '@mui/material';
import {
    Save,
    RestartAlt,
    Upload,
    Email,
    Payment,
    Shipping,
    Security,
    Store,
    Notifications,
    Language
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/adminService';

interface SettingsForm {
    storeName: string;
    storeEmail: string;
    storePhone: string;
    storeAddress: string;
    storeCity: string;
    storePostalCode: string;
    currency: string;
    timezone: string;
    language: string;
    taxRate: number;
    shippingBaseCost: number;
    freeShippingThreshold: number;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
}

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [saveStatus, setSaveStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });

    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isDirty }
    } = useForm<SettingsForm>();

    // Fetch settings
    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: adminService.getSettings,
        onSuccess: (data) => {
            reset(data);
        }
    });

    // Save settings mutation
    const saveMutation = useMutation({
        mutationFn: (data: SettingsForm) => adminService.updateSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            setSaveStatus({
                type: 'success',
                message: 'Pengaturan berhasil disimpan'
            });
        },
        onError: (error: any) => {
            setSaveStatus({
                type: 'error',
                message: error.response?.data?.message || 'Gagal menyimpan pengaturan'
            });
        }
    });

    const onSubmit = (data: SettingsForm) => {
        saveMutation.mutate(data);
    };

    const handleReset = () => {
        if (settings) {
            reset(settings);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const tabs = [
        { label: 'Umum', icon: <Store /> },
        { label: 'Email', icon: <Email /> },
        { label: 'Pembayaran', icon: <Payment /> },
        { label: 'Pengiriman', icon: <Shipping /> },
        { label: 'Keamanan', icon: <Security /> },
        { label: 'Notifikasi', icon: <Notifications /> },
        { label: 'Lokal', icon: <Language /> }
    ];

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Container maxWidth="lg">
                {/* Header */}
                <Box mb={4}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Pengaturan Sistem
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Kelola pengaturan toko dan konfigurasi sistem
                    </Typography>
                </Box>

                {saveStatus.type && (
                    <Alert
                        severity={saveStatus.type}
                        sx={{ mb: 3 }}
                        onClose={() => setSaveStatus({ type: null, message: '' })}
                    >
                        {saveStatus.message}
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        {/* Left Column - Tabs */}
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent>
                                    <Tabs
                                        orientation="vertical"
                                        value={activeTab}
                                        onChange={handleTabChange}
                                        sx={{ borderRight: 1, borderColor: 'divider' }}
                                    >
                                        {tabs.map((tab, index) => (
                                            <Tab
                                                key={index}
                                                icon={tab.icon}
                                                iconPosition="start"
                                                label={tab.label}
                                                sx={{ justifyContent: 'flex-start' }}
                                            />
                                        ))}
                                    </Tabs>
                                </CardContent>
                            </Card>

                            {/* Save Actions */}
                            <Card sx={{ mt: 3 }}>
                                <CardContent>
                                    <Box display="flex" flexDirection="column" gap={2}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={<Save />}
                                            disabled={!isDirty || saveMutation.isPending}
                                            fullWidth
                                        >
                                            {saveMutation.isPending ? (
                                                <CircularProgress size={24} />
                                            ) : (
                                                'Simpan Perubahan'
                                            )}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<RestartAlt />}
                                            onClick={handleReset}
                                            disabled={!isDirty}
                                            fullWidth
                                        >
                                            Reset
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Right Column - Settings Content */}
                        <Grid item xs={12} md={9}>
                            <Card>
                                <CardContent>
                                    {/* General Settings */}
                                    {activeTab === 0 && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Pengaturan Umum Toko
                                            </Typography>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Nama Toko"
                                                        {...register('storeName', {
                                                            required: 'Nama toko wajib diisi'
                                                        })}
                                                        error={!!errors.storeName}
                                                        helperText={errors.storeName?.message}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Email Toko"
                                                        type="email"
                                                        {...register('storeEmail', {
                                                            required: 'Email toko wajib diisi',
                                                            pattern: {
                                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                                message: 'Format email tidak valid'
                                                            }
                                                        })}
                                                        error={!!errors.storeEmail}
                                                        helperText={errors.storeEmail?.message}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Telepon Toko"
                                                        {...register('storePhone', {
                                                            required: 'Telepon toko wajib diisi'
                                                        })}
                                                        error={!!errors.storePhone}
                                                        helperText={errors.storePhone?.message}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Alamat Toko"
                                                        multiline
                                                        rows={3}
                                                        {...register('storeAddress', {
                                                            required: 'Alamat toko wajib diisi'
                                                        })}
                                                        error={!!errors.storeAddress}
                                                        helperText={errors.storeAddress?.message}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Kota"
                                                        {...register('storeCity')}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Kode Pos"
                                                        {...register('storePostalCode')}
                                                    />
                                                </Grid>
                                            </Grid>

                                            <Divider sx={{ my: 3 }} />

                                            <Typography variant="h6" gutterBottom>
                                                Status Sistem
                                            </Typography>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                {...register('maintenanceMode')}
                                                                checked={watch('maintenanceMode')}
                                                            />
                                                        }
                                                        label="Mode Maintenance"
                                                    />
                                                    <Typography variant="caption" color="textSecondary">
                                                        Toko akan ditutup untuk pengunjung
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                {...register('registrationEnabled')}
                                                                checked={watch('registrationEnabled')}
                                                            />
                                                        }
                                                        label="Pendaftaran Pengguna"
                                                    />
                                                    <Typography variant="caption" color="textSecondary">
                                                        Izinkan pengguna mendaftar akun baru
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}

                                    {/* Email Settings */}
                                    {activeTab === 1 && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Pengaturan Email
                                            </Typography>
                                            <Alert severity="info" sx={{ mb: 3 }}>
                                                Konfigurasi SMTP server untuk pengiriman email otomatis
                                            </Alert>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="SMTP Host"
                                                        defaultValue="smtp.gmail.com"
                                                        disabled
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="SMTP Port"
                                                        defaultValue="587"
                                                        disabled
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                {...register('emailNotifications')}
                                                                checked={watch('emailNotifications')}
                                                            />
                                                        }
                                                        label="Aktifkan Notifikasi Email"
                                                    />
                                                    <Typography variant="caption" color="textSecondary">
                                                        Kirim email untuk konfirmasi pesanan, pembaruan status, dll.
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}

                                    {/* Payment Settings */}
                                    {activeTab === 2 && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Pengaturan Pembayaran
                                            </Typography>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Mata Uang</InputLabel>
                                                        <Select
                                                            label="Mata Uang"
                                                            defaultValue="IDR"
                                                            {...register('currency')}
                                                        >
                                                            <MenuItem value="IDR">IDR - Rupiah Indonesia</MenuItem>
                                                            <MenuItem value="USD">USD - Dolar AS</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Tarif Pajak (%)"
                                                        type="number"
                                                        InputProps={{ endAdornment: '%' }}
                                                        {...register('taxRate', {
                                                            min: 0,
                                                            max: 100
                                                        })}
                                                        error={!!errors.taxRate}
                                                        helperText={errors.taxRate?.message}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Metode Pembayaran yang Diaktifkan
                                                    </Typography>
                                                    <Grid container spacing={2}>
                                                        {[
                                                            'Transfer Bank',
                                                            'Kartu Kredit',
                                                            'E-Wallet',
                                                            'QRIS',
                                                            'COD'
                                                        ].map((method) => (
                                                            <Grid item key={method}>
                                                                <FormControlLabel
                                                                    control={<Switch defaultChecked />}
                                                                    label={method}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}

                                    {/* Shipping Settings */}
                                    {activeTab === 3 && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Pengaturan Pengiriman
                                            </Typography>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Biaya Dasar Pengiriman"
                                                        type="number"
                                                        InputProps={{ startAdornment: 'Rp' }}
                                                        {...register('shippingBaseCost', {
                                                            min: 0
                                                        })}
                                                        error={!!errors.shippingBaseCost}
                                                        helperText={errors.shippingBaseCost?.message}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Minimum Gratis Ongkir"
                                                        type="number"
                                                        InputProps={{ startAdornment: 'Rp' }}
                                                        {...register('freeShippingThreshold', {
                                                            min: 0
                                                        })}
                                                        error={!!errors.freeShippingThreshold}
                                                        helperText={errors.freeShippingThreshold?.message}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Mitra Pengiriman
                                                    </Typography>
                                                    <Grid container spacing={2}>
                                                        {[
                                                            'JNE',
                                                            'TIKI',
                                                            'POS Indonesia',
                                                            'SiCepat',
                                                            'J&T Express'
                                                        ].map((partner) => (
                                                            <Grid item key={partner}>
                                                                <FormControlLabel
                                                                    control={<Switch defaultChecked />}
                                                                    label={partner}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}

                                    {/* Security Settings */}
                                    {activeTab === 4 && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Pengaturan Keamanan
                                            </Typography>
                                            <Alert severity="warning" sx={{ mb: 3 }}>
                                                Hanya ubah pengaturan ini jika Anda memahami konsekuensinya
                                            </Alert>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12}>
                                                    <FormControlLabel
                                                        control={<Switch defaultChecked />}
                                                        label="Aktifkan HTTPS"
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <FormControlLabel
                                                        control={<Switch defaultChecked />}
                                                        label="Batas Percobaan Login"
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <FormControlLabel
                                                        control={<Switch defaultChecked />}
                                                        label="Wajib Verifikasi Email"
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}

                                    {/* Notification Settings */}
                                    {activeTab === 5 && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Pengaturan Notifikasi
                                            </Typography>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                {...register('emailNotifications')}
                                                                checked={watch('emailNotifications')}
                                                            />
                                                        }
                                                        label="Notifikasi Email"
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                {...register('smsNotifications')}
                                                                checked={watch('smsNotifications')}
                                                            />
                                                        }
                                                        label="Notifikasi SMS"
                                                    />
                                                    <Typography variant="caption" color="textSecondary">
                                                        Biaya tambahan mungkin berlaku
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Jenis Notifikasi
                                                    </Typography>
                                                    <Grid container spacing={2}>
                                                        {[
                                                            'Pesanan Baru',
                                                            'Pembayaran Diterima',
                                                            'Pengiriman',
                                                            'Stok Menipis',
                                                            'Review Produk'
                                                        ].map((type) => (
                                                            <Grid item key={type}>
                                                                <FormControlLabel
                                                                    control={<Switch defaultChecked />}
                                                                    label={type}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}

                                    {/* Localization Settings */}
                                    {activeTab === 6 && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Pengaturan Lokalisasi
                                            </Typography>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Zona Waktu</InputLabel>
                                                        <Select
                                                            label="Zona Waktu"
                                                            defaultValue="Asia/Jakarta"
                                                            {...register('timezone')}
                                                        >
                                                            <MenuItem value="Asia/Jakarta">WIB (Jakarta)</MenuItem>
                                                            <MenuItem value="Asia/Makassar">WITA (Makassar)</MenuItem>
                                                            <MenuItem value="Asia/Jayapura">WIT (Jayapura)</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Bahasa</InputLabel>
                                                        <Select
                                                            label="Bahasa"
                                                            defaultValue="id"
                                                            {...register('language')}
                                                        >
                                                            <MenuItem value="id">Bahasa Indonesia</MenuItem>
                                                            <MenuItem value="en">English</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Format Tanggal & Waktu
                                                    </Typography>
                                                    <Grid container spacing={2}>
                                                        {[
                                                            'DD/MM/YYYY',
                                                            'MM/DD/YYYY',
                                                            'YYYY-MM-DD'
                                                        ].map((format) => (
                                                            <Grid item key={format}>
                                                                <FormControlLabel
                                                                    control={<Switch defaultChecked={format === 'DD/MM/YYYY'} />}
                                                                    label={format}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </form>
            </Container>
        </Box>
    );
};

export default SettingsPage;
