// glimmergrid-mvp/routes/gridRoutes.js
const express = require('express');
const router = express.Router();
// The gridController is now passed as an argument to the module.exports function
// const gridController = require('../controllers/gridController'); // REMOVED direct import here
const { ensureAuthenticated } = require('../middleware/authMiddleware'); // Corrected middleware import
const catchAsync = require('../utils/catchAsync'); // Utility for async error handling

// Export a function that accepts gridController as an argument
module.exports = (gridController) => { // This router now exports a function
    const router = express.Router();

    // @route   GET /grid/search
    // @desc    Display a list of all glimmers (acting as the search page for now)
    // @access  Public
    // FIX: renderSearchGlimmerPage is SYNCHRONOUS, so remove catchAsync
    router.get('/search', gridController.renderSearchGlimmerPage);

    // @route   GET /grid/launch
    // @desc    Render the form to launch a new glimmer
    // @access  Private
    // FIX: renderLaunchGlimmerPage is SYNCHRONOUS, so remove catchAsync
    router.get('/launch', ensureAuthenticated, gridController.renderLaunchGlimmerPage);

    return router; // Return the configured router
};