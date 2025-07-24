// glimmergrid-mvp/middleware/authMiddleware.js

module.exports = {
    // Middleware to ensure a user is authenticated to access a route
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            // req.isAuthenticated() is a method added by Passport.js
            return next(); // User is authenticated, proceed to the next middleware/route handler
        }
        // If not authenticated, store a flash message and redirect to the login page
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/login');
    },

    // Middleware to prevent authenticated users from accessing login/register pages
    forwardAuthenticated: function(req, res, next) {
        if (!req.isAuthenticated()) {
            // User is NOT authenticated, proceed (let them see login/register)
            return next();
        }
        // If authenticated, redirect them away (e.g., to dashboard or home)
        // Make sure this path exists or leads somewhere valid for logged-in users.
        res.redirect('/dashboard'); // Or '/glimmers' or '/' depending on your app's flow
    }
};