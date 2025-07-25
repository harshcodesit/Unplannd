// glimmergrid-mvp/controllers/gridController.js
// This controller will handle logic for /grid/search and /grid/launch
const Glimmer = require('../models/Glimmer'); // Will be needed for search functionality

// Render the Search Glimmer page
exports.renderSearchGlimmerPage = (req, res) => {
    res.render('grid/search', {
        title: 'Search Glimmers',
        user: req.user // Pass user for conditional display
    });
};

// Render the Host Glimmer (Launch) page
// This will be a protected route, only for logged-in users
exports.renderLaunchGlimmerPage = (req, res) => {
    res.render('grid/launch', {
        title: 'Host a Glimmer',
        user: req.user // Pass user for conditional display
    });
};

// Add other grid-related functions here as needed (e.g., handleGlimmerSearch, createGlimmer)
