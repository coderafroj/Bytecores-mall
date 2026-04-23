import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const PRODUCTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID;
export const ORDERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID;
export const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

export { client };
