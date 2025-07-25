// glimmergrid-mvp/controllers/authController.js
const passport = require('passport');
const User = require('../models/User');
const Glimmer = require('../models/Glimmer'); // Import Glimmer model
const Review = require('../models/Review');   // Import Review model
const upload = require('../config/multerConfig'); // Import multer configuration

// --- Render Login Page ---
exports.renderLoginPage = (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        oldInput: { username: '' } // For preserving input on error
    });
};

// --- Render Register Page ---
exports.renderRegisterPage = (req, res) => {
    res.render('auth/register', {
        title: 'Sign Up',
        errors: [],
        oldInput: { name: '', username: '', email: '', password: '', passwordConfirm: '' }
    });
};

// --- Register User ---
exports.registerUser = (req, res, next) => {
    upload(req, res, async (err) => { // Use multer upload middleware
        if (err) {
            console.error("Multer Upload Error:", err);
            return res.render('auth/register', {
                title: 'Sign Up',
                errors: [{ msg: err }], // Multer errors are often strings
                oldInput: req.body // Pass back old input
            });
        }

        const { name, username, email, password, passwordConfirm } = req.body;
        const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

        let errors = [];

        // Basic Validation Checks
        if (!name || !username || !email || !password || !passwordConfirm) {
            errors.push({ msg: 'Please enter all fields.' });
        }
        if (password !== passwordConfirm) {
            errors.push({ msg: 'Passwords do not match.' });
        }
        if (password.length < 6) {
            errors.push({ msg: 'Password must be at least 6 characters.' });
        }

        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            errors.push({ msg: 'Username can only contain letters, numbers, and underscores, and be 3-20 characters long.' });
        }

        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            errors.push({ msg: 'Please enter a valid email address.' });
        }

        if (errors.length > 0) {
            return res.render('auth/register', {
                title: 'Sign Up',
                errors,
                oldInput: { name, username, email, password, passwordConfirm }
            });
        }

        try {
            // Check if email already exists
            let existingUserByEmail = await User.findOne({ email: email });
            if (existingUserByEmail) {
                errors.push({ msg: 'Email is already registered.' });
                return res.render('auth/register', {
                    title: 'Sign Up',
                    errors,
                    oldInput: { name, username, email, password, passwordConfirm }
                });
            }

            // Check if username already exists
            let existingUserByUsername = await User.findOne({ username: username });
            if (existingUserByUsername) {
                errors.push({ msg: 'Username is already taken.' });
                return res.render('auth/register', {
                    title: 'Sign Up',
                    errors,
                    oldInput: { name, username, email, password, passwordConfirm }
                });
            }

            const newUser = new User({ name, username, email });
            if (avatarUrl) {
                newUser.avatarUrl = avatarUrl;
            }

            const registeredUser = await User.register(newUser, password);

            req.login(registeredUser, (loginErr) => {
                if (loginErr) {
                    console.error("Login after registration error:", loginErr);
                    req.flash('error_msg', 'Registration successful, but automatic login failed. Please try logging in.');
                    return res.redirect('/login');
                }
                req.flash('success_msg', 'You are now registered and logged in!');
                res.redirect('/hub'); // Redirect to new homepage (HUB)
            });

        } catch (dbErr) {
            console.error("Database Error during registration:", dbErr);
            errors.push({ msg: 'A server error occurred during registration. Please try again.' });
            return res.render('auth/register', {
                title: 'Sign Up',
                errors,
                oldInput: { name, username, email, password, passwordConfirm }
            });
        }
    });
};

// --- Login User ---
exports.loginUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error("Passport authentication error:", err);
            req.flash('error_msg', 'An authentication error occurred.');
            return res.redirect('/login');
        }
        if (!user) {
            req.flash('error_msg', info.message || 'Invalid username or password.');
            return res.redirect('/login');
        }

        req.logIn(user, (loginErr) => {
            if (loginErr) {
                console.error("Login session error:", loginErr);
                req.flash('error_msg', 'Could not log in at this time. Please try again.');
                return res.redirect('/login');
            }

            const redirectUrl = req.session.returnTo || '/hub'; // Use '/hub' as fallback
            if (req.session.returnTo) {
                delete req.session.returnTo;
            }
            req.flash('success_msg', 'You are now logged in!');
            res.redirect(redirectUrl);
        });
    })(req, res, next);
};

// --- Logout User ---
exports.logoutUser = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/login');
    });
};

// --- Render Aura (Profile) Page ---
exports.renderAuraPage = async (req, res) => { // Renamed from renderProfilePage
    try {
        // 1. Find the user and populate hosted/joined glimmers
        const user = await User.findById(req.user._id)
                                .populate('hostedGlimmers') // Populate to get count of hosted events
                                .populate('joinedGlimmers'); // Populate to get count of joined events

        if (!user) {
            req.flash('error_msg', 'User aura not found.');
            return res.redirect('/hub'); // Redirect to new homepage
        }

        // 2. Get IDs of glimmers hosted by this user
        const hostedGlimmerIds = user.hostedGlimmers.map(glimmer => glimmer._id);

        // 3. Find reviews for glimmers hosted by this user (reviews RECEIVED)
        const receivedReviews = await Review.find({ glimmer: { $in: hostedGlimmerIds } })
                                            .populate('reviewer', 'username name avatarUrl') // Who wrote the review
                                            .populate('glimmer', 'title') // Which glimmer it's for
                                            .sort({ createdAt: -1 }) // Newest first
                                            .limit(5); // Last 5 reviews

        res.render('aura/aura', { // Updated EJS path
            title: `${user.username}'s Aura`, // Updated title
            user: user, // Pass the fully populated user object
            receivedReviews: receivedReviews // Pass the received reviews
        });
    } catch (err) {
        console.error("Error rendering aura page:", err);
        req.flash('error_msg', 'Could not load aura information.');
        res.redirect('/hub'); // Redirect to new homepage
    }
};

