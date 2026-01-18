import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Product } from '../../types/product.types'

interface CartItem {
    id: string
    name: string
    price: number
    image: string
    quantity: number
}

interface CartState {
    items: CartItem[]
    totalQuantity: number
    totalAmount: number
}

const initialState: CartState = {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const newItem = action.payload
            const existingItem = state.items.find((item) => item.id === newItem.id)

            if (!existingItem) {
                state.items.push({
                    ...newItem,
                    quantity: 1
                })
            } else {
                existingItem.quantity++
            }

            state.totalQuantity++
            state.totalAmount = state.totalAmount + newItem.price
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            const id = action.payload
            const existingItem = state.items.find((item) => item.id === id)

            if (existingItem) {
                state.totalQuantity -= existingItem.quantity
                state.totalAmount -= existingItem.price * existingItem.quantity
                state.items = state.items.filter((item) => item.id !== id)
            }
        },
        decreaseQuantity: (state, action: PayloadAction<string>) => {
            const id = action.payload
            const existingItem = state.items.find((item) => item.id === id)
            if (existingItem) {
                if (existingItem.quantity === 1) {
                    state.items = state.items.filter((item) => item.id !== id)
                    state.totalQuantity--
                    state.totalAmount -= existingItem.price
                } else {
                    existingItem.quantity--
                    state.totalQuantity--
                    state.totalAmount -= existingItem.price
                }
            }
        },
        clearCart: (state) => {
            state.items = []
            state.totalQuantity = 0
            state.totalAmount = 0
        },
    },
})

export const { addToCart, removeFromCart, clearCart, decreaseQuantity } = cartSlice.actions
export default cartSlice.reducer
