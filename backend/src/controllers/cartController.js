import models from '../models/index.js';
import AppError from '../utils/appError.js';

const { CartItem, Product, ProductVariant } = models;

export const getCart = async (req, res, next) => {
    try {
        const cartItems = await CartItem.findAll({
            where: { user_id: req.user.id },
            include: [
                { model: Product, as: 'product' },
                { model: ProductVariant, as: 'variant' }
            ]
        });
        res.status(200).json({ status: 'success', data: { cartItems } });
    } catch (error) {
        next(error);
    }
};

export const addToCart = async (req, res, next) => {
    try {
        const { product_id, variant_id, quantity } = req.body;
        let item = await CartItem.findOne({
            where: { user_id: req.user.id, product_id, variant_id }
        });

        if (item) {
            item.quantity += quantity;
            await item.save();
        } else {
            item = await CartItem.create({
                user_id: req.user.id,
                product_id,
                variant_id,
                quantity
            });
        }

        res.status(200).json({ status: 'success', data: { item } });
    } catch (error) {
        next(error);
    }
};

export const updateCartItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        const item = await CartItem.findOne({ where: { id, user_id: req.user.id } });
        if (!item) return next(new AppError('Item not found', 404));

        item.quantity = quantity;
        await item.save();

        res.status(200).json({ status: 'success', data: { item } });
    } catch (error) {
        next(error);
    }
};

export const removeFromCart = async (req, res, next) => {
    try {
        const { id } = req.params;
        await CartItem.destroy({ where: { id, user_id: req.user.id } });
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};

export const clearCart = async (req, res, next) => {
    try {
        await CartItem.destroy({ where: { user_id: req.user.id } });
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};
