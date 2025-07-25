// glimmergrid-mvp/routes/glimmerRoutes.js
const express = require('express');
const router = express.Router();
const glimmerController = require('../controllers/glimmerController'); // Ensure this path is correct: ../controllers/glimmerController.js

// @route   GET /glimmers
// @desc    Display a list of all glimmers
// @access  Public
router.get('/', glimmerController.index); // Ensure 'index' is the correct function name

// @route   GET /glimmers/:id
// @desc    Display details for a single glimmer
// @access  Public
router.get('/:id', glimmerController.show); // Ensure 'show' is the correct function name

module.exports = router;
