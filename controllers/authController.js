// glimmergrid-mvp/controllers/authController.js
const passport = require('passport');
const User = require('../models/User');
const upload = require('../config/multerConfig'); // Import multer configuration

// --- Render Login Page ---
exports.renderLoginPage = (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        oldInput: { email: '' } // For preserving input on error (if you add this to login.ejs)
    });
};

// --- Render Register Page ---
exports.renderRegisterPage = (req, res) => {
    res.render('auth/register', {
        title: 'Sign Up',
        errors: [],
        oldInput: { name: '', username: '', email: '', password: '', passwordConfirm: '' } // Changed password2 to passwordConfirm
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
        const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : undefined; // Get avatar URL if file uploaded

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

        // Validate username format (if you use this regex in client-side, ensure consistency)
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

            // User.register method handles checking if the email (usernameField) already exists
            // and also handles hashing the password.
            const registeredUser = await User.register(newUser, password);

            // If registration is successful, log the user in immediately
            req.login(registeredUser, (loginErr) => {
                if (loginErr) {
                    console.error("Login after registration error:", loginErr);
                    req.flash('error_msg', 'Registration successful, but automatic login failed. Please try logging in.');
                    return res.redirect('/login'); // Corrected redirect
                }
                req.flash('success_msg', 'You are now registered and logged in!');
                res.redirect('/dashboard');
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
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login', // Corrected redirect
        failureFlash: true
    })(req, res, next);
};

// --- Logout User ---
exports.logoutUser = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/login'); // Corrected redirect
    });
};

// --- Render Profile Page ---
exports.renderProfilePage = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
                                .populate('hostedGlimmers')
                                .populate('joinedGlimmers');

        if (!user) {
            req.flash('error_msg', 'User profile not found.');
            return res.redirect('/dashboard');
        }

        res.render('profile/view', { // Assuming views/profile/view.ejs based on common naming or your structure
            title: 'My Profile',
            user: user
        });
    } catch (err) {
        console.error("Error rendering profile page:", err);
        req.flash('error_msg', 'Could not load profile information.');
        res.redirect('/dashboard');
    }
};


// --- Render Edit Profile Page ---
exports.renderEditProfilePage = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            req.flash('error_msg', 'User not found for editing.');
            return res.redirect('/dashboard');
        }
        res.render('profile/edit', {
            title: 'Edit Profile',
            user: user,
            errors: []
        });
    } catch (err) {
        console.error("Error rendering edit profile page:", err);
        req.flash('error_msg', 'Could not load profile for editing.');
        res.redirect('/dashboard');
    }
};

// --- Update User Profile ---
exports.updateProfile = (req, res, next) => {
    upload(req, res, async (err) => { // Use multer upload middleware
        if (err) {
            console.error("Multer Upload Error:", err);
            req.flash('error_msg', err.message || 'Error uploading file.');
            return res.render('profile/edit', {
                title: 'Edit Profile',
                user: req.user, // Still pass the user for the form
                errors: [{ msg: err.message || 'Error uploading file.' }]
            });
        }

        const { name, username, email } = req.body;
        let errors = [];

        // Basic validation for name and email
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
                user: { ...req.user.toObject(), name, username, email }, // Pass updated values for display
                errors
            });
        }

        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                req.flash('error_msg', 'User not found.');
                return res.redirect('/dashboard');
            }

            // Check for duplicate email if changing
            if (email !== user.email) {
                const existingUserWithEmail = await User.findOne({ email: email });
                if (existingUserWithEmail && existingUserWithEmail._id.toString() !== user._id.toString()) {
                    errors.push({ msg: 'That email is already registered to another account.' });
                }
            }

            // Check for duplicate username if changing
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
            user.username = username; // Update username
            user.email = email; // Update email

            if (req.file) { // If a new avatar was uploaded, update the URL
                user.avatarUrl = `/uploads/avatars/${req.file.filename}`;
            }

            await user.save();

            req.flash('success_msg', 'Profile updated successfully!');
            res.redirect('/profile'); // Corrected redirect
        } catch (dbErr) {
            console.error("Error updating profile:", dbErr);
            let msg = 'Error updating profile. Please try again.';
            if (dbErr.code === 11000) { // MongoDB duplicate key error
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
        res.redirect('/dashboard');
    } catch (err) {
        console.error("Error changing password:", err);
        req.flash('error_msg', err.message || 'Error changing password. Check your current password.');
        res.render('profile/change-password', {
            title: 'Change Password',
            errors: [{ msg: err.message || 'Error changing password.' }]
        });
    }
};