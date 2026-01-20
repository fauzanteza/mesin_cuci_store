import { User } from '../models/User.js';
import { Address } from '../models/Address.js'; // Assuming this exists
import { Order } from '../models/Order.js'; // Assuming this exists
import AppError from '../utils/AppError.js';

export const getUsers = async (req, res, next) => {
    try {
        const { search, role, status, page = 1, limit = 10, sort = 'newest' } = req.query;
        const query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (role && role !== 'all') {
            query.role = role;
        }
        if (status && status !== 'all') {
            query.status = status;
        }

        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            name: { name: 1 },
        };

        const users = await User.find(query)
            .sort(sortOptions[sort] || { createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            status: 'success',
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Fetch additional data like addresses, orders, etc. if needed
        // For mongoDB usually we can just return the user, or populate.

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
        res.status(201).json({
            status: 'success',
            data: { user: newUser }
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedUser) {
            return next(new AppError('User not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { user: updatedUser }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }
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
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
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

export default {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus
};
