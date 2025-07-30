// glimmergrid-mvp/config/multerConfig.js
const multer = require('multer');
const cloudinary = require('cloudinary').v2; // Import Cloudinary v2
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Import CloudinaryStorage
const path = require('path'); // Node.js core module (still useful for local paths or diagnostics)
const fs = require('fs'); // Node.js file system module (might not be needed after full migration)

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Define Cloudinary storage for user avatars
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'unplannd/avatars', // Folder name in Cloudinary
        allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'webp'],
        transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }] // Auto-crop/resize avatars
    }
});

// Define Cloudinary storage for glimmer images
const glimmerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'unplannd/glimmers', // Folder name in Cloudinary
        allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'webp'],
        // Optional: you can add transformations here for different sizes if needed
        // For example, to create a smaller version for listings:
        // transformation: [{ width: 500, height: 300, crop: 'limit' }]
    }
});


// File filter function for images (remains the same)
const imageFilter = (req, file, cb) => {
    // Accept images only (jpg, jpeg, png, gif, webp)
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        req.fileValidationError = 'Only image files (jpg, jpeg, png, gif, webp) are allowed!';
        return cb(new Error(req.fileValidationError), false);
    }
    cb(null, true);
};

// Export specific multer instances directly as middleware functions.
// These now use CloudinaryStorage.
module.exports.uploadAvatar = multer({
    storage: avatarStorage, // Use Cloudinary storage for avatars
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit for avatars
}).single('avatar'); // Expects a single file input named 'avatar' from the form

module.exports.uploadGlimmerImages = multer({
    storage: glimmerStorage, // Use Cloudinary storage for glimmers
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit per single glimmer image
}).array('image', 5); // Expects an array of files named 'image' (singular field name), allows max 5 files.
