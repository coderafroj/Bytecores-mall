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
            const { product, quantity = 1, selectedSize, selectedColor } = action.payload;
            const cartId = `${product.$id}-${selectedSize || 'none'}-${selectedColor || 'none'}`;
            
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

            const existing = state.items.find(item => item.cartId === cartId);
            
            if (existing) {
                existing.quantity += quantity;
            } else {
                state.items.push({ ...product, quantity, cartId, selectedSize, selectedColor });
            }
            localStorage.setItem('bytecore-mall-cart', JSON.stringify(state.items));
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item.cartId !== action.payload);
            localStorage.setItem('bytecore-mall-cart', JSON.stringify(state.items));
        },
        updateQuantity: (state, action) => {
            const { cartId, quantity } = action.payload;
            const item = state.items.find(i => i.cartId === cartId);
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
