// glimmergrid-mvp/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { forwardAuthenticated, ensureAuthenticated } = require('../middleware/authMiddleware');

// --- Authentication Routes ---
router.get('/login', forwardAuthenticated, authController.renderLoginPage);
router.post('/login', authController.loginUser);
router.get('/register', forwardAuthenticated, authController.renderRegisterPage);
router.post('/register', authController.registerUser);
router.get('/logout', ensureAuthenticated, authController.logoutUser);

// --- Aura (Profile) Routes ---
// @route   GET /aura
// @desc    Render user's profile view (Aura)
// @access  Private
router.get('/aura', ensureAuthenticated, authController.renderAuraPage); // Updated path and controller function

// @route   GET /profile/edit (keeping this path for now, can be changed to /aura/edit if desired)
// @desc    Render edit profile form
// @access  Private
router.get('/profile/edit', ensureAuthenticated, authController.renderEditProfilePage);

// @route   POST /profile/edit
// @desc    Handle updating user profile
// @access  Private
router.post('/profile/edit', ensureAuthenticated, authController.updateProfile);

// @route   GET /profile/change-password (keeping this path for now)
// @desc    Render change password form
// @access  Private
router.get('/profile/change-password', ensureAuthenticated, authController.renderChangePasswordPage);

// @route   POST /profile/change-password
// @desc    Handle password change submission
// @access  Private
router.post('/profile/change-password', ensureAuthenticated, authController.changePassword);

module.exports = router;
