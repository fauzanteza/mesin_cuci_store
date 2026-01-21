import models from '../models/index.js';
import AppError from '../utils/appError.js';
import { Op } from 'sequelize';

const { User, Address, Order } = models;

export const getUsers = async (req, res, next) => {
    try {
        const { search, role, status, page = 1, limit = 10, sort = 'newest' } = req.query;
        const where = {};

        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }
        if (role && role !== 'all') {
            where.role = role;
        }
        if (status && status !== 'all') {
            where.status = status; // Assuming User model has status
        }

        const orderClause = [];
        if (sort === 'newest') orderClause.push(['createdAt', 'DESC']);
        else if (sort === 'oldest') orderClause.push(['createdAt', 'ASC']);
        else if (sort === 'name') orderClause.push(['name', 'ASC']);
        else orderClause.push(['createdAt', 'DESC']);

        const { rows, count } = await User.findAndCountAll({
            where,
            order: orderClause,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({
            status: 'success',
            data: {
                users: rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [
                { model: Address, as: 'addresses' }
            ]
        });
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req, res, next) => {
    try {
        const newUser = await User.create(req.body);
        // Exclude password from response
        const userResponse = newUser.toJSON();
        delete userResponse.password;

        res.status(201).json({
            status: 'success',
            data: { user: userResponse }
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        await user.update(req.body);

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }
        await user.destroy();
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }
        await user.update({ status });
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus
};
