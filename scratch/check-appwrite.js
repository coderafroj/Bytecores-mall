import { Client, Databases } from 'node-appwrite';

const client = new Client();
client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6a0468ec0039af6a225c')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function check() {
    try {
        const dbId = '6a046e6a0007776cc988';
        const productsColId = 'products';
        
        console.log("Fetching attributes for products...");
        const attrs = await databases.listAttributes(dbId, productsColId);
        console.log("Attributes:", attrs.attributes.map(a => a.key));
        
    } catch (e) {
        console.error("Error:", e);
    }
}
check();
