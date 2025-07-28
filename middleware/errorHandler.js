// glimmergrid-mvp/middleware/errorHandler.js

// Middleware to catch Multer errors specifically
module.exports.multerErrorHandler = (err, req, res, next) => {
    if (err instanceof require('multer').MulterError) {
        console.error("Multer Error Caught:", err.code, err.message);
        req.flash('error_msg', `Upload Error: ${err.message}`);
        // Redirect back to the form where the upload originated
        // This is a generic redirect; for specific forms, you might need more granular logic
        if (req.originalUrl.includes('/register')) {
            return res.redirect('/register');
        } else if (req.originalUrl.includes('/profile/edit')) {
            return res.redirect('/profile/edit');
        } else if (req.originalUrl.includes('/glimmers/')) { // For glimmer create/edit
            return res.redirect(req.originalUrl); // Redirect back to the same glimmer page
        }
        // Fallback for other cases
        return res.redirect('/hub');
    } else if (err.message && err.message.startsWith('Only image files')) {
        // This catches our custom req.fileValidationError messages from multerConfig
        req.flash('error_msg', err.message);
        if (req.originalUrl.includes('/register')) {
            return res.redirect('/register');
        } else if (req.originalUrl.includes('/profile/edit')) {
            return res.redirect('/profile/edit');
        } else if (req.originalUrl.includes('/glimmers/')) {
            return res.redirect(req.originalUrl);
        }
        return res.redirect('/hub');
    }
    // If it's not a Multer error, pass it to the next error handler
    next(err);
};

// Generic error handler (optional, but good practice for uncaught errors)
module.exports.generalErrorHandler = (err, req, res, next) => {
    console.error("General Error Caught:", err);
    req.flash('error_msg', 'Something went wrong: ' + err.message);
    res.redirect('/hub'); // Redirect to a safe page
};
