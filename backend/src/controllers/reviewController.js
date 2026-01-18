import models from '../models/index.js';
import AppError from '../utils/appError.js';

const { Review } = models;

export const getReviews = async (req, res, next) => {
    try {
        const reviews = await Review.findAll();
        res.status(200).json({ status: 'success', data: { reviews } });
    } catch (error) {
        next(error);
    }
};

export const createReview = async (req, res, next) => {
    try {
        // Simple implementation
        const review = await Review.create({ ...req.body, user_id: req.user.id });
        res.status(201).json({ status: 'success', data: { review } });
    } catch (error) {
        next(error);
    }
};

export const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return next(new AppError('Review not found', 404));

        await review.destroy();
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};
