import crypto from 'crypto';
import models from '../models/index.js';
import AppError from '../utils/appError.js';
import { signToken, signRefreshToken } from '../middleware/auth.js';
import EmailService from '../services/email.service.js';
import logger from '../utils/logger.js';

const { User } = models;

// Register new user
export const register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return next(new AppError('Email already registered', 400));
        }

        // Create new user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            phone,
            role: 'customer',
        });

        // Generate token
        const token = signToken(user.id);
        const refreshToken = signRefreshToken(user.id);

        // Remove password from output
        user.password = undefined;

        // Send verification email
        try {
            const verificationToken = crypto.randomBytes(32).toString('hex');
            user.email_verification_token = crypto
                .createHash('sha256')
                .update(verificationToken)
                .digest('hex');
            user.email_verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            await user.save({ validate: false });

            const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
            await EmailService.sendVerificationEmail(user.email, user.name, verificationUrl);
        } catch (emailError) {
            logger.error('Failed to send verification email:', emailError);
        }

        // Set cookies
        res.cookie('token', token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.cookie('refreshToken', refreshToken, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.status(201).json({
            status: 'success',
            token,
            refreshToken,
            data: {
                user,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Login user
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email and password exist
        if (!email || !password) {
            return next(new AppError('Please provide email and password', 400));
        }

        // Check if user exists and password is correct
        const user = await User.findOne({
            where: { email: email.toLowerCase() },
            attributes: { include: ['password'] },
        });

        if (!user || !(await user.comparePassword(password))) {
            return next(new AppError('Incorrect email or password', 401));
        }

        // Check if user is active
        if (!user.is_active) {
            return next(new AppError('Your account has been deactivated', 401));
        }

        // Update last login
        user.last_login = new Date();
        await user.save({ validate: false });

        // Generate tokens
        const token = signToken(user.id);
        const refreshToken = signRefreshToken(user.id);

        // Remove password from output
        user.password = undefined;

        // Set cookies
        res.cookie('token', token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.cookie('refreshToken', refreshToken, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.status(200).json({
            status: 'success',
            token,
            refreshToken,
            data: {
                user,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Logout user
export const logout = (req, res) => {
    res.cookie('token', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.cookie('refreshToken', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
    });
};

// Get current user
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [
                {
                    model: models.Address,
                    as: 'addresses',
                    where: { is_default: true },
                    required: false,
                    limit: 1,
                },
            ],
        });

        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Update user profile
export const updateMe = async (req, res, next) => {
    try {
        const { name, phone, avatar } = req.body;

        // Filter allowed fields
        const allowedFields = ['name', 'phone', 'avatar'];
        const filteredBody = {};

        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredBody[key] = req.body[key];
            }
        });

        // Update user
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        await user.update(filteredBody);

        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Change password
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findByPk(req.user.id, {
            attributes: { include: ['password'] },
        });

        // Check current password
        if (!(await user.comparePassword(currentPassword))) {
            return next(new AppError('Your current password is incorrect', 401));
        }

        // Update password
        user.password = newPassword;
        user.password_changed_at = new Date();
        await user.save();

        // Generate new token
        const token = signToken(user.id);

        res.status(200).json({
            status: 'success',
            token,
            message: 'Password updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Forgot password
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Get user
        const user = await User.findOne({ where: { email: email.toLowerCase() } });
        if (!user) {
            return next(new AppError('There is no user with that email address', 404));
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.reset_token = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.reset_token_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await user.save({ validate: false });

        // Send email
        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

        try {
            await EmailService.sendPasswordResetEmail(user.email, user.name, resetUrl);

            res.status(200).json({
                status: 'success',
                message: 'Password reset instructions sent to email',
            });
        } catch (emailError) {
            user.reset_token = undefined;
            user.reset_token_expires = undefined;
            await user.save({ validate: false });

            return next(new AppError('There was an error sending the email. Please try again later.', 500));
        }
    } catch (error) {
        next(error);
    }
};

// Reset password
export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            where: {
                reset_token: hashedToken,
                reset_token_expires: { [models.sequelize.Op.gt]: new Date() },
            },
        });

        if (!user) {
            return next(new AppError('Token is invalid or has expired', 400));
        }

        // Update password
        user.password = password;
        user.reset_token = null;
        user.reset_token_expires = null;
        user.password_changed_at = new Date();
        await user.save();

        // Generate new token
        const authToken = signToken(user.id);

        res.status(200).json({
            status: 'success',
            token: authToken,
            message: 'Password reset successful',
        });
    } catch (error) {
        next(error);
    }
};

// Refresh token
export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return next(new AppError('Refresh token is required', 400));
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            return next(new AppError('Invalid refresh token', 401));
        }

        // Check if user still exists
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return next(new AppError('User no longer exists', 401));
        }

        // Generate new tokens
        const newToken = signToken(user.id);
        const newRefreshToken = signRefreshToken(user.id);

        res.status(200).json({
            status: 'success',
            token: newToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        next(error);
    }
};

// Verify email
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        // Hash token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            where: {
                email_verification_token: hashedToken,
                email_verification_expires: { [models.sequelize.Op.gt]: new Date() },
            },
        });

        if (!user) {
            return next(new AppError('Token is invalid or has expired', 400));
        }

        // Update user
        user.email_verified = true;
        user.email_verification_token = null;
        user.email_verification_expires = null;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully',
        });
    } catch (error) {
        next(error);
    }
};
