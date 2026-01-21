const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const NotificationService = require('./notification.service');
const AppError = require('../utils/appError');
const { emailTemplates } = require('../config/mailer');

class AuthService {
    /**
     * Register new user
     */
    static async register(userData) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({
                where: { email: userData.email }
            });

            if (existingUser) {
                throw new AppError('Email sudah terdaftar', 400);
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Create user
            const user = await User.create({
                ...userData,
                password: hashedPassword,
                isActive: true,
                role: 'customer',
                emailVerified: false
            });

            // Generate verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');
            user.emailVerificationToken = verificationToken;
            user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            await user.save();

            // Send welcome email
            await NotificationService.sendEmail(
                user.email,
                'welcome',
                { name: user.name }
            );

            // Send verification email
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
            await NotificationService.sendEmail(
                user.email,
                'verification',
                {
                    name: user.name,
                    verificationUrl
                }
            );

            // Generate tokens
            const tokens = this.generateTokens(user);

            // Remove sensitive data
            const userResponse = user.toJSON();
            delete userResponse.password;
            delete userResponse.emailVerificationToken;
            delete userResponse.emailVerificationExpires;
            delete userResponse.resetPasswordToken;
            delete userResponse.resetPasswordExpires;

            return {
                user: userResponse,
                tokens
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Login user
     */
    static async login(email, password) {
        try {
            // Find user
            const user = await User.findOne({ where: { email } });

            if (!user) {
                throw new AppError('Email atau password salah', 401);
            }

            // Check if user is active
            if (!user.isActive) {
                throw new AppError('Akun Anda dinonaktifkan', 403);
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new AppError('Email atau password salah', 401);
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Generate tokens
            const tokens = this.generateTokens(user);

            // Remove sensitive data
            const userResponse = user.toJSON();
            delete userResponse.password;
            delete userResponse.emailVerificationToken;
            delete userResponse.emailVerificationExpires;
            delete userResponse.resetPasswordToken;
            delete userResponse.resetPasswordExpires;

            // Log login activity
            const AuditLog = require('../models/AuditLog');
            await AuditLog.create({
                userId: user.id,
                action: 'LOGIN',
                description: 'User logged in',
                ipAddress: '127.0.0.1', // In production, get from request
                userAgent: 'API Client'
            });

            return {
                user: userResponse,
                tokens
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verify email
     */
    static async verifyEmail(token) {
        try {
            const user = await User.findOne({
                where: {
                    emailVerificationToken: token,
                    emailVerificationExpires: { $gt: new Date() }
                }
            });

            if (!user) {
                throw new AppError('Token verifikasi tidak valid atau sudah kadaluarsa', 400);
            }

            user.emailVerified = true;
            user.emailVerificationToken = null;
            user.emailVerificationExpires = null;
            await user.save();

            // Send confirmation email
            await NotificationService.sendEmail(
                user.email,
                'emailVerified',
                { name: user.name }
            );

            return {
                success: true,
                message: 'Email berhasil diverifikasi'
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Forgot password
     */
    static async forgotPassword(email) {
        try {
            const user = await User.findOne({ where: { email } });

            if (!user) {
                // Don't reveal that user doesn't exist
                return {
                    success: true,
                    message: 'Jika email terdaftar, instruksi reset password akan dikirim'
                };
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
            await user.save();

            // Send reset email
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            await NotificationService.sendEmail(
                user.email,
                'passwordReset',
                {
                    name: user.name,
                    resetUrl,
                    expiryHours: 1
                }
            );

            return {
                success: true,
                message: 'Instruksi reset password telah dikirim ke email Anda'
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Reset password
     */
    static async resetPassword(token, newPassword) {
        try {
            const user = await User.findOne({
                where: {
                    resetPasswordToken: token,
                    resetPasswordExpires: { $gt: new Date() }
                }
            });

            if (!user) {
                throw new AppError('Token reset password tidak valid atau sudah kadaluarsa', 400);
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            user.password = hashedPassword;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            user.passwordChangedAt = new Date();
            await user.save();

            // Send confirmation email
            await NotificationService.sendEmail(
                user.email,
                'passwordChanged',
                { name: user.name }
            );

            // Logout all sessions
            await this.invalidateUserSessions(user.id);

            return {
                success: true,
                message: 'Password berhasil direset'
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Change password
     */
    static async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await User.findByPk(userId);

            if (!user) {
                throw new AppError('User tidak ditemukan', 404);
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                throw new AppError('Password saat ini salah', 401);
            }

            // Check if new password is same as old
            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                throw new AppError('Password baru harus berbeda dengan password lama', 400);
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            user.password = hashedPassword;
            user.passwordChangedAt = new Date();
            await user.save();

            // Send confirmation email
            await NotificationService.sendEmail(
                user.email,
                'passwordChanged',
                { name: user.name }
            );

            // Logout all sessions except current
            await this.invalidateUserSessions(user.id, true);

            return {
                success: true,
                message: 'Password berhasil diubah'
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Refresh token
     */
    static async refreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            const user = await User.findByPk(decoded.id);
            if (!user || !user.isActive) {
                throw new AppError('User tidak ditemukan atau dinonaktifkan', 401);
            }

            // Check if token is in blacklist
            const TokenBlacklist = require('../models/TokenBlacklist');
            const blacklisted = await TokenBlacklist.findOne({
                where: { token: refreshToken }
            });

            if (blacklisted) {
                throw new AppError('Token tidak valid', 401);
            }

            // Generate new tokens
            const tokens = this.generateTokens(user);

            // Blacklist old refresh token
            await TokenBlacklist.create({
                token: refreshToken,
                expiresAt: new Date(decoded.exp * 1000)
            });

            return tokens;
        } catch (error) {
            throw new AppError('Token tidak valid', 401);
        }
    }

    /**
     * Logout
     */
    static async logout(userId, refreshToken) {
        try {
            // Blacklist refresh token
            if (refreshToken) {
                const TokenBlacklist = require('../models/TokenBlacklist');
                const decoded = jwt.decode(refreshToken);

                await TokenBlacklist.create({
                    token: refreshToken,
                    expiresAt: new Date(decoded.exp * 1000)
                });
            }

            // Log logout activity
            const AuditLog = require('../models/AuditLog');
            await AuditLog.create({
                userId,
                action: 'LOGOUT',
                description: 'User logged out',
                ipAddress: '127.0.0.1',
                userAgent: 'API Client'
            });

            return {
                success: true,
                message: 'Berhasil logout'
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Generate JWT tokens
     */
    static generateTokens(user) {
        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
        );

        return {
            accessToken,
            refreshToken,
            expiresIn: 15 * 60 // 15 minutes in seconds
        };
    }

    /**
     * Invalidate all user sessions
     */
    static async invalidateUserSessions(userId, keepCurrent = false) {
        try {
            // In production, implement session invalidation logic
            // For now, we'll just update password change timestamp
            const user = await User.findByPk(userId);
            if (user) {
                user.passwordChangedAt = new Date();
                await user.save();
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user permissions
     */
    static async getUserPermissions(userId) {
        try {
            const user = await User.findByPk(userId, {
                attributes: ['id', 'role']
            });

            if (!user) {
                return [];
            }

            // Define permissions based on role
            const rolePermissions = {
                admin: [
                    'view_dashboard',
                    'manage_products',
                    'manage_orders',
                    'manage_users',
                    'manage_categories',
                    'manage_brands',
                    'view_reports',
                    'manage_settings'
                ],
                staff: [
                    'view_dashboard',
                    'manage_products',
                    'manage_orders',
                    'view_reports'
                ],
                customer: [
                    'view_products',
                    'place_orders',
                    'view_orders',
                    'manage_profile'
                ]
            };

            return rolePermissions[user.role] || [];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Validate token
     */
    static async validateToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!user || !user.isActive) {
                return null;
            }

            // Check if password was changed after token was issued
            if (user.passwordChangedAt) {
                const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
                if (decoded.iat < changedTimestamp) {
                    return null;
                }
            }

            return user;
        } catch (error) {
            return null;
        }
    }
}

module.exports = AuthService;
