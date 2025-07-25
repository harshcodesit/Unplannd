// glimmergrid-mvp/routes/gridRoutes.js
const express = require('express');
const router = express.Router();
const glimmerController = require('../controllers/glimmerController'); // Import glimmerController
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// @route   GET /grid/search
// @desc    Display a list of all glimmers (acting as the search page for now)
// @access  Public
router.get('/search', glimmerController.index); // Renders glimmers/index.ejs

// @route   GET /grid/launch
// @desc    Render the form to launch a new glimmer
// @access  Private
router.get('/launch', ensureAuthenticated, (req, res) => {
    res.render('glimmers/launch', {
        title: 'Launch New Glimmer',
        user: req.user // Pass user object
    });
});

module.exports = router;
