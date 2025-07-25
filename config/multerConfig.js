// glimmergrid-mvp/config/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Node.js file system module

// Define storage for user avatars
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads/avatars');
        // Create the directory if it doesn't exist
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
        // Create the directory if it doesn't exist
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
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        req.fileValidationError = 'Only image files (jpg, jpeg, png, gif, webp) are allowed!';
        return cb(new Error(req.fileValidationError), false);
    }
    cb(null, true);
};

// Configure Multer instances for different purposes
const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit
}).single('avatar'); // 'avatar' is the name of the input field in the form

const uploadGlimmerImage = multer({
    storage: glimmerStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB file size limit for glimmers
}).single('image'); // 'image' is the name of the input field in the form

// Export a function that can choose which upload middleware to use
module.exports = (req, res, next) => {
    // Determine if it's an avatar or glimmer image upload based on route or form field name
    // This is a simplified approach; in a real app, you might have separate upload functions
    // or more sophisticated routing logic.
    if (req.originalUrl.includes('/register') || req.originalUrl.includes('/profile/edit')) {
        uploadAvatar(req, res, next);
    } else if (req.originalUrl.includes('/glimmers') && req.method === 'POST') {
        uploadGlimmerImage(req, res, next);
    } else {
        // If no specific file upload, just continue
        next();
    }
};
