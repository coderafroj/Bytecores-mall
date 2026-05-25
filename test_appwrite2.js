import { Client, Storage } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('test');

const storage = new Storage(client);
const preview = storage.getFilePreview(
    'test_bucket',
    'test_file',
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
console.log(preview);
console.log("Length:", preview.length);
