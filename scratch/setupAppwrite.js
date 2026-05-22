import { Client, Databases } from 'node-appwrite';

const client = new Client();
client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6a0468ec0039af6a225c')
    .setKey('standard_ecf9cf29db8e5d15b87f5f7af59b19bb823a36396474cb44cb1e7221b4ebd43680aceb73d738685e13c71747cc905932f445a1f8aa8e210590631bdcbb7796d841d127fcaaf98defcbe4776989f414f8f1f0e72c8630d5c3394be6e16b627adbb0b66f8ff0d61a67bec17c4c900e26473cfd03c3ab6cae8cf6add0ee09d1620d');

const databases = new Databases(client);

const dbId = '6a046e6a0007776cc988';

async function setup() {
    try {
        console.log("Setting up Appwrite Database...");

        // 1. Create feedbacks collection if not exists
        try {
            await databases.getCollection(dbId, 'feedbacks');
            console.log("Collection 'feedbacks' already exists.");
        } catch (e) {
            if (e.code === 404) {
                console.log("Creating 'feedbacks' collection...");
                await databases.createCollection(dbId, 'feedbacks', 'Feedbacks');
                console.log("'feedbacks' collection created.");
                
                // Add attributes to feedbacks
                console.log("Adding attributes to 'feedbacks'...");
                await databases.createStringAttribute(dbId, 'feedbacks', 'firstName', 255, false);
                await databases.createStringAttribute(dbId, 'feedbacks', 'lastName', 255, false);
                await databases.createStringAttribute(dbId, 'feedbacks', 'email', 255, false);
                await databases.createStringAttribute(dbId, 'feedbacks', 'phone', 255, false);
                await databases.createStringAttribute(dbId, 'feedbacks', 'subject', 255, false);
                await databases.createStringAttribute(dbId, 'feedbacks', 'message', 10000, false);
                await databases.createStringAttribute(dbId, 'feedbacks', 'createdAt', 255, false);
                console.log("Attributes for 'feedbacks' added.");
            } else {
                throw e;
            }
        }

        // 2. Add attributes to products collection
        try {
            console.log("Fetching attributes for 'products'...");
            const attrs = await databases.listAttributes(dbId, 'products');
            const attrKeys = attrs.attributes.map(a => a.key);
            console.log("Current product attributes:", attrKeys);

            if (!attrKeys.includes('name')) await databases.createStringAttribute(dbId, 'products', 'name', 255, true);
            if (!attrKeys.includes('price')) await databases.createFloatAttribute(dbId, 'products', 'price', true);
            if (!attrKeys.includes('originalPrice')) await databases.createFloatAttribute(dbId, 'products', 'originalPrice', false);
            if (!attrKeys.includes('description')) await databases.createStringAttribute(dbId, 'products', 'description', 10000, true);
            if (!attrKeys.includes('imageUrl')) await databases.createStringAttribute(dbId, 'products', 'imageUrl', 2048, true);
            if (!attrKeys.includes('category')) await databases.createStringAttribute(dbId, 'products', 'category', 255, true);
            if (!attrKeys.includes('stock')) await databases.createIntegerAttribute(dbId, 'products', 'stock', true);
            if (!attrKeys.includes('rating')) await databases.createFloatAttribute(dbId, 'products', 'rating', false, 0, 5, 0);
            if (!attrKeys.includes('reviews')) await databases.createIntegerAttribute(dbId, 'products', 'reviews', false, 0, 1000000, 0);

            console.log("Attributes for 'products' created successfully.");
        } catch (e) {
            console.error("Failed to add attributes to products:", e.message);
        }

    } catch (e) {
        console.error("Setup error:", e);
    }
}

setup();
