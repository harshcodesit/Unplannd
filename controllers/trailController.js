// glimmergrid-mvp/controllers/trailController.js
const mongoose = require('mongoose'); // Import mongoose for dynamic model access

// Models will be accessed dynamically via mongoose.model() within functions.

// Render the Hosted Glimmers (Sparks) page
module.exports.renderSparksPage = async (req, res) => {
    const User = mongoose.model('User');
    const Glimmer = mongoose.model('Glimmer');

    try {
        const currentUser = await User.findById(req.user._id)
                                    .populate({
                                        path: 'hostedGlimmers',
                                        select: 'title locationName startDate image'
                                    })
                                    .sort({ 'hostedGlimmers.startDate': -1 });

        if (!currentUser) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/login');
        }

        res.render('trail/sparks', {
            title: 'Your Hosted Glimmers',
            hostedGlimmers: currentUser.hostedGlimmers,
            user: req.user
        });

    } catch (err) {
        console.error("Error rendering sparks page:", err);
        req.flash('error_msg', 'Could not load your hosted glimmers.');
        res.redirect('/hub');
    }
};

// Render the Joined Glimmers (Footprints) page
module.exports.renderFootprintsPage = async (req, res) => {
    const User = mongoose.model('User');
    const Glimmer = mongoose.model('Glimmer');

    try {
        const currentUser = await User.findById(req.user._id)
                               .populate({
                                   path: 'joinedGlimmers',
                                   select: 'title locationName startDate image'
                               });

        if (!currentUser) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/login');
        }
        res.render('trail/footprints', {
            title: `${currentUser.username}'s Footprints`,
            user: req.user,
            joinedGlimmers: currentUser.joinedGlimmers
        });
    } catch (err) {
        console.error("Error rendering footprints page:", err);
        req.flash('error_msg', 'Could not load joined glimmers.');
        res.redirect('/hub');
    }
};