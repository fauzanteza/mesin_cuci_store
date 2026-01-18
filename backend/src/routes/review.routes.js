import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(reviewController.getReviews)
    .post(protect, reviewController.createReview);

router.route('/:id')
    .delete(protect, restrictTo('admin'), reviewController.deleteReview);

export default router;
