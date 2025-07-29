// glimmergrid-mvp/routes/requests.js

const express = require('express');
const router = express.Router({ mergeParams: true });
// The requestController is now passed as an argument to the module.exports function
// const requestController = require('../controllers/requestController'); // REMOVED direct import here
const { isLoggedIn } = require('../middleware/authMiddleware'); // Corrected middleware import
const catchAsync = require('../utils/catchAsync'); // Utility for async error handling

// Export a function that accepts requestController as an argument
module.exports = (requestController) => { // This router now exports a function
    const router = express.Router({ mergeParams: true }); // Ensure mergeParams: true here too

    // Route to send a join request to a specific glimmer
    // POST /glimmers/:glimmerId/requests
    router.post(
        '/',
        isLoggedIn, // User must be logged in to send a request
        catchAsync(requestController.sendJoinRequest)
    );

    // Route to view all requests for a specific glimmer (for the host)
    // GET /glimmers/:glimmerId/requests
    router.get(
        '/',
        isLoggedIn, // User must be logged in to view requests
        catchAsync(requestController.viewGlimmerRequests)
    );

    // Route to accept a join request
    // PATCH /glimmers/:glimmerId/requests/:requestId/accept
    router.patch(
        '/:requestId/accept',
        isLoggedIn, // User must be logged in (and authorized as host)
        catchAsync(requestController.acceptJoinRequest)
    );

    // Route to reject a join request
    // PATCH /glimmers/:glimmerId/requests/:requestId/reject
    router.patch(
        '/:requestId/reject',
        isLoggedIn, // User must be logged in (and authorized as host)
        catchAsync(requestController.rejectJoinRequest)
    );

    return router; // Return the configured router
};