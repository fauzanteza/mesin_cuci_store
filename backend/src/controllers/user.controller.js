import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { addresses: true }
    });

    if (user) {
        res.json({ success: true, data: user });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });

    if (user) {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                name: req.body.name || user.name,
                phone: req.body.phone || user.phone,
                avatar: req.body.avatar || user.avatar,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                avatar: true,
            }
        });

        res.json({ success: true, data: updatedUser });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid current password');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
    });

    res.json({ success: true, message: 'Password updated' });
};

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
export const getAddresses = async (req, res) => {
    const addresses = await prisma.address.findMany({
        where: { userId: req.user.id }
    });
    res.json({ success: true, data: addresses });
};

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
// Body: label, recipientName, phone, addressLine1, city, province, postalCode, isDefault
export const addAddress = async (req, res) => {
    const {
        label, recipientName, phone, addressLine1,
        city, province, postalCode, isDefault
    } = req.body;

    // If setting as default, unset others first
    if (isDefault) {
        await prisma.address.updateMany({
            where: { userId: req.user.id },
            data: { isDefault: false }
        });
    }

    const address = await prisma.address.create({
        data: {
            userId: req.user.id,
            label, // e.g., 'Home', 'Office'
            recipientName,
            phone,
            addressLine1,
            city,
            province,
            postalCode,
            isDefault: isDefault || false
        }
    });

    res.status(201).json({ success: true, data: address });
};
