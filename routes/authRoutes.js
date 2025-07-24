// glimmergrid-mvp/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { forwardAuthenticated, ensureAuthenticated } = require('../middleware/authMiddleware');

// --- Authentication Routes ---

// @route   GET /login
// @desc    Render login page
// @access  Public (forwardAuthenticated prevents logged-in users from seeing it)
router.get('/login', forwardAuthenticated, authController.renderLoginPage);

// @route   POST /login
// @desc    Handle login submission
// @access  Public
router.post('/login', authController.loginUser);

// @route   GET /register
// @desc    Render registration page
// @access  Public (forwardAuthenticated prevents logged-in users from seeing it)
router.get('/register', forwardAuthenticated, authController.renderRegisterPage);

// @route   POST /register
// @desc    Handle registration submission
// @access  Public
router.post('/register', authController.registerUser);

// @route   GET /logout
// @desc    Log out user
// @access  Private (user must be logged in to logout)
router.get('/logout', ensureAuthenticated, authController.logoutUser);

// --- Profile Routes (User Management) ---

// @route   GET /profile
// @desc    Render user's profile view
// @access  Private
router.get('/profile', ensureAuthenticated, authController.renderProfilePage); // Assuming views/profile/view.ejs

// @route   GET /profile/edit
// @desc    Render edit profile form
// @access  Private
router.get('/profile/edit', ensureAuthenticated, authController.renderEditProfilePage);

// @route   POST /profile/edit
// @desc    Handle updating user profile
// @access  Private
router.post('/profile/edit', ensureAuthenticated, authController.updateProfile);

// @route   GET /profile/change-password
// @desc    Render change password form
// @access  Private
router.get('/profile/change-password', ensureAuthenticated, authController.renderChangePasswordPage);

// @route   POST /profile/change-password
// @desc    Handle password change submission
// @access  Private
router.post('/profile/change-password', ensureAuthenticated, authController.changePassword);


module.exports = router;