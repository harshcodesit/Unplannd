// glimmergrid-mvp/config/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Node.js file system module

// Define storage for user avatars
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads/avatars');
        fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename: fieldname-timestamp.ext
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Define storage for glimmer images (even if not fully used yet, consistent with schema)
const glimmerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads/glimmers');
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
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        req.fileValidationError = 'Only image files (jpg, jpeg, png, gif, webp) are allowed!';
        return cb(new Error(req.fileValidationError), false);
    }
    cb(null, true);
};

// Export specific multer instances directly
module.exports.uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit for avatars
}).single('avatar');

module.exports.uploadGlimmerImages = multer({ // This will be used in Glimmer Phase 1
    storage: glimmerStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit per single glimmer image
}).array('image', 5); // Expects input named 'image' (singular for the field), allows max 5 files.
