// glimmergrid-mvp/routes/glimmerRoutes.js
const express = require('express');
const router = express.Router();
const glimmerController = require('../controllers/glimmerController');
const { ensureAuthenticated } = require('../middleware/authMiddleware'); // Needed for protected routes

// @route   GET /glimmers
// @desc    Display a list of all glimmers
// @access  Public
router.get('/', glimmerController.index);

// @route   POST /glimmers
// @desc    Handle creation of a new glimmer
// @access  Private (only logged-in users can create glimmers)
router.post('/', ensureAuthenticated, glimmerController.createGlimmer); // New POST route

// @route   GET /glimmers/:id
// @desc    Display details for a single glimmer
// @access  Public
router.get('/:id', glimmerController.show);

module.exports = router;
