// cerver/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage — file disk এ save হবে না, সরাসরি Cloudinary তে যাবে
const storage = multer.memoryStorage();

// ✅ সাধারণ upload (profile pictures, ইত্যাদির জন্য)
const upload = multer({ storage });

// ✅ প্রোডাক্ট ইমেজ আপলোডের জন্য আলাদা কনফিগ (একই, কিন্তু আলাদা নামে)
const uploadProduct = multer({ storage });

// Cloudinary তে ইমেজ আপলোড করার হেল্পার ফাংশন
const uploadToCloudinary = async (fileBuffer, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    // বাফার থেকে স্ট্রিমে পাঠান
    const Readable = require('stream').Readable;
    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// ✅ সব export একসাথে
export { 
  upload, 
  uploadProduct,
  uploadToCloudinary
};

export default cloudinary;