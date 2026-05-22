import { Client, Storage, ID } from "appwrite";
import imageCompression from 'browser-image-compression';

export class StorageService {
    client = new Client();
    storage;

    constructor() {
        this.client
            .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
            .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
        this.storage = new Storage(this.client);
    }

    async uploadFile(file) {
        try {
            // Options for compression
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };

            // Compress the image
            const compressedFile = await imageCompression(file, options);
            console.log(`Original size: ${file.size / 1024 / 1024} MB`);
            console.log(`Compressed size: ${compressedFile.size / 1024 / 1024} MB`);
            
            // Appwrite requires a File object, but browser-image-compression might return a Blob or lack a name
            const finalFile = new File([compressedFile], file.name || 'image.jpg', {
                type: compressedFile.type || 'image/jpeg',
            });

            return await this.storage.createFile(
                import.meta.env.VITE_APPWRITE_BUCKET_ID,
                ID.unique(),
                finalFile
            );
        } catch (error) {
            console.log("Appwrite service :: uploadFile :: error", error);
            return false;
        }
    }

    async deleteFile(fileId) {
        try {
            await this.storage.deleteFile(
                import.meta.env.VITE_APPWRITE_BUCKET_ID,
                fileId
            );
            return true;
        } catch (error) {
            console.log("Appwrite service :: deleteFile :: error", error);
            return false;
        }
    }

    getFilePreview(fileId) {
        return this.storage.getFilePreview(
            import.meta.env.VITE_APPWRITE_BUCKET_ID,
            fileId
        );
    }
}

const storageService = new StorageService();
export default storageService;
