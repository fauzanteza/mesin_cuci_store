import { body, validationResult } from 'express-validator';
import AppError from '../utils/appError.js';

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join('. ');
        return next(new AppError(errorMessages, 400));
    }
    next();
};

export const validateCreateProduct = [
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category_id').notEmpty().withMessage('Category is required'),
    validate,
];

export const validateUpdateProduct = [
    body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    validate,
];
