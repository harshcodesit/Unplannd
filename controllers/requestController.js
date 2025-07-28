// glimmergrid-mvp/controllers/requestController.js

const mongoose = require('mongoose'); // Import mongoose for dynamic model access

// Models are accessed dynamically within functions for consistency.

// --- Send a Join Request to a Glimmer ---
module.exports.sendJoinRequest = async (req, res) => {
    const Glimmer = mongoose.model('Glimmer');
    const Request = mongoose.model('Request');
    const User = mongoose.model('User'); 

    const { glimmerId } = req.params; // Get glimmer ID from URL parameters
    const requesterId = req.user._id; // Get logged-in user's ID (requester)

    try {
        const glimmer = await Glimmer.findById(glimmerId);
        if (!glimmer) {
            req.flash('error_msg', 'Glimmer not found.');
            return res.redirect('/glimmers');
        }

        // Prevent host from sending a request to their own glimmer
        if (glimmer.creator.equals(requesterId)) {
            req.flash('error_msg', 'You cannot send a join request to your own glimmer.');
            return res.redirect(`/glimmers/${glimmerId}`);
        }

        // Check if a request already exists from this user for this glimmer
        const existingRequest = await Request.findOne({ glimmer: glimmerId, requester: requesterId });
        if (existingRequest) {
            if (existingRequest.status === 'pending') {
                req.flash('info_msg', 'You have already sent a pending request to join this glimmer.');
            } else if (existingRequest.status === 'accepted') {
                req.flash('info_msg', 'You are already an accepted participant of this glimmer.');
            } else { // rejected
                req.flash('info_msg', 'Your previous request to join this glimmer was rejected.');
            }
            return res.redirect(`/glimmers/${glimmerId}`);
        }

        const newRequest = new Request({
            glimmer: glimmerId,
            requester: requesterId,
            status: 'pending' // Default status
        });

        await newRequest.save();

        req.flash('success_msg', 'Your request to join the glimmer has been sent!');
        res.redirect(`/glimmers/${glimmerId}`);

    } catch (err) {
        console.error("Error sending join request:", err);
        // Handle unique index error (user already requested) more gracefully if not caught above
        if (err.code === 11000) { // MongoDB duplicate key error code
            req.flash('info_msg', 'You have already sent a request to join this glimmer.');
            return res.redirect(`/glimmers/${glimmerId}`);
        }
        req.flash('error_msg', 'Failed to send join request. Please try again.');
        res.redirect(`/glimmers/${glimmerId}`);
    }
};

// --- View All Requests for a Glimmer (Host's View) ---
module.exports.viewGlimmerRequests = async (req, res) => {
    const Glimmer = mongoose.model('Glimmer');
    const Request = mongoose.model('Request');
    const User = mongoose.model('User');

    const { glimmerId } = req.params;
    const currentUserId = req.user._id; // Logged-in user

    try {
        const glimmer = await Glimmer.findById(glimmerId).populate('creator');

        if (!glimmer) {
            req.flash('error_msg', 'Glimmer not found.');
            return res.redirect('/glimmers');
        }

        // Authorization: Only the glimmer creator can view requests
        if (!glimmer.creator.equals(currentUserId)) {
            req.flash('error_msg', 'You are not authorized to view requests for this glimmer.');
            return res.redirect(`/glimmers/${glimmerId}`);
        }

        // Find all requests for this glimmer, populate requester details
        const requests = await Request.find({ glimmer: glimmerId })
                                    .populate('requester', 'username name avatarUrl'); // Get basic user info

        res.render('requests/index', { // You will need to create this EJS file
            title: `Requests for ${glimmer.title}`,
            glimmer,
            requests,
            user: req.user
        });

    } catch (err) {
        console.error("Error fetching glimmer requests:", err);
        if (err.name === 'CastError') {
            req.flash('error_msg', 'Invalid Glimmer ID.');
            return res.redirect('/glimmers');
        }
        req.flash('error_msg', 'Could not load glimmer requests.');
        res.redirect(`/glimmers/${glimmerId}`);
    }
};

// --- Accept a Join Request ---
module.exports.acceptJoinRequest = async (req, res) => {
    const Glimmer = mongoose.model('Glimmer');
    const Request = mongoose.model('Request');
    const User = mongoose.model('User');

    const { glimmerId, requestId } = req.params;
    const currentUserId = req.user._id; // Logged-in user (should be host)

    try {
        const glimmer = await Glimmer.findById(glimmerId);
        const request = await Request.findById(requestId);

        if (!glimmer || !request) {
            req.flash('error_msg', 'Glimmer or Request not found.');
            return res.redirect(`/glimmers/${glimmerId}/requests`);
        }

        // Authorization: Ensure current user is the glimmer creator AND request belongs to this glimmer
        if (!glimmer.creator.equals(currentUserId) || !request.glimmer.equals(glimmerId)) {
            req.flash('error_msg', 'You are not authorized to perform this action.');
            return res.redirect(`/glimmers/${glimmerId}/requests`);
        }

        // Only accept if status is pending
        if (request.status !== 'pending') {
            req.flash('info_msg', 'This request is no longer pending.');
            return res.redirect(`/glimmers/${glimmerId}/requests`);
        }

        // 1. Update request status to 'accepted'
        request.status = 'accepted';
        await request.save();

        // 2. Add requester to glimmer's participants array (if not already there)
        if (!glimmer.participants.includes(request.requester)) {
            glimmer.participants.push(request.requester);
            await glimmer.save();
        }

        req.flash('success_msg', `Request from ${request.requester.username || 'a user'} accepted!`);
        res.redirect(`/glimmers/${glimmerId}/requests`);

    } catch (err) {
        console.error("Error accepting join request:", err);
        req.flash('error_msg', 'Failed to accept request. Please try again.');
        res.redirect(`/glimmers/${glimmerId}/requests`);
    }
};

// --- Reject a Join Request ---
module.exports.rejectJoinRequest = async (req, res) => {
    const Glimmer = mongoose.model('Glimmer');
    const Request = mongoose.model('Request');
    const User = mongoose.model('User');

    const { glimmerId, requestId } = req.params;
    const currentUserId = req.user._id; // Logged-in user (should be host)

    try {
        const glimmer = await Glimmer.findById(glimmerId);
        const request = await Request.findById(requestId);

        if (!glimmer || !request) {
            req.flash('error_msg', 'Glimmer or Request not found.');
            return res.redirect(`/glimmers/${glimmerId}/requests`);
        }

        // Authorization: Ensure current user is the glimmer creator AND request belongs to this glimmer
        if (!glimmer.creator.equals(currentUserId) || !request.glimmer.equals(glimmerId)) {
            req.flash('error_msg', 'You are not authorized to perform this action.');
            return res.redirect(`/glimmers/${glimmerId}/requests`);
        }

        // Only reject if status is pending
        if (request.status !== 'pending') {
            req.flash('info_msg', 'This request is no longer pending.');
            return res.redirect(`/glimmers/${glimmerId}/requests`);
        }

        // Update request status to 'rejected'
        request.status = 'rejected';
        await request.save();

        req.flash('success_msg', `Request from ${request.requester.username || 'a user'} rejected.`);
        res.redirect(`/glimmers/${glimmerId}/requests`);

    } catch (err) {
        console.error("Error rejecting join request:", err);
        req.flash('error_msg', 'Failed to reject request. Please try again.');
        res.redirect(`/glimmers/${glimmerId}/requests`);
    }
};