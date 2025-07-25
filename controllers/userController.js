// glimmergrid-mvp/controllers/userController.js (or wherever your user logic is)

const User = require('../models/User');
const Glimmer = require('../models/Glimmer'); // Needed to populate hosted/participated glimmers

// Existing functions (register, login, logout, etc. would be here)
// ...

// NEW FUNCTION: Show User Profile
module.exports.showUserProfile = async (req, res) => {
    try {
        const { id } = req.params; // The ID of the user whose profile we want to view

        // Find the user by ID and populate their hosted and participated glimmers
        const userProfile = await User.findById(id)
                                    .populate({
                                        path: 'hostedGlimmers',
                                        select: 'title locationName startDate image' // Select relevant fields
                                    })
                                    .populate({
                                        path: 'participatedGlimmers',
                                        select: 'title locationName startDate image' // Select relevant fields
                                    });

        if (!userProfile) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/glimmers'); // Or to a general users list, if you have one
        }

        // Determine if the logged-in user is viewing their own profile
        const isCurrentUser = req.user && req.user._id.equals(userProfile._id);

        res.render('users/show', { // Render a new EJS template: views/users/show.ejs
            title: `${userProfile.username}'s Profile`,
            userProfile, // The user data to display
            isCurrentUser, // Pass this flag to the EJS for conditional rendering (e.g., edit button)
            user: req.user // Pass the logged-in user object for navbar/general layout
        });

    } catch (err) {
        console.error("Error fetching user profile:", err);
        // Handle CastError for invalid user IDs
        if (err.name === 'CastError') {
            req.flash('error_msg', 'Invalid User ID.');
            return res.redirect('/glimmers');
        }
        req.flash('error_msg', 'Could not load user profile.');
        res.redirect('/glimmers');
    }
};

// ... other exports (e.g., module.exports.registerUser = ...)
