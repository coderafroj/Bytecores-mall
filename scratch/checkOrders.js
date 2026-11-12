import { Client, Databases } from 'node-appwrite';

const client = new Client();
client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6a0468ec0039af6a225c')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const dbId = '6a046e6a0007776cc988';

async function checkOrders() {
    try {
        console.log("Fetching attributes for 'orders'...");
        const attrs = await databases.listAttributes(dbId, 'orders');
        console.log("Orders attributes:", attrs.attributes.map(a => a.key));
        if (attrs.attributes.length === 0) {
            console.log("Adding attributes to 'orders'...");
            await databases.createStringAttribute(dbId, 'orders', 'userId', 255, true);
            await databases.createStringAttribute(dbId, 'orders', 'userName', 255, true);
            await databases.createStringAttribute(dbId, 'orders', 'userEmail', 255, true);
            await databases.createStringAttribute(dbId, 'orders', 'items', 100000, true);
            await databases.createFloatAttribute(dbId, 'orders', 'total', true);
            await databases.createStringAttribute(dbId, 'orders', 'shippingAddress', 10000, true);
            await databases.createStringAttribute(dbId, 'orders', 'paymentMethod', 255, true);
            await databases.createStringAttribute(dbId, 'orders', 'paymentStatus', 255, false);
            await databases.createStringAttribute(dbId, 'orders', 'status', 255, true);
            await databases.createStringAttribute(dbId, 'orders', 'createdAt', 255, false);
            console.log("Orders attributes added.");
        }
    } catch(e) {
        if (e.code === 404) {
            console.log("Orders collection not found. Creating...");
            await databases.createCollection(dbId, 'orders', 'Orders');
            console.log("Adding attributes to 'orders'...");
            await databases.createStringAttribute(dbId, 'orders', 'userId', 255, true);
            await databases.createStringAttribute(dbId, 'orders', 'userName', 255, true);
            await databases.createStringAttribute(dbId, 'orders', 'userEmail', 255, true);
            await databases.createStringAttribute(dbId, 'orders', 'items', 100000, true);
            await databases.createFloatAttribute(dbId, 'orders', 'total', true);
            await databases.createStringAttribute(dbId, 'orders', 'shippingAddress', 10000, true);
            await databases.createStringAttribute(dbId, 'orders', 'paymentMethod', 255, true);
            await databases.createStringAttribute(dbId, 'orders', 'paymentStatus', 255, false);
            await databases.createStringAttribute(dbId, 'orders', 'status', 255, true);
            await databases.createStringAttribute(dbId, 'orders', 'createdAt', 255, false);
            console.log("Orders attributes added.");
        } else {
            console.error("Error:", e.message);
        }
    }
}
checkOrders();
