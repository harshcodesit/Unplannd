// glimmergrid-mvp/routes/authRoutes.js
const express = require('express');
// The router itself will be created inside the exported function
// No direct authController import here
const { forwardAuthenticated, ensureAuthenticated, isLoggedIn } = require('../middleware/authMiddleware'); // Corrected middleware import
const { uploadAvatar } = require('../config/multerConfig'); // Specific multer uploader for avatars
const catchAsync = require('../utils/catchAsync'); // Utility for async error handling

// Export a function that accepts authController as an argument
module.exports = (authController) => { // This router now exports a function
    const router = express.Router();

    // --- Authentication Routes ---
    router.get('/login', forwardAuthenticated, authController.renderLoginPage);
    router.post('/login', authController.loginUser); // No catchAsync needed here, Passport handles response
    router.get('/register', forwardAuthenticated, authController.renderRegisterPage);
    router.post('/register', uploadAvatar, catchAsync(authController.registerUser)); 
    router.get('/logout', isLoggedIn, authController.logoutUser); // No catchAsync needed here, Passport handles response

    // --- Aura (Profile) Routes ---
    router.get('/aura', isLoggedIn, catchAsync(authController.renderAuraPage));
    router.get('/profile/edit', isLoggedIn, catchAsync(authController.renderEditProfilePage));
    router.post('/profile/edit', uploadAvatar, catchAsync(authController.updateProfile)); 
    router.get('/profile/change-password', isLoggedIn, authController.renderChangePasswordPage); // renderChangePasswordPage is synchronous
    router.post('/profile/change-password', isLoggedIn, catchAsync(authController.changePassword));

    return router; // Return the configured router
};
