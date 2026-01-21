import models from '../models/index.js';

const { WishlistItem, Product, ProductImage } = models;

class WishlistService {
    async getUserWishlist(userId) {
        return await WishlistItem.findAll({
            where: { userId },
            include: [{
                model: Product,
                as: 'product',
                include: [{
                    model: ProductImage,
                    as: 'images',
                    attributes: ['url', 'isPrimary']
                }]
            }],
            order: [['createdAt', 'DESC']]
        });
    }

    async addToWishlist(productId, userId) {
        // Check if already in wishlist
        const existing = await WishlistItem.findOne({
            where: { productId, userId }
        });

        if (existing) {
            throw new Error('Product already in wishlist');
        }

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        return await WishlistItem.create({
            productId,
            userId
        });
    }

    async removeFromWishlist(productId, userId) {
        const wishlistItem = await WishlistItem.findOne({
            where: { productId, userId }
        });

        if (!wishlistItem) {
            throw new Error('Product not in wishlist');
        }

        await wishlistItem.destroy();
    }

    async clearWishlist(userId) {
        await WishlistItem.destroy({
            where: { userId }
        });
    }

    async isInWishlist(productId, userId) {
        const item = await WishlistItem.findOne({
            where: { productId, userId }
        });
        return !!item;
    }
}

export default new WishlistService();
