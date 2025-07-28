// glimmergrid-mvp/routes/authRoutes.js
const express = require('express');
// We will pass authController as an argument to the module.exports function
// const authController = require('../controllers/authController'); // REMOVED direct import
const { forwardAuthenticated, ensureAuthenticated, isLoggedIn } = require('../middleware/authMiddleware'); // Corrected middleware import
const { uploadAvatar } = require('../config/multerConfig'); // Import specific multer uploader
const catchAsync = require('../utils/catchAsync'); // Assuming you have this utility

// Export a function that accepts authController as an argument
module.exports = (authController) => { // This router now exports a function
    const router = express.Router();

    // --- Authentication Routes ---
    router.get('/login', forwardAuthenticated, authController.renderLoginPage);
    // CRITICAL FIX: Remove catchAsync from loginUser, as passport.authenticate handles its own responses
    router.post('/login', authController.loginUser); 
    router.get('/register', forwardAuthenticated, authController.renderRegisterPage);
    router.post('/register', uploadAvatar, catchAsync(authController.registerUser)); 
    router.get('/logout', isLoggedIn, authController.logoutUser);

    // --- Aura (Profile) Routes ---
    router.get('/aura', isLoggedIn, catchAsync(authController.renderAuraPage));
    router.get('/profile/edit', isLoggedIn, catchAsync(authController.renderEditProfilePage));
    router.post('/profile/edit', uploadAvatar, catchAsync(authController.updateProfile)); 
    router.get('/profile/change-password', isLoggedIn, catchAsync(authController.renderChangePasswordPage));
    router.post('/profile/change-password', isLoggedIn, catchAsync(authController.changePassword));

    return router; // Return the configured router
};
