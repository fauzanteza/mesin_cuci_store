// frontend/src/pages/User/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, LoadingSpinner, Alert, Modal, Badge, FileUploader } from '../../components/UI';
// import userService from '../../services/userService';
import { updateUser } from '../../store/slices/authSlice';

const UserProfilePage: React.FC = () => {
    // const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();

    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        birthDate: '',
        address: '',
    });

    // Password change form state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Notification preferences
    const [notifications, setNotifications] = useState({
        emailOrderUpdates: true,
        emailPromotions: true,
        smsOrderUpdates: false,
        smsPromotions: false,
        pushNotifications: true,
    });

    // Account deletion
    const [deleteReason, setDeleteReason] = useState('');
    const [deleteFeedback, setDeleteFeedback] = useState('');

    useEffect(() => {
        if (user && !authLoading) {
            loadUserProfile();
        }
    }, [user, authLoading]);

    const loadUserProfile = async () => {
        setLoading(true);
        try {
            // In real app: const profileData = await userService.getProfile();
            const mockProfile = {
                name: user?.name || 'John Doe',
                email: user?.email || 'john@example.com',
                phone: (user as any)?.phone || '',
                // phone: '081234567890',
                gender: 'male',
                birthDate: '1990-01-01',
                address: 'Jl. Contoh No. 123, Jakarta',
                avatar: user?.avatar || '',
                emailVerified: true,
                phoneVerified: false,
                joinedDate: '2024-01-01',
                lastLogin: new Date().toISOString(),
            };

            setProfileForm({
                name: mockProfile.name,
                email: mockProfile.email,
                phone: mockProfile.phone,
                gender: mockProfile.gender,
                birthDate: mockProfile.birthDate,
                address: mockProfile.address,
            });

            // In real app: Load notification preferences from API
        } catch (error: any) {
            //   Alert.error(error.message || 'Gagal memuat profil');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNotificationChange = (key: keyof typeof notifications) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key as keyof typeof notifications]
        }));
    };

    const handleAvatarUpload = async (file: File) => {
        setUploadingAvatar(true);
        try {
            // In real app: const avatarUrl = await userService.uploadAvatar(file);
            // const mockAvatarUrl = URL.createObjectURL(file);

            // Update local state
            // dispatch(updateUser({ avatar: mockAvatarUrl }));

            // Alert.success('Foto profil berhasil diubah');
            alert('Foto profil berhasil diubah');
        } catch (error: any) {
            // Alert.error(error.message || 'Gagal mengupload foto profil');
            alert(error.message || 'Gagal mengupload foto profil');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Validate form
            if (!profileForm.name.trim()) {
                throw new Error('Nama lengkap wajib diisi');
            }

            if (!profileForm.email.trim()) {
                throw new Error('Email wajib diisi');
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(profileForm.email)) {
                throw new Error('Format email tidak valid');
            }

            // Phone validation (if provided)
            if (profileForm.phone && !/^[0-9+\-\s]{10,15}$/.test(profileForm.phone)) {
                throw new Error('Format nomor telepon tidak valid');
            }

            // In real app: await userService.updateProfile(profileForm);
            // dispatch(updateUser(profileForm));

            // Save notification preferences
            // await userService.updateNotifications(notifications);

            // Alert.success('Profil berhasil diperbarui');
            alert('Profil berhasil diperbarui');
        } catch (error: any) {
            // Alert.error(error.message || 'Gagal menyimpan perubahan');
            alert(error.message || 'Gagal menyimpan perubahan');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Validate form
            if (!passwordForm.currentPassword) {
                throw new Error('Password saat ini wajib diisi');
            }

            if (!passwordForm.newPassword) {
                throw new Error('Password baru wajib diisi');
            }

            if (passwordForm.newPassword.length < 8) {
                throw new Error('Password baru minimal 8 karakter');
            }

            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                throw new Error('Konfirmasi password tidak cocok');
            }

            if (passwordForm.currentPassword === passwordForm.newPassword) {
                throw new Error('Password baru harus berbeda dengan password saat ini');
            }

            // In real app: await userService.changePassword(passwordForm);

            // Alert.success('Password berhasil diubah');
            alert('Password berhasil diubah');
            setShowChangePassword(false);
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error: any) {
            // Alert.error(error.message || 'Gagal mengubah password');
            alert(error.message || 'Gagal mengubah password');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deleteReason.trim()) {
            // Alert.error('Harap berikan alasan penghapusan akun');
            alert('Harap berikan alasan penghapusan akun');
            return;
        }

        setSaving(true);
        try {
            // In real app: await userService.deleteAccount({ reason: deleteReason, feedback: deleteFeedback });

            // Alert.success('Akun berhasil dihapus. Semua data telah dihapus dari sistem kami.');
            alert('Akun berhasil dihapus. Semua data telah dihapus dari sistem kami.');

            // Logout and redirect to home
            // dispatch(logout());
            navigate('/');
        } catch (error: any) {
            // Alert.error(error.message || 'Gagal menghapus akun');
            alert(error.message || 'Gagal menghapus akun');
        } finally {
            setSaving(false);
            setShowDeleteAccount(false);
        }
    };

    const handleResendVerificationEmail = async () => {
        try {
            // In real app: await userService.resendVerificationEmail();
            // Alert.success('Email verifikasi telah dikirim. Silakan cek inbox Anda.');
            alert('Email verifikasi telah dikirim. Silakan cek inbox Anda.');
        } catch (error: any) {
            // Alert.error(error.message || 'Gagal mengirim email verifikasi');
            alert(error.message || 'Gagal mengirim email verifikasi');
        }
    };

    const handleVerifyPhone = async () => {
        try {
            // In real app: await userService.sendPhoneVerification();
            // Alert.success('Kode verifikasi telah dikirim via SMS');
            alert('Kode verifikasi telah dikirim via SMS');
        } catch (error: any) {
            // Alert.error(error.message || 'Gagal mengirim kode verifikasi');
            alert(error.message || 'Gagal mengirim kode verifikasi');
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profil', icon: 'user' },
        { id: 'security', label: 'Keamanan', icon: 'shield-alt' },
        { id: 'notifications', label: 'Notifikasi', icon: 'bell' },
        { id: 'preferences', label: 'Preferensi', icon: 'cog' },
    ];

    if (authLoading || loading) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="user-profile">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Pengaturan Akun</h1>
                            <p className="text-blue-100 mt-2">
                                Kelola informasi profil dan pengaturan akun Anda
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Button
                                variant="secondary"
                                className="bg-white text-blue-600 hover:bg-gray-100"
                                onClick={() => navigate('/user/dashboard')}
                            >
                                <i className="fas fa-arrow-left mr-2"></i>
                                Kembali ke Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                            {/* User Profile Card */}
                            <div className="text-center mb-8">
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto mb-4">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                                <span className="text-white text-4xl font-bold">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <FileUploader
                                        onUpload={handleAvatarUpload}
                                        accept="image/*"
                                        maxSize={5 * 1024 * 1024} // 5MB
                                        className="absolute bottom-2 right-2"
                                    >
                                        <button
                                            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 shadow-lg"
                                            title="Ubah foto profil"
                                            disabled={uploadingAvatar}
                                        >
                                            {uploadingAvatar ? (
                                                <LoadingSpinner size="sm" />
                                            ) : (
                                                <i className="fas fa-camera"></i>
                                            )}
                                        </button>
                                    </FileUploader>
                                </div>
                                <h2 className="text-xl font-bold">{user?.name}</h2>
                                <p className="text-gray-600">{user?.email}</p>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${true ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        <i className={`fas fa-${true ? 'check-circle' : 'clock'} mr-1`}></i>
                                        {true ? 'Terverifikasi' : 'Belum Verifikasi'}
                                    </span>
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <nav className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                      w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3
                      ${activeTab === tab.id
                                                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }
                    `}
                                    >
                                        <i className={`fas fa-${tab.icon} w-5`}></i>
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>

                            {/* Account Stats */}
                            <div className="mt-8 pt-8 border-t">
                                <h3 className="font-bold text-gray-700 mb-3">Statistik Akun</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Member sejak:</span>
                                        <span className="font-medium">Jan 2024</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total pesanan:</span>
                                        <span className="font-medium">12</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Terakhir login:</span>
                                        <span className="font-medium">Hari ini</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Tab Content */}
                            <div className="p-6">
                                {/* Profile Tab */}
                                {activeTab === 'profile' && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6">Informasi Profil</h2>

                                        <form onSubmit={handleSaveProfile}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                {/* Name */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Nama Lengkap *
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        name="name"
                                                        value={profileForm.name}
                                                        onChange={handleProfileChange}
                                                        placeholder="Masukkan nama lengkap"
                                                        required
                                                    />
                                                </div>

                                                {/* Email */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Email *
                                                    </label>
                                                    <div className="relative">
                                                        <Input
                                                            type="email"
                                                            name="email"
                                                            value={profileForm.email}
                                                            onChange={handleProfileChange}
                                                            placeholder="nama@email.com"
                                                            required
                                                            disabled // Email usually can't be changed easily
                                                        />
                                                        <div className="absolute right-3 top-3">
                                                            <span className={`text-xs px-2 py-1 rounded ${true ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                {true ? 'Terverifikasi' : 'Belum'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {!true && (
                                                        <button
                                                            type="button"
                                                            onClick={handleResendVerificationEmail}
                                                            className="text-blue-600 text-sm hover:text-blue-800 mt-2"
                                                        >
                                                            <i className="fas fa-envelope mr-1"></i>
                                                            Kirim ulang email verifikasi
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Phone */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Nomor Telepon
                                                    </label>
                                                    <div className="relative">
                                                        <Input
                                                            type="tel"
                                                            name="phone"
                                                            value={profileForm.phone}
                                                            onChange={handleProfileChange}
                                                            placeholder="0812 3456 7890"
                                                        />
                                                        <div className="absolute right-3 top-3">
                                                            <span className={`text-xs px-2 py-1 rounded ${false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                {false ? 'Terverifikasi' : 'Belum'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {profileForm.phone && !false && (
                                                        <button
                                                            type="button"
                                                            onClick={handleVerifyPhone}
                                                            className="text-blue-600 text-sm hover:text-blue-800 mt-2"
                                                        >
                                                            <i className="fas fa-mobile-alt mr-1"></i>
                                                            Verifikasi nomor telepon
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Gender */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Jenis Kelamin
                                                    </label>
                                                    <select
                                                        name="gender"
                                                        value={profileForm.gender}
                                                        onChange={handleProfileChange}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="">Pilih Jenis Kelamin</option>
                                                        <option value="male">Laki-laki</option>
                                                        <option value="female">Perempuan</option>
                                                        <option value="other">Lainnya</option>
                                                    </select>
                                                </div>

                                                {/* Birth Date */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Tanggal Lahir
                                                    </label>
                                                    <Input
                                                        type="date"
                                                        name="birthDate"
                                                        value={profileForm.birthDate}
                                                        onChange={handleProfileChange}
                                                    />
                                                </div>

                                                {/* Address */}
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Alamat
                                                    </label>
                                                    <textarea
                                                        name="address"
                                                        value={profileForm.address}
                                                        onChange={handleProfileChange}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        rows={3}
                                                        placeholder="Masukkan alamat lengkap"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => navigate('/user/dashboard')}
                                                    disabled={saving}
                                                >
                                                    Batal
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    loading={saving}
                                                    disabled={saving}
                                                >
                                                    Simpan Perubahan
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Security Tab */}
                                {activeTab === 'security' && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6">Keamanan Akun</h2>

                                        <div className="space-y-6">
                                            {/* Password Section */}
                                            <div className="border rounded-lg p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg">Password</h3>
                                                        <p className="text-gray-600 text-sm">
                                                            Ubah password akun Anda
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setShowChangePassword(true)}
                                                        icon="key"
                                                    >
                                                        Ubah Password
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    Terakhir diubah: 3 bulan yang lalu
                                                </p>
                                            </div>

                                            {/* Two-Factor Authentication */}
                                            <div className="border rounded-lg p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg">Two-Factor Authentication</h3>
                                                        <p className="text-gray-600 text-sm">
                                                            Tambahkan lapisan keamanan ekstra
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => alert('Fitur 2FA akan segera tersedia')}
                                                        icon="shield-alt"
                                                    >
                                                        Aktifkan
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    Aktifkan 2FA untuk melindungi akun Anda
                                                </p>
                                            </div>

                                            {/* Login Activity */}
                                            <div className="border rounded-lg p-6">
                                                <h3 className="font-bold text-lg mb-4">Aktivitas Login</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                                        <div>
                                                            <p className="font-medium">Sekarang</p>
                                                            <p className="text-sm text-gray-600">Jakarta, Indonesia • Chrome</p>
                                                        </div>
                                                        <Badge variant="success">Aktif</Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                                        <div>
                                                            <p className="font-medium">Kemarin, 14:30</p>
                                                            <p className="text-sm text-gray-600">Jakarta, Indonesia • Mobile</p>
                                                        </div>
                                                        <Badge variant="secondary">Selesai</Badge>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="text"
                                                    className="w-full mt-4"
                                                    onClick={() => alert('Fitur keluar dari perangkat lain akan segera tersedia')}
                                                >
                                                    Keluar dari Semua Perangkat Lain
                                                </Button>
                                            </div>

                                            {/* Delete Account */}
                                            <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-red-800">Hapus Akun</h3>
                                                        <p className="text-red-600 text-sm">
                                                            Tindakan ini tidak dapat dibatalkan
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="danger"
                                                        onClick={() => setShowDeleteAccount(true)}
                                                        icon="trash-alt"
                                                    >
                                                        Hapus Akun
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-red-600">
                                                    Semua data Anda akan dihapus permanen dari sistem kami.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notifications Tab */}
                                {activeTab === 'notifications' && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6">Preferensi Notifikasi</h2>

                                        <div className="space-y-6">
                                            {/* Email Notifications */}
                                            <div className="border rounded-lg p-6">
                                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                                    <i className="fas fa-envelope text-blue-600"></i>
                                                    Email Notifications
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">Update Pesanan</p>
                                                            <p className="text-sm text-gray-600">
                                                                Dapatkan update status pesanan via email
                                                            </p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={notifications.emailOrderUpdates}
                                                                onChange={() => handleNotificationChange('emailOrderUpdates')}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">Promo & Penawaran</p>
                                                            <p className="text-sm text-gray-600">
                                                                Dapatkan informasi promo terbaru
                                                            </p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={notifications.emailPromotions}
                                                                onChange={() => handleNotificationChange('emailPromotions')}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* SMS Notifications */}
                                            <div className="border rounded-lg p-6">
                                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                                    <i className="fas fa-sms text-green-600"></i>
                                                    SMS Notifications
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">Update Pesanan</p>
                                                            <p className="text-sm text-gray-600">
                                                                Dapatkan update status pesanan via SMS
                                                            </p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={notifications.smsOrderUpdates}
                                                                onChange={() => handleNotificationChange('smsOrderUpdates')}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                        </label>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">Promo & Penawaran</p>
                                                            <p className="text-sm text-gray-600">
                                                                Dapatkan informasi promo via SMS
                                                            </p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={notifications.smsPromotions}
                                                                onChange={() => handleNotificationChange('smsPromotions')}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Push Notifications */}
                                            <div className="border rounded-lg p-6">
                                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                                    <i className="fas fa-bell text-purple-600"></i>
                                                    Push Notifications
                                                </h3>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">Push Notifications</p>
                                                        <p className="text-sm text-gray-600">
                                                            Dapatkan notifikasi di browser/device Anda
                                                        </p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notifications.pushNotifications}
                                                            onChange={() => handleNotificationChange('pushNotifications')}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Save Button */}
                                            <div className="flex justify-end">
                                                <Button
                                                    variant="primary"
                                                    onClick={() => {
                                                        // Save notification preferences
                                                        alert('Preferensi notifikasi berhasil disimpan');
                                                    }}
                                                >
                                                    Simpan Pengaturan
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Preferences Tab */}
                                {activeTab === 'preferences' && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6">Preferensi Akun</h2>

                                        <div className="space-y-6">
                                            {/* Language & Region */}
                                            <div className="border rounded-lg p-6">
                                                <h3 className="font-bold text-lg mb-4">Bahasa & Region</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Bahasa
                                                        </label>
                                                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                                            <option value="id">Bahasa Indonesia</option>
                                                            <option value="en">English</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Zona Waktu
                                                        </label>
                                                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                                            <option value="WIB">WIB (UTC+7)</option>
                                                            <option value="WITA">WITA (UTC+8)</option>
                                                            <option value="WIT">WIT (UTC+9)</option>
                                                        </select>
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Mata Uang
                                                        </label>
                                                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                                            <option value="IDR">Rupiah (IDR)</option>
                                                            <option value="USD">US Dollar (USD)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Privacy Settings */}
                                            <div className="border rounded-lg p-6">
                                                <h3 className="font-bold text-lg mb-4">Pengaturan Privasi</h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">Profil Publik</p>
                                                            <p className="text-sm text-gray-600">
                                                                Tampilkan profil Anda di review produk
                                                            </p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                defaultChecked
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">Data Analytics</p>
                                                            <p className="text-sm text-gray-600">
                                                                Izinkan kami mengumpulkan data anonim untuk meningkatkan layanan
                                                            </p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                defaultChecked
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">Personalized Ads</p>
                                                            <p className="text-sm text-gray-600">
                                                                Tampilkan iklan yang relevan dengan minat Anda
                                                            </p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Data Export */}
                                            <div className="border rounded-lg p-6">
                                                <h3 className="font-bold text-lg mb-4">Data & Privasi</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="font-medium mb-2">Export Data</p>
                                                        <p className="text-sm text-gray-600 mb-3">
                                                            Unduh salinan semua data Anda dalam format JSON
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => alert('Fitur export data akan segera tersedia')}
                                                            icon="download"
                                                        >
                                                            Export Data Saya
                                                        </Button>
                                                    </div>

                                                    <div>
                                                        <p className="font-medium mb-2">Hapus Data</p>
                                                        <p className="text-sm text-gray-600 mb-3">
                                                            Hapus semua data aktivitas Anda dari sistem kami
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => alert('Fitur hapus data akan segera tersedia')}
                                                            icon="trash"
                                                        >
                                                            Hapus Data Aktivitas
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Save Button */}
                                            <div className="flex justify-end">
                                                <Button
                                                    variant="primary"
                                                    onClick={() => alert('Preferensi berhasil disimpan')}
                                                >
                                                    Simpan Preferensi
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            <Modal
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
                title="Ubah Password"
            >
                <form onSubmit={handleChangePassword} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password Saat Ini *
                            </label>
                            <Input
                                type="password"
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Masukkan password saat ini"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password Baru *
                            </label>
                            <Input
                                type="password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="Minimal 8 karakter"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Gunakan kombinasi huruf, angka, dan simbol untuk keamanan maksimal
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Konfirmasi Password Baru *
                            </label>
                            <Input
                                type="password"
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Ketik ulang password baru"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowChangePassword(false)}
                            className="flex-1"
                            disabled={saving}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={saving}
                            disabled={saving}
                            className="flex-1"
                        >
                            Ubah Password
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Account Modal */}
            <Modal
                isOpen={showDeleteAccount}
                onClose={() => setShowDeleteAccount(false)}
                title="Hapus Akun"
                size="lg"
            >
                <div className="p-6">
                    <div className="mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-center mb-2 text-red-800">
                            Hapus Akun Permanen?
                        </h3>
                        <p className="text-gray-600 text-center">
                            Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus permanen.
                        </p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Alasan Penghapusan *
                            </label>
                            <select
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                required
                            >
                                <option value="">Pilih alasan</option>
                                <option value="privacy">Masalah privasi</option>
                                <option value="service">Tidak puas dengan layanan</option>
                                <option value="found_better">Menemukan layanan yang lebih baik</option>
                                <option value="not_using">Tidak menggunakan akun lagi</option>
                                <option value="other">Lainnya</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Feedback (Opsional)
                            </label>
                            <textarea
                                value={deleteFeedback}
                                onChange={(e) => setDeleteFeedback(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                rows={3}
                                placeholder="Beri tahu kami bagaimana kami bisa lebih baik..."
                            />
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-bold text-red-800 mb-2">
                                <i className="fas fa-exclamation-circle mr-2"></i>
                                Yang akan terjadi:
                            </h4>
                            <ul className="text-sm text-red-700 space-y-1">
                                <li>• Semua data pribadi akan dihapus permanen</li>
                                <li>• Riwayat pesanan akan dihapus</li>
                                <li>• Alamat pengiriman akan dihapus</li>
                                <li>• Wishlist dan review akan dihapus</li>
                                <li>• Akun tidak dapat dipulihkan kembali</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteAccount(false)}
                            className="flex-1"
                            disabled={saving}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteAccount}
                            loading={saving}
                            disabled={saving || !deleteReason}
                            className="flex-1"
                        >
                            Ya, Hapus Akun Saya
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserProfilePage;
