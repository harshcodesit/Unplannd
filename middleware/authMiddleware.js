// glimmergrid-mvp/middleware/authMiddleware.js
const mongoose = require('mongoose'); // Import mongoose for dynamic model access

// Middleware to check if user is authenticated to access a route
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // Store the URL they were trying to access
        req.flash('error_msg', 'You must be logged in to do that.');
        return res.redirect('/login');
    }
    next();
};

// Middleware to prevent authenticated users from accessing login/register pages
module.exports.forwardAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/hub'); // Redirect to new homepage (HUB) if already logged in
};

// Middleware to check if the logged-in user is the author/creator of the Glimmer
module.exports.isAuthor = async (req, res, next) => {
    const Glimmer = mongoose.model('Glimmer'); // Get Glimmer model dynamically
    
    const { id } = req.params; // Get the glimmer ID from the URL
    const glimmer = await Glimmer.findById(id); // Find the glimmer

    if (!glimmer) {
        req.flash('error_msg', 'Glimmer not found.');
        return res.redirect('/glimmers'); // Redirect to all glimmers if not found
    }

    // Check if the glimmer's creator ID matches the logged-in user's ID
    if (!glimmer.creator.equals(req.user._id)) {
        req.flash('error_msg', 'You do not have permission to do that. You are not the owner of this Glimmer.');
        return res.redirect(`/glimmers/${id}`); // Redirect back to the glimmer's show page
    }
    next(); // If authorized, proceed
};
