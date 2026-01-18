import models from '../models/index.js';
import AppError from '../utils/appError.js';

const { Payment } = models;

export const getPayments = async (req, res, next) => {
    try {
        const payments = await Payment.findAll();
        res.status(200).json({ status: 'success', data: { payments } });
    } catch (error) {
        next(error);
    }
};

export const getPayment = async (req, res, next) => {
    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) return next(new AppError('Payment not found', 404));
        res.status(200).json({ status: 'success', data: { payment } });
    } catch (error) {
        next(error);
    }
};

export const updatePaymentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const payment = await Payment.findByPk(id);
        if (!payment) return next(new AppError('Payment not found', 404));

        await payment.update({ status });

        res.status(200).json({ status: 'success', data: { payment } });
    } catch (error) {
        next(error);
    }
};
