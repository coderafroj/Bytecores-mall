import { Client, Databases } from 'node-appwrite';

const client = new Client();
client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6a0468ec0039af6a225c')
    .setKey('standard_ecf9cf29db8e5d15b87f5f7af59b19bb823a36396474cb44cb1e7221b4ebd43680aceb73d738685e13c71747cc905932f445a1f8aa8e210590631bdcbb7796d841d127fcaaf98defcbe4776989f414f8f1f0e72c8630d5c3394be6e16b627adbb0b66f8ff0d61a67bec17c4c900e26473cfd03c3ab6cae8cf6add0ee09d1620d');

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
