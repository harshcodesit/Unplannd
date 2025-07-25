// glimmergrid-mvp/controllers/trailController.js
// This controller will handle logic for /trail/sparks and /trail/footprints
const User = require('../models/User'); // Will need User model for these pages
const Glimmer = require('../models/Glimmer'); // Will need Glimmer model for populating

// Render the Hosted Glimmers (Sparks) page
exports.renderSparksPage = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
                               .populate('hostedGlimmers'); // Populate hosted glimmers

        if (!user) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/hub');
        }
        res.render('trail/sparks', {
            title: `${user.username}'s Sparks`,
            user: req.user, // Pass req.user for general user info in navbar/layout
            glimmers: user.hostedGlimmers // Pass hosted glimmers to the view
        });
    } catch (err) {
        console.error("Error rendering sparks page:", err);
        req.flash('error_msg', 'Could not load hosted glimmers.');
        res.redirect('/hub');
    }
};

// Render the Joined Glimmers (Footprints) page
exports.renderFootprintsPage = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
                               .populate('joinedGlimmers'); // Populate joined glimmers

        if (!user) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/hub');
        }
        res.render('trail/footprints', {
            title: `${user.username}'s Footprints`,
            user: req.user, // Pass req.user for general user info in navbar/layout
            glimmers: user.joinedGlimmers // Pass joined glimmers to the view
        });
    } catch (err) {
        console.error("Error rendering footprints page:", err);
        req.flash('error_msg', 'Could not load joined glimmers.');
        res.redirect('/hub');
    }
};

// Add other trail-related functions here as needed
