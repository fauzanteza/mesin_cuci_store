import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Divider,
    Switch,
    FormControlLabel,
    Alert,
    Tabs,
    Tab,
    Avatar,
    IconButton,
    CircularProgress,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Person,
    Email,
    Phone,
    LocationOn,
    Security,
    Notifications,
    Language,
    Delete,
    Upload,
    Visibility,
    VisibilityOff,
    Warning
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import userService from '../../services/userService';
import authService from '../../services/authService';

interface UserSettingsForm {
    name: string;
    email: string;
    phone: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

interface NotificationSettings {
    emailOrderUpdates: boolean;
    emailPromotions: boolean;
    smsOrderUpdates: boolean;
    smsPromotions: boolean;
    pushNotifications: boolean;
}

const UserSettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [saveStatus, setSaveStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });
    const [showPassword, setShowPassword] = useState(false);

    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isDirty }
    } = useForm<UserSettingsForm>();

    // Fetch user data
    const { data: userData, isLoading } = useQuery({
        queryKey: ['userProfile'],
        queryFn: userService.getProfile,
        onSuccess: (data) => {
            reset({
                name: data.name,
                email: data.email,
                phone: data.phone || ''
            });
            if (data.avatar) {
                setAvatarPreview(data.avatar);
            }
        }
    });

    // Fetch notification settings
    const { data: notificationSettings } = useQuery({
        queryKey: ['notificationSettings'],
        queryFn: userService.getNotificationSettings
    });

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data: Partial<UserSettingsForm>) => userService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            setSaveStatus({
                type: 'success',
                message: 'Profil berhasil diperbarui'
            });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            setSaveStatus({
                type: 'error',
                message: err.response?.data?.message || 'Gagal memperbarui profil'
            });
        }
    });

    // Update password mutation
    const updatePasswordMutation = useMutation({
        mutationFn: (data: {
            currentPassword: string;
            newPassword: string;
        }) => authService.changePassword(data),
        onSuccess: () => {
            setSaveStatus({
                type: 'success',
                message: 'Kata sandi berhasil diubah'
            });
            reset({ ...watch(), currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            setSaveStatus({
                type: 'error',
                message: err.response?.data?.message || 'Gagal mengubah kata sandi'
            });
        }
    });

    // Update notification settings mutation
    const updateNotificationsMutation = useMutation({
        mutationFn: (data: NotificationSettings) => userService.updateNotificationSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
            setSaveStatus({
                type: 'success',
                message: 'Pengaturan notifikasi berhasil diperbarui'
            });
        }
    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setSaveStatus({ type: null, message: '' });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setSaveStatus({
                    type: 'error',
                    message: 'Ukuran file maksimal 5MB'
                });
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadAvatar = async () => {
        if (!avatarFile) return;

        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            await userService.uploadAvatar(formData);
            setSaveStatus({
                type: 'success',
                message: 'Foto profil berhasil diunggah'
            });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            setAvatarFile(null);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            setSaveStatus({
                type: 'error',
                message: err.response?.data?.message || 'Gagal mengunggah foto profil'
            });
        }
    };

    const onSubmit = (data: UserSettingsForm) => {
        if (activeTab === 0) {
            // Profile Update
            const { name, email, phone } = data;
            updateProfileMutation.mutate({ name, email, phone });
        } else if (activeTab === 1) {
            // Security Update
            if (data.newPassword !== data.confirmPassword) {
                setSaveStatus({
                    type: 'error',
                    message: 'Konfirmasi kata sandi tidak cocok'
                });
                return;
            }
            if (data.currentPassword && data.newPassword) {
                updatePasswordMutation.mutate({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword
                });
            }
        }
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.')) {
            // Implement delete account
            console.log('Delete account');
            // In a real app, call delete service and redirect to logout
        }
    };

    const tabs = [
        { label: 'Profil', icon: <Person /> },
        { label: 'Keamanan', icon: <Security /> },
        { label: 'Notifikasi', icon: <Notifications /> },
        { label: 'Privasi', icon: <Language /> }
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
                        Pengaturan Akun
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Kelola informasi dan preferensi akun Anda
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

                <Grid container spacing={3}>
                    {/* Left Column - Tabs */}
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                {/* Avatar Section */}
                                <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                                    <Avatar
                                        src={avatarPreview}
                                        alt={userData?.name}
                                        sx={{ width: 100, height: 100, mb: 2 }}
                                    />
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="avatar-upload"
                                        type="file"
                                        onChange={handleAvatarChange}
                                    />
                                    <label htmlFor="avatar-upload">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={<Upload />}
                                            size="small"
                                        >
                                            Ganti Foto
                                        </Button>
                                    </label>
                                    {avatarFile && (
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={handleUploadAvatar}
                                            sx={{ mt: 1 }}
                                        >
                                            Simpan Foto
                                        </Button>
                                    )}
                                </Box>

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
                    </Grid>

                    {/* Right Column - Content */}
                    <Grid item xs={12} md={9}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Card>
                                <CardContent>
                                    {/* Profile Settings */}
                                    {activeTab === 0 && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Informasi Pribadi
                                            </Typography>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Nama Lengkap"
                                                        {...register('name', { required: 'Nama wajib diisi' })}
                                                        error={!!errors.name}
                                                        helperText={errors.name?.message}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Email"
                                                        type="email"
                                                        {...register('email', { required: 'Email wajib diisi' })}
                                                        error={!!errors.email}
                                                        helperText={errors.email?.message}
                                                        disabled // Email usually requires special process to change
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Nomor Telepon"
                                                        {...register('phone')}
                                                        error={!!errors.phone}
                                                        helperText={errors.phone?.message}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Box mt={3} display="flex" justifyContent="flex-end">
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    disabled={updateProfileMutation.isPending}
                                                >
                                                    Simpan Profil
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Security Settings */}
                                    {activeTab === 1 && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Ubah Kata Sandi
                                            </Typography>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        type={showPassword ? 'text' : 'password'}
                                                        label="Kata Sandi Saat Ini"
                                                        {...register('currentPassword', { required: activeTab === 1 })}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                </IconButton>
                                                            )
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        type={showPassword ? 'text' : 'password'}
                                                        label="Kata Sandi Baru"
                                                        {...register('newPassword', {
                                                            required: activeTab === 1,
                                                            minLength: { value: 6, message: 'Minimal 6 karakter' }
                                                        })}
                                                        error={!!errors.newPassword}
                                                        helperText={errors.newPassword?.message}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        type={showPassword ? 'text' : 'password'}
                                                        label="Konfirmasi Kata Sandi"
                                                        {...register('confirmPassword', { required: activeTab === 1 })}
                                                        error={!!errors.confirmPassword}
                                                        helperText={errors.confirmPassword?.message}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Box mt={3} display="flex" justifyContent="flex-end">
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    disabled={updatePasswordMutation.isPending}
                                                >
                                                    Ubah Kata Sandi
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Notification Settings */}
                                    {activeTab === 2 && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Preferensi Notifikasi
                                            </Typography>
                                            <List>
                                                <ListItem>
                                                    <ListItemText
                                                        primary="Update Pesanan via Email"
                                                        secondary="Terima status pesanan terbaru melalui email"
                                                    />
                                                    <Switch defaultChecked />
                                                </ListItem>
                                                <Divider />
                                                <ListItem>
                                                    <ListItemText
                                                        primary="Promo & Penawaran via Email"
                                                        secondary="Dapatkan info diskon dan produk terbaru"
                                                    />
                                                    <Switch />
                                                </ListItem>
                                                <Divider />
                                                <ListItem>
                                                    <ListItemText
                                                        primary="Notifikasi WhatsApp"
                                                        secondary="Terima update penting via WhatsApp"
                                                    />
                                                    <Switch defaultChecked />
                                                </ListItem>
                                            </List>
                                            <Box mt={3} display="flex" justifyContent="flex-end">
                                                <Button variant="contained" onClick={() => setSaveStatus({ type: 'success', message: 'Preferensi notifikasi disimpan' })}>
                                                    Simpan Preferensi
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Privacy Settings */}
                                    {activeTab === 3 && (
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                Privasi & Data
                                            </Typography>
                                            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    Unduh Data Saya
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" paragraph>
                                                    Unduh salinan data pribadi Anda yang tersimpan di sistem kami.
                                                </Typography>
                                                <Button variant="outlined">
                                                    Request Data Export
                                                </Button>
                                            </Paper>

                                            <Paper variant="outlined" sx={{ p: 3, borderColor: 'error.main' }}>
                                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                                    <Warning color="error" />
                                                    <Typography variant="h6" color="error">
                                                        Hapus Akun
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" paragraph>
                                                    Menghapus akun Anda akan <strong>menghapus permanen</strong> semua data pribadi, riwayat pesanan, dan preferensi. Tindakan ini tidak dapat dibatalkan.
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    startIcon={<Delete />}
                                                    onClick={handleDeleteAccount}
                                                >
                                                    Hapus Akun Saya
                                                </Button>
                                            </Paper>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </form>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default UserSettingsPage;
