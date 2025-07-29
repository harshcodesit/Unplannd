// glimmergrid-mvp/routes/trailRoutes.js
const express = require('express');
const router = express.Router();
// The trailController is now passed as an argument to the module.exports function
// const trailController = require('../controllers/trailController'); // REMOVED direct import here
const { ensureAuthenticated } = require('../middleware/authMiddleware'); // Corrected middleware import
const catchAsync = require('../utils/catchAsync'); // Utility for async error handling

// Export a function that accepts trailController as an argument
module.exports = (trailController) => { // This router now exports a function
    const router = express.Router();

    // @route   GET /trail/sparks
    // @desc    Render the Hosted Glimmers (Sparks) page
    // @access  Private
    router.get('/sparks', ensureAuthenticated, catchAsync(trailController.renderSparksPage));

    // @route   GET /trail/footprints
    // @desc    Render the Joined Glimmers (Footprints) page
    // @access  Private
    router.get('/footprints', ensureAuthenticated, catchAsync(trailController.renderFootprintsPage));

    return router; // Return the configured router
};