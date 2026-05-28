import { createSlice } from '@reduxjs/toolkit';

const loadState = (key) => {
    try {
        const serializedState = localStorage.getItem(key);
        if (serializedState === null) {
            return [];
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return [];
    }
};

const saveState = (key, state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(key, serializedState);
    } catch (err) {
        // Ignore write errors
    }
};

const initialState = {
    items: loadState('bytecore_wishlist'),
    recentlyViewed: loadState('bytecore_recently_viewed')
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        toggleWishlist: (state, action) => {
            const product = action.payload;
            const existingIndex = state.items.findIndex(item => item.$id === product.$id);
            
            if (existingIndex >= 0) {
                state.items.splice(existingIndex, 1);
            } else {
                state.items.push(product);
            }
            saveState('bytecore_wishlist', state.items);
        },
        addRecentlyViewed: (state, action) => {
            const product = action.payload;
            // Remove if already exists so we can move it to the front
            const filtered = state.recentlyViewed.filter(item => item.$id !== product.$id);
            // Add to front, keep only last 10
            state.recentlyViewed = [product, ...filtered].slice(0, 10);
            saveState('bytecore_recently_viewed', state.recentlyViewed);
        }
    }
});

export const { toggleWishlist, addRecentlyViewed } = wishlistSlice.actions;
export default wishlistSlice.reducer;
