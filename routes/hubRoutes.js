// glimmergrid-mvp/routes/hubRoutes.js
const express = require('express');
const router = express.Router();
const hubController = require('../controllers/hubController'); // Ensure this path is correct

// @route   GET /
// @desc    Render the main homepage (HUB)
// @access  Public
router.get('/', hubController.renderHomePage); // Ensure 'renderHomePage' is the correct function name

module.exports = router;
