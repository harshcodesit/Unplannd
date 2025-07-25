// glimmergrid-mvp/routes/users.js

const express = require('express');
const router = express.Router(); // No mergeParams needed here, as it's a top-level route
const userController = require('../controllers/userController'); // Make sure this path is correct
const { isLoggedIn } = require('../middleware'); // Assuming you have this middleware
const catchAsync = require('../utils/catchAsync'); // Assuming you have this utility

// Existing routes (register, login, logout would be here)
// ...

// NEW ROUTE: Route to view a specific user's profile
// GET /users/:id/profile
router.get(
    '/:id/profile',
    catchAsync(userController.showUserProfile) // No isLoggedIn needed for viewing public profiles
);

// ... other routes (e.g., router.post('/register', ...))

module.exports = router;
