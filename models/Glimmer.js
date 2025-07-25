// glimmergrid-mvp/controllers/glimmerController.js
const Glimmer = require('../models/Glimmer');
const User = require('../models/User'); // Required for populating creator/participants
const Review = require('../models/Review'); // Required for populating reviews

// --- Render Glimmers Index Page ---
exports.index = async (req, res) => {
    try {
        const glimmers = await Glimmer.find({})
                                      .populate('creator', 'username name avatarUrl') // Populate creator's basic info
                                      .sort({ createdAt: -1 }); // Show newest first

        res.render('glimmers/index', {
            title: 'All Glimmers',
            glimmers: glimmers,
            user: req.user // Pass user object for conditional display in navbar/layouts
        });
    } catch (err) {
        console.error("Error fetching glimmers:", err);
        req.flash('error_msg', 'Could not load glimmers.');
        res.redirect('/hub'); // Redirect to new homepage (HUB)
    }
};

// --- Render Single Glimmer Page ---
exports.show = async (req, res) => {
    try {
        const glimmer = await Glimmer.findById(req.params.id)
                                    .populate('creator', 'username name avatarUrl') // Populate creator details
                                    .populate('participants', 'username name avatarUrl') // Populate participants details
                                    .populate({ // Populate reviews for this glimmer, and the reviewer's basic info
                                        path: 'reviews',
                                        populate: {
                                            path: 'reviewer',
                                            select: 'username name avatarUrl'
                                        }
                                    });

        if (!glimmer) {
            req.flash('error_msg', 'Glimmer not found.');
            return res.redirect('/glimmers');
        }

        res.render('glimmers/show', {
            title: glimmer.title,
            glimmer: glimmer,
            user: req.user // Pass user object
        });
    } catch (err) {
        console.error("Error fetching single glimmer:", err);
        // Check for CastError (invalid ID format)
        if (err.name === 'CastError') {
            req.flash('error_msg', 'Invalid Glimmer ID.');
            return res.redirect('/glimmers');
        }
        req.flash('error_msg', 'Could not load glimmer details.');
        res.redirect('/glimmers');
    }
};
