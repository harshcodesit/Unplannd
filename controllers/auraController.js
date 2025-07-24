// controllers/authController.js
const User = require('../models/User');
const passport = require('passport');
const { ExpressError } = require('../middleware/errorHandler'); // Assuming errorHandler.js exists

// GET /register - Render registration form
module.exports.renderRegisterForm = (req, res) => {
    // Pass old input if available from a previous failed submission
    const oldInput = req.session.oldInput || {};
    delete req.session.oldInput; // Clear it after use
    res.render('auth/register', { oldInput });
};

// POST /register - Register new user
module.exports.registerUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password); // Passport-local-mongoose method

        req.login(registeredUser, err => { // Automatically log in the user after registration
            if (err) return next(err);
            req.flash('success', 'Welcome to Glimmer! Your account has been created.');
            res.redirect('/glimmers'); // Redirect to glimmers index page
        });
    } catch (e) {
        console.error("Error during user registration:", e);
        // Save old input to session for re-population
        req.session.oldInput = req.body;
        req.flash('error', e.message); // Flash error message (e.g., user already exists)
        res.redirect('/register');
    }
};

// GET /login - Render login form
module.exports.renderLoginForm = (req, res) => {
    res.render('auth/login');
};

// POST /login - Authenticate user
module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/glimmers'; // Redirect to original URL or glimmers index
    delete req.session.returnTo; // Clean up the session
    res.redirect(redirectUrl);
};

// GET /logout - Logout user
module.exports.logoutUser = (req, res, next) => {
    req.logout(function(err) { // Passport's logout method
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/login'); // Redirect to login page after logout
    });
};

// GET /profile/:id - Render user profile
module.exports.renderUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .populate({
                path: 'hostedGlimmers',
                select: 'title images datetime location.name' // Populate specific fields of hosted glimmers
            })
            .populate({
                path: 'joinedGlimmers',
                select: 'title images datetime location.name' // Populate specific fields of joined glimmers
            });

        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/glimmers'); // Or a generic error page
        }
        res.render('user/profile', { user }); // Assuming you have a user/profile.ejs
    } catch (err) {
        console.error("Error fetching user profile:", err);
        next(new ExpressError('Could not load profile.', 500));
    }
};

// GET /profile/:id/edit - Render edit profile form
module.exports.renderEditProfileForm = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/glimmers');
        }
        res.render('user/edit-profile', { user }); // Assuming you have user/edit-profile.ejs
    } catch (err) {
        next(new ExpressError('Error loading edit profile form.', 500));
    }
};

// PUT /profile/:id - Update user profile
module.exports.updateUserProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, email, bio, title } = req.body; // Assuming these are editable fields

        const user = await User.findById(id);
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/glimmers');
        }

        user.username = username || user.username;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.title = title || user.title;

        // Handle avatar upload if a new file is provided
        if (req.file) {
            user.avatar = req.file.path; // Multer saves the path to req.file.path
        }

        await user.save();
        req.flash('success', 'Profile updated successfully!');
        res.redirect(`/profile/${user._id}`);
    } catch (err) {
        console.error("Error updating user profile:", err);
        req.flash('error', 'Failed to update profile. ' + err.message);
        res.redirect(`/profile/${req.params.id}/edit`);
    }
};
