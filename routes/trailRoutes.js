// glimmergrid-mvp/routes/trailRoutes.js
const express = require('express');
const router = express.Router();
const trailController = require('../controllers/trailController');
const { ensureAuthenticated } = require('../middleware/authMiddleware'); // Needed for protected routes

// @route   GET /trail/sparks
// @desc    Render the Hosted Glimmers (Sparks) page
// @access  Private
router.get('/sparks', ensureAuthenticated, trailController.renderSparksPage);

// @route   GET /trail/footprints
// @desc    Render the Joined Glimmers (Footprints) page
// @access  Private
router.get('/footprints', ensureAuthenticated, trailController.renderFootprintsPage);

module.exports = router;
