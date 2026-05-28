import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import cartSlice from './cartSlice';
import wishlistReducer from './wishlistSlice';

const store = configureStore({
    reducer: {
        auth: authSlice,
        cart: cartSlice,
        wishlist: wishlistReducer,
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
