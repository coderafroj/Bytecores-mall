import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.VITE_APPWRITE_API_KEY);

const databases = new Databases(client);

async function updateSchema() {
    try {
        console.log("Attempting to add 'sizes' attribute...");
        await databases.createStringAttribute(
            process.env.VITE_APPWRITE_DATABASE_ID,
            process.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID || 'products',
            'sizes',
            1000,
            false,
            undefined,
            true // array
        );
        console.log("Added 'sizes' array attribute.");
    } catch(e) {
        console.error("Sizes attribute error:", e.message);
    }
    
    try {
        console.log("Attempting to add 'colors' attribute...");
        await databases.createStringAttribute(
            process.env.VITE_APPWRITE_DATABASE_ID,
            process.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID || 'products',
            'colors',
            1000,
            false,
            undefined,
            true // array
        );
        console.log("Added 'colors' array attribute.");
    } catch(e) {
        console.error("Colors attribute error:", e.message);
    }
}

updateSchema();
