// glimmergrid-mvp/routes/requests.js

const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams: true is crucial for accessing :glimmerId from parent routes
const requestController = require('../controllers/requestController');
const { isLoggedIn } = require('../middleware'); // Assuming you have an authentication middleware
const catchAsync = require('../utils/catchAsync'); // Assuming you have an async error handling utility

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

module.exports = router;
