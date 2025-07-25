// glimmergrid-mvp/controllers/glimmerController.js
const Glimmer = require('../models/Glimmer');
const User = require('../models/User'); // Required for populating creator/participants
const Review = require('../models/Review'); // Required for populating reviews
const upload = require('../config/multerConfig'); // Import multer configuration for image uploads

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

// --- Create New Glimmer ---
exports.createGlimmer = (req, res, next) => {
    // Use multer upload middleware for the image
    upload(req, res, async (err) => {
        if (err) {
            console.error("Multer Upload Error for Glimmer:", err);
            req.flash('error_msg', err.message || 'Error uploading glimmer image.');
            return res.redirect('/grid/launch'); // Redirect back to launch page on error
        }

        const { title, description, location, startDate, endDate } = req.body.glimmer;
        const image = req.file ? `/uploads/glimmers/${req.file.filename}` : undefined; // Path for glimmer images

        let errors = [];

        // Basic validation (can be expanded)
        if (!title || !description || !location || !startDate) {
            errors.push({ msg: 'Title, Description, Location, and Start Date are required.' });
        }
        if (title && title.length < 3) {
            errors.push({ msg: 'Title must be at least 3 characters long.' });
        }
        if (description && description.length < 10) {
            errors.push({ msg: 'Description must be at least 10 characters long.' });
        }

        // Date validation
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : null;
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalize 'now' to start of day for comparison

        if (start < now) {
            errors.push({ msg: 'Start date cannot be in the past.' });
        }
        if (end && end < start) {
            errors.push({ msg: 'End date cannot be before start date.' });
        }

        if (errors.length > 0) {
            req.flash('error_msg', errors.map(e => e.msg).join(' '));
            // You might want to pass old input back to the form here too
            return res.redirect('/grid/launch');
        }

        try {
            const newGlimmer = new Glimmer({
                title,
                description,
                location,
                startDate,
                endDate: end, // Use the parsed Date object
                creator: req.user._id, // Assign the logged-in user as creator
                image: image // Set the image path
            });

            // Save the new glimmer
            await newGlimmer.save();

            // Add the new glimmer to the creator's hostedGlimmers array
            req.user.hostedGlimmers.push(newGlimmer._id);
            await req.user.save();

            req.flash('success_msg', 'Glimmer successfully launched!');
            res.redirect(`/glimmers/${newGlimmer._id}`); // Redirect to the new glimmer's show page
        } catch (dbErr) {
            console.error("Error creating glimmer:", dbErr);
            req.flash('error_msg', 'Failed to launch glimmer. Please try again.');
            res.redirect('/grid/launch');
        }
    });
};
