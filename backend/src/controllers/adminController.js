import models from '../models/index.js';

export const getDashboardStats = async (req, res, next) => {
    try {
        // Placeholder stats
        res.status(200).json({ status: 'success', data: { stats: 'Todo' } });
    } catch (error) {
        next(error);
    }
};
