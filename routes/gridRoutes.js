// glimmergrid-mvp/routes/gridRoutes.js
const express = require('express');
const router = express.Router();
const gridController = require('../controllers/gridController');
const { ensureAuthenticated } = require('../middleware/authMiddleware'); // Needed for protected routes

// @route   GET /grid/search
// @desc    Render the Search Glimmer page
// @access  Public
router.get('/search', gridController.renderSearchGlimmerPage);

// @route   GET /grid/launch
// @desc    Render the Host Glimmer (Launch) page
// @access  Private (only logged-in users can host)
router.get('/launch', ensureAuthenticated, gridController.renderLaunchGlimmerPage);

// Add POST route for creating glimmer here later: router.post('/launch', ensureAuthenticated, ...)

module.exports = router;
