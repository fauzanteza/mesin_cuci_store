// backend/src/services/user.service.js
import { User, Order, Address, Review, WishlistItem, sequelize } from '../models/index.js';
import { AppError } from '../utils/appError.js';
import { Op } from 'sequelize';

class UserService {
    async getUserProfile(userId) {
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Address,
                    as: 'addresses',
                    limit: 5
                }
            ]
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }

    async updateUserProfile(userId, updateData) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Remove password from update data
        const { password, ...safeUpdateData } = updateData;

        // If updating email, check if it's already taken
        if (safeUpdateData.email && safeUpdateData.email !== user.email) {
            const existingUser = await User.findOne({
                where: { email: safeUpdateData.email }
            });

            if (existingUser) {
                throw new AppError('Email already in use', 400);
            }
        }

        await user.update(safeUpdateData);

        // Return updated user without password
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        return updatedUser;
    }

    async getUserDashboardStats(userId) {
        // Total orders
        const totalOrders = await Order.count({
            where: { userId }
        });

        // Orders by status
        const ordersByStatus = await Order.findAll({
            where: { userId },
            attributes: ['status', [sequelize.fn('COUNT', 'id'), 'count']],
            group: ['status']
        });

        // Total spent
        const totalSpent = await Order.sum('total', {
            where: {
                userId,
                status: 'delivered'
            }
        });

        // Wishlist count
        const wishlistCount = await WishlistItem.count({
            where: { userId }
        });

        // Review count
        const reviewCount = await Review.count({
            where: { userId }
        });

        return {
            totalOrders,
            ordersByStatus: ordersByStatus.reduce((acc, item) => {
                acc[item.status] = item.dataValues.count;
                return acc;
            }, {}),
            totalSpent: totalSpent || 0,
            wishlistCount,
            reviewCount
        };
    }

    async getUserAddresses(userId) {
        const addresses = await Address.findAll({
            where: { userId },
            order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
        });

        return addresses;
    }

    async createUserAddress(userId, addressData) {
        const addressesCount = await Address.count({ where: { userId } });

        // If this is the first address, set it as default
        const address = await Address.create({
            ...addressData,
            userId,
            isDefault: addressesCount === 0
        });

        return address;
    }

    async updateUserAddress(addressId, userId, updateData) {
        const address = await Address.findOne({
            where: { id: addressId, userId }
        });

        if (!address) {
            throw new AppError('Address not found', 404);
        }

        // If setting as default, update all other addresses
        if (updateData.isDefault === true) {
            await Address.update(
                { isDefault: false },
                { where: { userId, id: { [Op.ne]: addressId } } }
            );
        }

        await address.update(updateData);

        return address;
    }

    async deleteUserAddress(addressId, userId) {
        const address = await Address.findOne({
            where: { id: addressId, userId }
        });

        if (!address) {
            throw new AppError('Address not found', 404);
        }

        // If deleting default address, set another as default
        if (address.isDefault) {
            const anotherAddress = await Address.findOne({
                where: { userId, id: { [Op.ne]: addressId } },
                order: [['createdAt', 'DESC']]
            });

            if (anotherAddress) {
                await anotherAddress.update({ isDefault: true });
            }
        }

        await address.destroy();

        return true;
    }
}

export default new UserService();
