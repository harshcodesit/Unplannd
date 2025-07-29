// glimmergrid-mvp/routes/glimmerRoutes.js
const express = require('express');
// The router itself will be created inside the exported function
// No direct glimmerController import here
const { isLoggedIn, isAuthor } = require('../middleware/authMiddleware'); // Corrected middleware import
const { uploadGlimmerImages } = require('../config/multerConfig'); // Import specific multer uploader
const catchAsync = require('../utils/catchAsync'); // Utility for async error handling


// Export a function that accepts glimmerController as an argument
module.exports = (glimmerController) => { // This router now exports a function
    const router = express.Router();

    // @route   GET /glimmers
    // @desc    Display a list of all glimmers
    // @access  Public
    router.get('/', catchAsync(glimmerController.index)); // Using catchAsync for controller functions

    // @route   POST /glimmers
    // @desc    Handle creating a new glimmer
    // @access  Private (only logged-in users can host)
    // Multer middleware 'uploadGlimmerImages' runs BEFORE the controller function
    router.post(
        '/',
        isLoggedIn, // User must be logged in to create
        uploadGlimmerImages, // Process multi-image upload
        catchAsync(glimmerController.createGlimmer) // Controller handles the rest
    );

    // @route   GET /glimmers/:id/edit
    // @desc    Render the form to edit a specific glimmer
    // @access  Private (only glimmer creator can edit)
    // Note: Edit/Delete routes are part of Phase 4, but included here for completeness of glimmerRoutes structure
    router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(glimmerController.renderEditForm));

    // @route   PUT /glimmers/:id
    // @desc    Handle updating a specific glimmer
    // @access  Private (only glimmer creator can update)
    // Note: Edit/Delete routes are part of Phase 4, but included here for completeness of glimmerRoutes structure
    router.put(
        '/:id',
        isLoggedIn,
        isAuthor,
        uploadGlimmerImages, // Process multi-image upload
        catchAsync(glimmerController.updateGlimmer)
    );

    // @route   DELETE /glimmers/:id
    // @desc    Handle deleting a specific glimmer
    // @access  Private (only glimmer creator can delete)
    // Note: Edit/Delete routes are part of Phase 4, but included here for completeness of glimmerRoutes structure
    router.delete('/:id', isLoggedIn, isAuthor, catchAsync(glimmerController.deleteGlimmer));

    // @route   GET /glimmers/:id
    // @desc    Display details for a single glimmer
    // @access  Public
    router.get('/:id', catchAsync(glimmerController.showGlimmer)); // Using catchAsync for controller functions

    return router; // Return the configured router
};