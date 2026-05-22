import { Client, Databases, Storage, Permission, Role } from 'node-appwrite';

const client = new Client();
client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6a0468ec0039af6a225c')
    .setKey('standard_ecf9cf29db8e5d15b87f5f7af59b19bb823a36396474cb44cb1e7221b4ebd43680aceb73d738685e13c71747cc905932f445a1f8aa8e210590631bdcbb7796d841d127fcaaf98defcbe4776989f414f8f1f0e72c8630d5c3394be6e16b627adbb0b66f8ff0d61a67bec17c4c900e26473cfd03c3ab6cae8cf6add0ee09d1620d');

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
