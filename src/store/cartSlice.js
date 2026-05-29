import { createSlice } from "@reduxjs/toolkit";
import ReactGALib from 'react-ga4';
import ReactPixelLib from 'react-facebook-pixel';

const ReactGA = ReactGALib.default || ReactGALib;
const ReactPixel = ReactPixelLib.default || ReactPixelLib;

const initialState = {
    items: JSON.parse(localStorage.getItem('bytecore-mall-cart')) || [],
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const { product, quantity = 1 } = action.payload;
            
            try {
                ReactGA.event("add_to_cart", {
                    currency: "INR",
                    value: product.price * quantity,
                    items: [{ item_id: product.$id, item_name: product.name, price: product.price, quantity }]
                });
                ReactPixel.track('AddToCart', {
                    content_name: product.name,
                    content_ids: [product.$id],
                    content_type: 'product',
                    value: product.price * quantity,
                    currency: 'INR'
                });
            } catch (e) {}

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
