import { Client, Storage } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('test');

const storage = new Storage(client);
const preview = storage.getFilePreview('test_bucket', 'test_file');
console.log(typeof preview);
console.log(preview);
console.log(preview.href);
