import models from '../models/index.js';
import AppError from '../utils/appError.js';

const { User } = models;

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.status(200).json({ status: 'success', data: { users } });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
        if (!user) return next(new AppError('User not found', 404));
        res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return next(new AppError('User not found', 404));

        await user.update(req.body);
        res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return next(new AppError('User not found', 404));

        await user.destroy();
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};
