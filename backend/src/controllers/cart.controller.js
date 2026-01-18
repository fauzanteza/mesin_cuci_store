import { prisma } from '../config/database.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
    const cartItems = await prisma.cartItem.findMany({
        where: { userId: req.user.id },
        include: {
            product: {
                include: { images: true }
            },
            variant: true
        }
    });

    res.json({ success: true, data: cartItems });
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
    const { productId, quantity, variantId } = req.body;

    const qty = Number(quantity) || 1;

    // Check if item exists
    const existingItem = await prisma.cartItem.findUnique({
        where: {
            userId_productId_variantId: {
                userId: req.user.id,
                productId,
                variantId: variantId || null // Ensure null if undefined
            }
        }
    });

    if (existingItem) {
        // Update quantity
        const updatedItem = await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + qty },
            include: { product: { include: { images: true } } }
        });
        res.json({ success: true, data: updatedItem });
    } else {
        // Create new item
        // Use a cleaner approach to handle variantId being optional
        const data = {
            userId: req.user.id,
            productId,
            quantity: qty,
        };
        if (variantId) data.variantId = variantId;

        const newItem = await prisma.cartItem.create({
            data,
            include: { product: { include: { images: true } } }
        });
        res.status(201).json({ success: true, data: newItem });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:id
// @access  Private
export const updateCartItem = async (req, res) => {
    const { quantity } = req.body;
    const { id } = req.params;

    const item = await prisma.cartItem.findUnique({ where: { id } });

    if (!item) {
        res.status(404);
        throw new Error('Cart item not found');
    }

    if (item.userId !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const updatedItem = await prisma.cartItem.update({
        where: { id },
        data: { quantity: Number(quantity) },
        include: { product: { include: { images: true } } }
    });

    res.json({ success: true, data: updatedItem });
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:id
// @access  Private
export const removeFromCart = async (req, res) => {
    const { id } = req.params;

    const item = await prisma.cartItem.findUnique({ where: { id } });

    if (!item) {
        res.status(404);
        throw new Error('Cart item not found');
    }

    if (item.userId !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await prisma.cartItem.delete({ where: { id } });

    res.json({ success: true, message: 'Item removed' });
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
    await prisma.cartItem.deleteMany({
        where: { userId: req.user.id }
    });

    res.json({ success: true, message: 'Cart cleared' });
};
