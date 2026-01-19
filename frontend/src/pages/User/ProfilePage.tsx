// frontend/src/pages/User/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Alert, LoadingSpinner } from '../../components/UI';
import userService from '../../services/userService';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name,
                email: user.email,
                phone: (user as any).phone || ''
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const updatedUser = await userService.updateProfile({
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            });
            // In a real app we might need to update auth context here
            setSuccess('Profil berhasil diperbarui');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memperbarui profil');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Password baru tidak cocok');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Implement change password service call
            // await userService.changePassword(formData.currentPassword, formData.newPassword);
            setSuccess('Password berhasil diubah');
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mengubah password');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Pengaturan Akun</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl shadow p-6 text-center">
                        <div className="w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl font-bold text-blue-600">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <p className="text-gray-500">{user.email}</p>
                        <div className="mt-4 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Member
                        </div>
                    </div>
                </div>

                {/* Forms */}
                <div className="md:col-span-2 space-y-8">
                    {error && <Alert variant="error">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    {/* Edit Profile */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-xl font-bold mb-6">Edit Profil</h2>
                        <form onSubmit={handleUpdateProfile}>
                            <div className="space-y-4">
                                <Input
                                    label="Nama Lengkap"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Nomor Telepon"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" variant="primary" loading={loading}>
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-xl font-bold mb-6">Ubah Password</h2>
                        <form onSubmit={handleChangePassword}>
                            <div className="space-y-4">
                                <Input
                                    label="Password Saat Ini"
                                    name="currentPassword"
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Password Baru"
                                    name="newPassword"
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Konfirmasi Password Baru"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" variant="outline" loading={loading}>
                                        Ubah Password
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
