// glimmergrid-mvp/controllers/gridController.js
const mongoose = require('mongoose'); // Import mongoose for dynamic model access
// Glimmer model is accessed dynamically via mongoose.model() if needed for search logic

// Render the Search Glimmer page
exports.renderSearchGlimmerPage = (req, res) => {
    // This page will display all glimmers, and the search bar will filter them.
    // The actual filtering logic will be added later.
    // For now, it simply renders the glimmers/index.ejs which is meant for all glimmers.
    res.render('grid/search', { // Renders grid/search.ejs (which may contain a search form and display glimmers/index content)
        title: 'Search Glimmers',
        user: req.user // Pass user for conditional display
    });
};

// Render the Host Glimmer (Launch) page
// This will be a protected route, only for logged-in users
exports.renderLaunchGlimmerPage = (req, res) => {
    res.render('glimmers/launch', { // Renders the glimmers/launch.ejs form (Note: not grid/launch)
        title: 'Host a Glimmer',
        user: req.user // Pass user for conditional display
    });
};

// Add other grid-related functions here as needed (e.g., handleGlimmerSearch)
// For example, if you implement search logic, it might look like this (but not implemented in this phase):
// exports.handleGlimmerSearch = async (req, res) => {
//     const Glimmer = mongoose.model('Glimmer');
//     const { q } = req.query; // Assuming search query comes from URL like ?q=...
//     try {
//         const glimmers = await Glimmer.find({ title: new RegExp(q, 'i') }); // Basic search by title
//         res.render('glimmers/index', { title: `Search Results for "${q}"`, glimmers, user: req.user });
//     } catch (err) {
//         console.error("Error during glimmer search:", err);
//         req.flash('error_msg', 'Could not perform search.');
//         res.redirect('/grid/search');
//     }
// };