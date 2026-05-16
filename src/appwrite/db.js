import { Client, Databases, ID, Query } from "appwrite";

export class DatabaseService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
            .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
        this.databases = new Databases(this.client);
    }

    // Products
    async createProduct({ name, price, originalPrice, description, imageUrl, category, stock, rating, reviews }) {
        try {
            return await this.databases.createDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID || 'products',
                ID.unique(),
                { name, price, originalPrice, description, imageUrl, category, stock, rating, reviews }
            );
        } catch (error) {
            console.log("Appwrite service :: createProduct :: error", error);
            throw error;
        }
    }

    async updateProduct(id, { name, price, originalPrice, description, imageUrl, category, stock, rating, reviews }) {
        try {
            return await this.databases.updateDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID || 'products',
                id,
                { name, price, originalPrice, description, imageUrl, category, stock, rating, reviews }
            );
        } catch (error) {
            console.log("Appwrite service :: updateProduct :: error", error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            await this.databases.deleteDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID || 'products',
                id
            );
            return true;
        } catch (error) {
            console.log("Appwrite service :: deleteProduct :: error", error);
            return false;
        }
    }

    async getProduct(id) {
        try {
            return await this.databases.getDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID || 'products',
                id
            );
        } catch (error) {
            console.log("Appwrite service :: getProduct :: error", error);
            return false;
        }
    }

    async getProducts(queries = [Query.limit(100)]) {
        try {
            const collectionId = import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID || 'products';
            return await this.databases.listDocuments(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                collectionId,
                queries
            );
        } catch (error) {
            if (error.code === 404) {
                console.error("CRITICAL: Products collection not found. Please ensure VITE_APPWRITE_PRODUCTS_COLLECTION_ID is set correctly in .env");
            } else {
                console.log("Appwrite service :: getProducts :: error", error);
            }
            return { documents: [], total: 0 };
        }
    }

    // Orders
    async createOrder(orderData) {
        try {
            return await this.databases.createDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID || 'orders',
                ID.unique(),
                {
                    ...orderData,
                    createdAt: new Date().toISOString(),
                    paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : (orderData.paymentStatus || 'pending')
                }
            );
        } catch (error) {
            console.log("Appwrite service :: createOrder :: error", error);
            throw error;
        }
    }

    async getOrders(queries = []) {
        try {
            const collectionId = import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID || 'orders';
            return await this.databases.listDocuments(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                collectionId,
                queries
            );
        } catch (error) {
            if (error.code === 404) {
                console.error("CRITICAL: Orders collection not found. Please ensure VITE_APPWRITE_ORDERS_COLLECTION_ID is set correctly in .env");
            } else {
                console.log("Appwrite service :: getOrders :: error", error);
            }
            return { documents: [], total: 0 };
        }
    }

    async updateOrderStatus(orderId, status, paymentStatus = null) {
        try {
            const data = { status };
            if (paymentStatus) data.paymentStatus = paymentStatus;
            return await this.databases.updateDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID || 'orders',
                orderId,
                data
            );
        } catch (error) {
            console.log("Appwrite service :: updateOrderStatus :: error", error);
            throw error;
        }
    }
}

const databaseService = new DatabaseService();
export default databaseService;
