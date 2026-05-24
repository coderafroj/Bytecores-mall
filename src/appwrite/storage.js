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
            // Options for extreme compression but pro-level quality on website
            const options = {
                maxSizeMB: 0.3, // Max 300KB to save database size but keep quality high
                maxWidthOrHeight: 1600, // Full HD resolution for pro-level display
                useWebWorker: true,
                initialQuality: 0.85, // Retain high visual quality
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
            fileId,
            0, // width (original)
            0, // height (original)
            'center', // gravity
            100, // quality for pro-level
            0, // borderWidth
            '', // borderColor
            0, // borderRadius
            1, // opacity
            0, // rotation
            '', // background
            'webp' // modern format
        );
    }
}

const storageService = new StorageService();
export default storageService;
