import localforage from 'localforage';
import databaseService from '../appwrite/db';

// Configure localforage stores
const productsStore = localforage.createInstance({ name: 'BytecorePOS', storeName: 'products' });
const ordersStore = localforage.createInstance({ name: 'BytecorePOS', storeName: 'offline_orders' });

class OfflineSyncService {
    
    // --- Products Caching ---
    async cacheProducts(products) {
        try {
            await productsStore.setItem('all_products', products);
        } catch (error) {
            console.error('OfflineSync: Failed to cache products', error);
        }
    }

    async getCachedProducts() {
        try {
            return await productsStore.getItem('all_products') || [];
        } catch (error) {
            console.error('OfflineSync: Failed to get cached products', error);
            return [];
        }
    }

    // --- Offline Orders ---
    async saveOfflineOrder(orderData) {
        try {
            const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const order = { ...orderData, $id: offlineId, isOffline: true, $createdAt: new Date().toISOString() };
            
            const existingOrders = await ordersStore.getItem('pending_orders') || [];
            existingOrders.push(order);
            await ordersStore.setItem('pending_orders', existingOrders);
            
            // Adjust local product stock immediately so POS continues working
            this._adjustLocalStock(order);

            return order;
        } catch (error) {
            console.error('OfflineSync: Failed to save offline order', error);
            throw error;
        }
    }

    async getOfflineOrders() {
        try {
            return await ordersStore.getItem('pending_orders') || [];
        } catch (error) {
            return [];
        }
    }

    async _adjustLocalStock(order) {
        try {
            const products = await this.getCachedProducts();
            if (!products.length) return;
            
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            const updatedProducts = products.map(p => {
                const purchasedItem = items.find(i => i.id === p.$id);
                if (purchasedItem && !purchasedItem.isCustom) {
                    return { ...p, stock: Math.max(0, p.stock - purchasedItem.quantity) };
                }
                return p;
            });
            await this.cacheProducts(updatedProducts);
        } catch (error) {
            console.error('OfflineSync: Stock adjustment failed', error);
        }
    }

    // --- Synchronization ---
    async syncOfflineOrders() {
        if (!navigator.onLine) return { success: false, message: 'Still offline' };

        try {
            const pendingOrders = await this.getOfflineOrders();
            if (pendingOrders.length === 0) return { success: true, count: 0 };

            let syncedCount = 0;
            const failedOrders = [];

            for (const order of pendingOrders) {
                try {
                    // Remove offline specific flags before sending to Appwrite
                    const { $id, isOffline, $createdAt, ...cleanOrder } = order;
                    
                    // Create in Appwrite
                    await databaseService.createOrder(cleanOrder);
                    
                    // Note: Ideally, we should also batch update product stocks in Appwrite here, 
                    // but the POSSystem handles stock deduction. For offline orders, Appwrite 
                    // stock might be out of sync until a manual reconcile if we don't update it.
                    // For now, we will assume POSSystem logic or cloud function handles it.

                    syncedCount++;
                } catch (err) {
                    console.error('OfflineSync: Failed to sync order', order.$id, err);
                    failedOrders.push(order); // Keep failed ones
                }
            }

            // Update store with only failed orders
            await ordersStore.setItem('pending_orders', failedOrders);
            
            return { success: true, count: syncedCount, failed: failedOrders.length };
        } catch (error) {
            console.error('OfflineSync: Sync process failed', error);
            return { success: false, error };
        }
    }
}

const offlineSync = new OfflineSyncService();

// Auto-sync listener when coming online
window.addEventListener('online', () => {
    console.log('App is online. Attempting to sync offline orders...');
    offlineSync.syncOfflineOrders().then(res => {
        if (res.success && res.count > 0) {
            console.log(`Successfully synced ${res.count} offline orders.`);
            // Dispatch custom event to notify UI
            window.dispatchEvent(new CustomEvent('offline-sync-complete', { detail: res }));
        }
    });
});

export default offlineSync;
