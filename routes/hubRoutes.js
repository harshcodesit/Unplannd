// glimmergrid-mvp/routes/hubRoutes.js
const express = require('express');
// The router itself will be created inside the exported function
// No direct hubController import here

// Export a function that accepts hubController as an argument
module.exports = (hubController) => {
    const router = express.Router();

    // @route   GET /
    // @desc    Render the main homepage (HUB)
    // @access  Public
    router.get('/', hubController.renderHomePage); // No catchAsync needed if controller is not async

    return router; // Return the configured router
};
