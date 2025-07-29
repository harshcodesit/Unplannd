// glimmergrid-mvp/middleware/authMiddleware.js
const mongoose = require('mongoose');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error_msg', 'You must be logged in to do that.');
        return res.redirect('/login');
    }
    next();
};

module.exports.forwardAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/hub');
};

module.exports.ensureAuthenticated = (req, res, next) => { // This is often synonymous with isLoggedIn
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.returnTo = req.originalUrl;
    req.flash('error_msg', 'Please log in to view that resource.');
    res.redirect('/login');
};

module.exports.isAuthor = async (req, res, next) => {
    const Glimmer = mongoose.model('Glimmer');
    
    const { id } = req.params;
    const glimmer = await Glimmer.findById(id);

    if (!glimmer) {
        req.flash('error_msg', 'Glimmer not found.');
        return res.redirect('/glimmers');
    }

    if (!glimmer.creator.equals(req.user._id)) {
        req.flash('error_msg', 'You do not have permission to do that. You are not the owner of this Glimmer.');
        return res.redirect(`/glimmers/${id}`);
    }
    next();
};