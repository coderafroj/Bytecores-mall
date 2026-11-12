import { Client, Databases, Storage, Permission, Role } from 'node-appwrite';

const client = new Client();
client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6a0468ec0039af6a225c')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);
const dbId = '6a046e6a0007776cc988';
const bucketId = '6a046e3e003b9c37304c';

async function fixPerms() {
    try {
        console.log("Updating permissions...");
        const permissions = [
            Permission.read(Role.any()),
            Permission.create(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any()),
        ];
        
        await databases.updateCollection(dbId, 'feedbacks', 'Feedbacks', permissions);
        console.log("Feedbacks permissions updated.");

        await databases.updateCollection(dbId, 'products', 'Products', permissions);
        console.log("Products permissions updated.");

        await databases.updateCollection(dbId, 'orders', 'Orders', permissions);
        console.log("Orders permissions updated.");

        await storage.updateBucket(bucketId, 'BytecoreBucket', permissions);
        console.log("Bucket permissions updated.");
        
    } catch(e) {
        console.error("Error:", e.message);
    }
}
fixPerms();
