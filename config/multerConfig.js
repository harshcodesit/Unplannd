// glimmergrid-mvp/config/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Node.js file system module

// Define storage for user avatars
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads/avatars');
        // Ensure directory exists; recursive: true creates parent directories if they don't exist
        fs.mkdirSync(uploadPath, { recursive: true }); 
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename: fieldname-timestamp.ext
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Define storage for glimmer images
const glimmerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads/glimmers');
        // Ensure directory exists; recursive: true creates parent directories if they don't exist
        fs.mkdirSync(uploadPath, { recursive: true }); 
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename: fieldname-timestamp.ext
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// File filter function for images
const imageFilter = (req, file, cb) => {
    // Accept images only (jpg, jpeg, png, gif, webp)
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        // Attach a custom error message to req for controller to pick up
        // This allows controllers to handle Multer errors gracefully
        req.fileValidationError = 'Only image files (jpg, jpeg, png, gif, webp) are allowed!';
        return cb(new Error(req.fileValidationError), false);
    }
    cb(null, true);
};

// Export specific multer instances directly as middleware functions.
// These will be used directly in your Express routes.
module.exports.uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit for avatars
}).single('avatar'); // Expects a single file input named 'avatar' from the form

module.exports.uploadGlimmerImages = multer({
    storage: glimmerStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit per single glimmer image
}).array('image', 5); // Expects an array of files named 'image' (singular field name), allows max 5 files.
