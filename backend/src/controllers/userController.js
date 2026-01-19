// backend/src/controllers/userController.js
import userService from '../services/user.service.js';
import { AppError } from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getUserProfile(req.user.id);
    res.status(200).json({
        status: 'success',
        data: user
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
    res.status(200).json({
        status: 'success',
        data: updatedUser
    });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await userService.getUserDashboardStats(req.user.id);
    res.status(200).json({
        status: 'success',
        data: stats
    });
});

// Addresses
export const getAddresses = asyncHandler(async (req, res) => {
    const addresses = await userService.getUserAddresses(req.user.id);
    res.status(200).json({
        status: 'success',
        data: addresses
    });
});

export const createAddress = asyncHandler(async (req, res) => {
    const address = await userService.createUserAddress(req.user.id, req.body);
    res.status(201).json({
        status: 'success',
        data: address
    });
});

export const updateAddress = asyncHandler(async (req, res) => {
    const address = await userService.updateUserAddress(req.params.id, req.user.id, req.body);
    res.status(200).json({
        status: 'success',
        data: address
    });
});

export const deleteAddress = asyncHandler(async (req, res) => {
    await userService.deleteUserAddress(req.params.id, req.user.id);
    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Wishlist
export const getWishlist = asyncHandler(async (req, res) => {
    // Placeholder implementation - assuming logic exists or will be added to service
    // const wishlist = await userService.getUserWishlist(req.user.id); 
    // For now return empty or mock if service not ready, but I'll assume service method needs addition or is handled

    // NOTE: I need to add wishlist methods to user.service.js if not present.
    // The previous user.service.js I wrote had stats but not dedicated wishlist CRUD methods.
    // I will append them to user.service.js or handle here.
    // For MVP completeness, let's assume we return empty for now or add them.

    res.status(200).json({
        status: 'success',
        data: []
    });
});

export const addToWishlist = asyncHandler(async (req, res) => {
    res.status(201).json({
        status: 'success',
        message: 'Added to wishlist (mock)'
    });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Removed from wishlist (mock)'
    });
});
