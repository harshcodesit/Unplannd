// routes/auraRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // User profile logic is in authController
const { isAuthenticated, isCurrentUser } = require('../middleware/authMiddleware'); // Middleware for auth and authorization
const upload = require('../config/multerConfig'); // Multer for avatar upload

// User Profile Routes (view and update)
// Mounted under '/profile' in app.js, so these paths are relative to '/profile'
router.route('/:id')
    // GET /profile/:id - Show a user's profile
    // Requires user to be authenticated and to be the current user (for privacy/security)
    .get(isAuthenticated, isCurrentUser, authController.renderUserProfile) 
    // PUT /profile/:id - Update a user's profile
    // Requires authentication, current user authorization, and handles single 'avatar' file upload
    .put(isAuthenticated, isCurrentUser, upload.single('avatar'), authController.updateUserProfile);

// Route to render the edit profile form
// GET /profile/:id/edit
router.get('/:id/edit', isAuthenticated, isCurrentUser, authController.renderEditProfileForm);

module.exports = router;
