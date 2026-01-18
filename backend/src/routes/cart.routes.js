import express from 'express';
import * as cartController from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(cartController.getCart)
    .post(cartController.addToCart)
    .delete(cartController.clearCart);

router.route('/:id')
    .put(cartController.updateCartItem)
    .delete(cartController.removeFromCart);

export default router;
