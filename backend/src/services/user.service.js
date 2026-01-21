import models from '../models/index.js';
import AppError from '../utils/appError.js';
import cloudinary from '../config/cloudinary.js';
import NotificationService from './notification.service.js';
import bcrypt from 'bcryptjs';

const { User, Address, Order, WishlistItem, Review, Notification, AuditLog, OrderItem, Product } = models;

class UserService {
    /**
     * Get user profile
     */
    static async getProfile(userId) {
        try {
            const user = await User.findByPk(userId, {
                attributes: { exclude: ['password'] },
                include: [
                    {
                        model: Address,
                        as: 'addresses',
                        where: { isDefault: true },
                        required: false,
                        limit: 1
                    }
                ]
            });

            if (!user) {
                throw new AppError('User tidak ditemukan', 404);
            }

            // Get statistics
            const stats = await this.getUserStats(userId);

            return {
                ...user.toJSON(),
                stats
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(userId, updateData) {
        try {
            const user = await User.findByPk(userId);

            if (!user) {
                throw new AppError('User tidak ditemukan', 404);
            }

            // Don't allow email update through this endpoint
            if (updateData.email) {
                delete updateData.email;
            }

            // Update user
            await user.update(updateData);

            // Log activity
            await AuditLog.create({
                userId,
                action: 'UPDATE_PROFILE',
                description: 'User updated profile',
                metadata: JSON.stringify(Object.keys(updateData))
            });

            // Remove sensitive data
            const userResponse = user.toJSON();
            delete userResponse.password;
            delete userResponse.emailVerificationToken;
            delete userResponse.emailVerificationExpires;
            delete userResponse.resetPasswordToken;
            delete userResponse.resetPasswordExpires;

            return userResponse;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Upload user avatar
     */
    static async uploadAvatar(userId, file) {
        try {
            const user = await User.findByPk(userId);

            if (!user) {
                throw new AppError('User tidak ditemukan', 404);
            }

            // Delete old avatar if exists
            if (user.avatar) {
                const publicId = user.avatar.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`avatars/${publicId}`);
            }

            // Upload new avatar to Cloudinary
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'avatars',
                width: 300,
                height: 300,
                crop: 'fill',
                format: 'webp'
            });

            // Update user avatar
            user.avatar = result.secure_url;
            await user.save();

            // Log activity
            await AuditLog.create({
                userId,
                action: 'UPDATE_AVATAR',
                description: 'User updated avatar'
            });

            return {
                avatar: user.avatar
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user addresses
     */
    static async getAddresses(userId) {
        try {
            const addresses = await Address.findAll({
                where: { userId },
                order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
            });

            return addresses;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Add new address
     */
    static async addAddress(userId, addressData) {
        try {
            // Check if this is first address, make it default
            const addressCount = await Address.count({ where: { userId } });
            const isDefault = addressCount === 0;

            const address = await Address.create({
                ...addressData,
                userId,
                isDefault
            });

            // Log activity
            await AuditLog.create({
                userId,
                action: 'ADD_ADDRESS',
                description: 'User added new address',
                metadata: JSON.stringify({ addressId: address.id })
            });

            return address;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update address
     */
    static async updateAddress(userId, addressId, updateData) {
        try {
            const address = await Address.findOne({
                where: { id: addressId, userId }
            });

            if (!address) {
                throw new AppError('Alamat tidak ditemukan', 404);
            }

            // If setting as default, unset other defaults
            if (updateData.isDefault === true) {
                await Address.update(
                    { isDefault: false },
                    { where: { userId, isDefault: true } }
                );
            }

            await address.update(updateData);

            // Log activity
            await AuditLog.create({
                userId,
                action: 'UPDATE_ADDRESS',
                description: 'User updated address',
                metadata: JSON.stringify({ addressId })
            });

            return address;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete address
     */
    static async deleteAddress(userId, addressId) {
        try {
            const address = await Address.findOne({
                where: { id: addressId, userId }
            });

            if (!address) {
                throw new AppError('Alamat tidak ditemukan', 404);
            }

            // If deleting default address, set another as default
            if (address.isDefault) {
                const nextAddress = await Address.findOne({
                    where: { userId, id: { $ne: addressId } },
                    order: [['createdAt', 'DESC']]
                });

                if (nextAddress) {
                    nextAddress.isDefault = true;
                    await nextAddress.save();
                }
            }

            await address.destroy();

            // Log activity
            await AuditLog.create({
                userId,
                action: 'DELETE_ADDRESS',
                description: 'User deleted address',
                metadata: JSON.stringify({ addressId })
            });

            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user orders
     */
    static async getOrders(userId, filters = {}) {
        try {
            const { page = 1, limit = 10, status } = filters;
            const offset = (page - 1) * limit;

            const where = { userId };
            if (status) {
                where.status = status;
            }

            const orders = await Order.findAndCountAll({
                where,
                include: [
                    {
                        model: OrderItem,
                        as: 'items',
                        include: [{
                            model: Product,
                            attributes: ['id', 'name', 'image']
                        }]
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                orders: orders.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: orders.count,
                    pages: Math.ceil(orders.count / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get order details
     */
    static async getOrderDetails(userId, orderId) {
        try {
            const order = await Order.findOne({
                where: { id: orderId, userId },
                include: [
                    {
                        model: OrderItem,
                        as: 'items',
                        include: [{
                            model: Product,
                            attributes: ['id', 'name', 'image', 'price']
                        }]
                    },
                    {
                        model: Address,
                        as: 'shippingAddress'
                    },
                    {
                        model: models.Payment,
                        as: 'payment'
                    }
                ]
            });

            if (!order) {
                throw new AppError('Pesanan tidak ditemukan', 404);
            }

            return order;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get wishlist
     */
    static async getWishlist(userId, filters = {}) {
        try {
            const { page = 1, limit = 20 } = filters;
            const offset = (page - 1) * limit;

            const wishlist = await WishlistItem.findAndCountAll({
                where: { userId },
                include: [{
                    model: Product,
                    as: 'product',
                    include: [{
                        model: models.Brand,
                        attributes: ['id', 'name']
                    }]
                }],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                items: wishlist.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: wishlist.count,
                    pages: Math.ceil(wishlist.count / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Add to wishlist
     */
    static async addToWishlist(userId, productId) {
        try {
            const product = await Product.findByPk(productId);

            if (!product) {
                throw new AppError('Produk tidak ditemukan', 404);
            }

            // Check if already in wishlist
            const existingItem = await WishlistItem.findOne({
                where: { userId, productId }
            });

            if (existingItem) {
                throw new AppError('Produk sudah ada di wishlist', 400);
            }

            const wishlistItem = await WishlistItem.create({
                userId,
                productId
            });

            // Log activity
            await AuditLog.create({
                userId,
                action: 'ADD_TO_WISHLIST',
                description: 'User added product to wishlist',
                metadata: JSON.stringify({ productId })
            });

            return wishlistItem;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Remove from wishlist
     */
    static async removeFromWishlist(userId, productId) {
        try {
            const wishlistItem = await WishlistItem.findOne({
                where: { userId, productId }
            });

            if (!wishlistItem) {
                throw new AppError('Item tidak ditemukan di wishlist', 404);
            }

            await wishlistItem.destroy();

            // Log activity
            await AuditLog.create({
                userId,
                action: 'REMOVE_FROM_WISHLIST',
                description: 'User removed product from wishlist',
                metadata: JSON.stringify({ productId })
            });

            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user reviews
     */
    static async getReviews(userId, filters = {}) {
        try {
            const { page = 1, limit = 10 } = filters;
            const offset = (page - 1) * limit;

            const reviews = await Review.findAndCountAll({
                where: { userId },
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'image']
                }],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                reviews: reviews.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: reviews.count,
                    pages: Math.ceil(reviews.count / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get notifications
     */
    static async getNotifications(userId, filters = {}) {
        try {
            const { page = 1, limit = 20, unreadOnly = false } = filters;
            const offset = (page - 1) * limit;

            const where = { userId };
            if (unreadOnly) {
                where.isRead = false;
            }

            const notifications = await Notification.findAndCountAll({
                where,
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                notifications: notifications.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: notifications.count,
                    pages: Math.ceil(notifications.count / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mark notification as read
     */
    static async markNotificationAsRead(userId, notificationId) {
        try {
            const notification = await Notification.findOne({
                where: { id: notificationId, userId }
            });

            if (!notification) {
                throw new AppError('Notifikasi tidak ditemukan', 404);
            }

            notification.isRead = true;
            notification.readAt = new Date();
            await notification.save();

            return notification;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mark all notifications as read
     */
    static async markAllNotificationsAsRead(userId) {
        try {
            await Notification.update(
                { isRead: true, readAt: new Date() },
                { where: { userId, isRead: false } }
            );

            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user statistics
     */
    static async getUserStats(userId) {
        try {
            const [
                orderCount,
                wishlistCount,
                reviewCount,
                unreadNotifications
            ] = await Promise.all([
                Order.count({ where: { userId } }),
                WishlistItem.count({ where: { userId } }),
                Review.count({ where: { userId } }),
                Notification.count({ where: { userId, isRead: false } })
            ]);

            return {
                orders: orderCount,
                wishlist: wishlistCount,
                reviews: reviewCount,
                unreadNotifications
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete user account
     */
    static async deleteAccount(userId, password) {
        try {
            const user = await User.findByPk(userId);

            if (!user) {
                throw new AppError('User tidak ditemukan', 404);
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new AppError('Password salah', 401);
            }

            // Soft delete user
            user.isActive = false;
            user.deletedAt = new Date();
            await user.save();

            // Log activity
            await AuditLog.create({
                userId,
                action: 'DELETE_ACCOUNT',
                description: 'User deleted account'
            });

            // Send goodbye email
            await NotificationService.sendEmail(
                user.email,
                'accountDeleted',
                { name: user.name }
            );

            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user activity log
     */
    static async getActivityLog(userId, filters = {}) {
        try {
            const { page = 1, limit = 50, startDate, endDate } = filters;
            const offset = (page - 1) * limit;

            const where = { userId };

            if (startDate && endDate) {
                where.createdAt = {
                    $between: [new Date(startDate), new Date(endDate)]
                };
            }

            const activities = await AuditLog.findAndCountAll({
                where,
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            return {
                activities: activities.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: activities.count,
                    pages: Math.ceil(activities.count / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }
}

export default UserService;