// --- Render Edit Profile Page ---
exports.renderEditProfilePage = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            req.flash('error_msg', 'User not found for editing.');
            return res.redirect('/hub');
        }
        res.render('profile/edit', { // This EJS path remains 'profile/edit' for now
            title: 'Edit Profile',
            user: user,
            errors: []
        });
    } catch (err) {
        console.error("Error rendering edit profile page:", err);
        req.flash('error_msg', 'Could not load profile for editing.');
        res.redirect('/hub');
    }
};

// --- Update User Profile ---
exports.updateProfile = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error("Multer Upload Error:", err);
            req.flash('error_msg', err.message || 'Error uploading file.');
            return res.render('profile/edit', {
                title: 'Edit Profile',
                user: req.user,
                errors: [{ msg: err.message || 'Error uploading file.' }]
            });
        }

        const { name, username, email } = req.body;
        let errors = [];

        if (!name || !username || !email) {
            errors.push({ msg: 'Name, Username, and Email are required.' });
        }
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            errors.push({ msg: 'Please enter a valid email address.' });
        }
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            errors.push({ msg: 'Username can only contain letters, numbers, and underscores, and be 3-20 characters long.' });
        }

        if (errors.length > 0) {
            req.flash('error_msg', 'Please correct the errors.');
            return res.render('profile/edit', {
                title: 'Edit Profile',
                user: { ...req.user.toObject(), name, username, email },
                errors
            });
        }

        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                req.flash('error_msg', 'User not found.');
                return res.redirect('/hub');
            }

            if (email !== user.email) {
                const existingUserWithEmail = await User.findOne({ email: email });
                if (existingUserWithEmail && existingUserWithEmail._id.toString() !== user._id.toString()) {
                    errors.push({ msg: 'That email is already registered to another account.' });
                }
            }

            if (username !== user.username) {
                const existingUserWithUsername = await User.findOne({ username: username });
                if (existingUserWithUsername && existingUserWithUsername._id.toString() !== user._id.toString()) {
                    errors.push({ msg: 'That username is already taken.' });
                }
            }

            if (errors.length > 0) {
                req.flash('error_msg', 'Please correct the errors.');
                return res.render('profile/edit', {
                    title: 'Edit Profile',
                    user: { ...req.user.toObject(), name, username, email },
                    errors
                });
            }

            user.name = name;
            user.username = username;
            user.email = email;

            if (req.file) {
                user.avatarUrl = `/uploads/avatars/${req.file.filename}`;
            }

            await user.save();

            req.flash('success_msg', 'Profile updated successfully!');
            res.redirect('/aura'); // Redirect to new aura page
        } catch (dbErr) {
            console.error("Error updating profile:", dbErr);
            let msg = 'Error updating profile. Please try again.';
            if (dbErr.code === 11000) {
                if (dbErr.keyPattern && dbErr.keyPattern.email) {
                    msg = 'That email is already registered to another account.';
                } else if (dbErr.keyPattern && dbErr.keyPattern.username) {
                    msg = 'That username is already taken.';
                }
            }
            req.flash('error_msg', msg);
            res.render('profile/edit', {
                title: 'Edit Profile',
                user: { ...req.user.toObject(), name, username, email },
                errors: [{ msg: msg }]
            });
        }
    });
};

// --- Render Change Password Page ---
exports.renderChangePasswordPage = (req, res) => {
    res.render('profile/change-password', {
        title: 'Change Password',
        errors: []
    });
};

// --- Change Password ---
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, newPassword2 } = req.body;
    let errors = [];

    if (!currentPassword || !newPassword || !newPassword2) {
        errors.push({ msg: 'Please fill in all fields.' });
    }
    if (newPassword !== newPassword2) {
        errors.push({ msg: 'New passwords do not match.' });
    }
    if (newPassword.length < 6) {
        errors.push({ msg: 'New password must be at least 6 characters.' });
    }

    if (errors.length > 0) {
        req.flash('error_msg', 'Please correct the errors.');
        return res.render('profile/change-password', {
            title: 'Change Password',
            errors
        });
    }

    try {
        await req.user.changePassword(currentPassword, newPassword);
        req.flash('success_msg', 'Password changed successfully!');
        res.redirect('/aura'); // Redirect to new aura page
    } catch (err) {
        console.error("Error changing password:", err);
        req.flash('error_msg', err.message || 'Error changing password. Check your current password.');
        res.render('profile/change-password', {
            title: 'Change Password',
            errors: [{ msg: err.message || 'Error changing password.' }]
        });
    }
};
