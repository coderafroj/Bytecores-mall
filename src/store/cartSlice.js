import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: JSON.parse(localStorage.getItem('bytecore-mall-cart')) || [],
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const { product, quantity = 1 } = action.payload;
            const existing = state.items.find(item => item.$id === product.$id);
            
            if (existing) {
                existing.quantity += quantity;
            } else {
                state.items.push({ ...product, quantity });
            }
            localStorage.setItem('bytecore-mall-cart', JSON.stringify(state.items));
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item.$id !== action.payload);
            localStorage.setItem('bytecore-mall-cart', JSON.stringify(state.items));
        },
        updateQuantity: (state, action) => {
            const { productId, quantity } = action.payload;
            const item = state.items.find(i => i.$id === productId);
            if (item) {
                item.quantity = quantity;
            }
            localStorage.setItem('bytecore-mall-cart', JSON.stringify(state.items));
        },
        clearCart: (state) => {
            state.items = [];
            localStorage.removeItem('bytecore-mall-cart');
        }
    }
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
