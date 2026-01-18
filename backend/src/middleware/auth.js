import jwt from 'jsonwebtoken';
import models from '../models/index.js';
import AppError from '../utils/appError.js';

// We need to wait for models to be initialized before using them, 
// but since this is ES module, imports are hoisted. 
// We will access models dynamically inside functions or ensure models/index.js is solid.

// Protect routes - require authentication
export const protect = async (req, res, next) => {
    try {
        let token;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Get token from cookies
        else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return next(new AppError('You are not logged in. Please log in to get access.', 401));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        // Note: models might not be fully loaded if circular dependency, but usually fine.
        const user = await models.User.findByPk(decoded.id);
        if (!user) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }

        // Check if user changed password after token was issued
        if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
            return next(new AppError('User recently changed password. Please log in again.', 401));
        }

        // Grant access to protected route
        req.user = user;
        next();
    } catch (error) {
        return next(new AppError('Authentication failed. Please log in again.', 401));
    }
};

// Restrict to specific roles
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action.', 403)
            );
        }
        next();
    };
};

// Check ownership (user can only access their own resources)
export const checkOwnership = (modelName, paramName = 'id') => {
    return async (req, res, next) => {
        try {
            const Model = models[modelName];
            if (!Model) {
                return next(new AppError('Model not found', 500));
            }

            const resource = await Model.findByPk(req.params[paramName]);
            if (!resource) {
                return next(new AppError('Resource not found', 404));
            }

            // Admin can access any resource
            if (req.user.role === 'admin') {
                req.resource = resource;
                return next();
            }

            // Check if user owns the resource
            if (resource.user_id !== req.user.id) {
                return next(new AppError('You are not authorized to access this resource', 403));
            }

            req.resource = resource;
            next();
        } catch (error) {
            next(error);
        }
    };
};

// Generate JWT token
export const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// Generate refresh token
export const signRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    });
};

export default { protect, restrictTo, checkOwnership, signToken, signRefreshToken };
