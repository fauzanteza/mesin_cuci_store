import models from '../models/index.js';
import AppError from '../utils/appError.js';

const { Category } = models;

export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json({ status: 'success', data: { categories } });
    } catch (error) {
        next(error);
    }
};

export const getCategory = async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return next(new AppError('Category not found', 404));
        res.status(200).json({ status: 'success', data: { category } });
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ status: 'success', data: { category } });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return next(new AppError('Category not found', 404));
        await category.update(req.body);
        res.status(200).json({ status: 'success', data: { category } });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return next(new AppError('Category not found', 404));
        await category.destroy();
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};
