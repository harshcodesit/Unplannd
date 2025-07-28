// glimmergrid-mvp/controllers/glimmerController.js
const mongoose = require('mongoose'); // Import mongoose for dynamic model access
// Models (Glimmer, User, Review, Request) are accessed dynamically within functions
// to prevent circular dependencies and ensure they are registered by Mongoose.

// Helper function to generate blurred coordinates (server-side)
function getBlurredCoordinates(longitude, latitude, radiusKm = 1) {
    const R = 6371; // Earth's radius in kilometers
    const latRad = (latitude * Math.PI) / 180;
    const lonRad = (longitude * Math.PI) / 180;

    const randomAngle = Math.random() * 2 * Math.PI;
    const randomDistance = Math.random() * radiusKm; // Random distance up to radiusKm

    const newLatRad = Math.asin(
        Math.sin(latRad) * Math.cos(randomDistance / R) +
        Math.cos(latRad) * Math.sin(randomDistance / R) * Math.cos(randomAngle)
    );

    const newLonRad = lonRad + Math.atan2(
        Math.sin(randomAngle) * Math.sin(randomDistance / R) * Math.cos(latRad),
        Math.cos(randomDistance / R) - Math.sin(latRad) * Math.sin(newLonRad)
    );

    return {
        latitude: (newLatRad * 180) / Math.PI,
        longitude: (newLonRad * 180) / Math.PI
    };
}

// --- Render Glimmers Index Page (Public Listing) ---
module.exports.index = async (req, res) => {
    const Glimmer = mongoose.model('Glimmer');
    const User = mongoose.model('User'); 

    try {
        const glimmers = await Glimmer.find({})
                                      .populate('creator', 'username name avatarUrl overallRating')
                                      .sort({ createdAt: -1 });

        const glimmersForDisplay = glimmers.map(glimmer => {
            let displayLocation = { latitude: glimmer.geometry.coordinates[1], longitude: glimmer.geometry.coordinates[0] };
            if (req.user && glimmer.creator && !req.user._id.equals(glimmer.creator._id)) {
                displayLocation = getBlurredCoordinates(glimmer.geometry.coordinates[0], glimmer.geometry.coordinates[1]);
            }
            return { ...glimmer.toObject(), displayLatitude: displayLocation.latitude, displayLongitude: displayLocation.longitude };
        });
        res.render('glimmers/index', { title: 'All Glimmers', glimmers: glimmersForDisplay, user: req.user });
    } catch (err) {
        console.error("Error fetching glimmers for index page:", err);
        req.flash('error_msg', 'Could not load glimmers.');
        res.redirect('/hub');
    }
};

// --- Render Launch Glimmer Form Page ---
module.exports.renderNewForm = (req, res) => {
    res.render('grid/launch', { // Renders the grid/launch.ejs form
        title: 'Launch a New Glimmer',
        user: req.user // Pass user for navbar/layout
    });
};

// --- Create New Glimmer (POST handler) ---
// This function assumes 'uploadGlimmerImages' middleware has run BEFORE it in the route chain
module.exports.createGlimmer = async (req, res) => { 
    const Glimmer = mongoose.model('Glimmer');
    const User = mongoose.model('User'); 

    // Multer errors (like file type, file size) are now handled in the route middleware itself,
    // potentially setting req.fileValidationError.
    if (req.fileValidationError) {
        req.flash('error_msg', req.fileValidationError);
        return res.redirect('/grid/launch');
    }
    // Check if no files were uploaded, as images are required
    if (!req.files || req.files.length === 0) { 
        req.flash('error_msg', 'At least one glimmer image is required.');
        return res.redirect('/grid/launch');
    }


    const { title, description, locationName, latitude, longitude, eventDate, eventTime } = req.body.glimmer;
    const combinedDateTime = new Date(`${eventDate}T${eventTime}`);
    let errors = [];
    if (!title || !description || !locationName || !latitude || !longitude || !eventDate || !eventTime) { errors.push({ msg: 'All glimmer details are required.' }); }
    if (title && title.length < 3) { errors.push({ msg: 'Title must be at least 3 characters long.' }); }
    if (description && description.length < 10) { errors.push({ msg: 'Description must be at least 10 characters long.' }); }
    const start = new Date(combinedDateTime);
    const now = new Date();
    if (start < now) { errors.push({ msg: 'Start date and time cannot be in the past.' }); }

    if (errors.length > 0) {
        req.flash('error_msg', errors.map(e => e.msg).join(' '));
        return res.redirect('/grid/launch');
    }

    try {
        const newGlimmer = new Glimmer({
            title, description, locationName,
            geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
            startDate: combinedDateTime, creator: req.user._id, status: 'Open'
        });
        // Image data is now in req.files (from Multer middleware directly in route)
        newGlimmer.image = req.files.slice(0, 5).map(f => ({ url: f.path, filename: f.filename }));
        
        await newGlimmer.save();
        await User.findByIdAndUpdate(req.user._id, { $push: { hostedGlimmers: newGlimmer._id } });


        req.flash('success_msg', 'Glimmer successfully launched!');
        res.redirect(`/glimmers/${newGlimmer._id}`);
    } catch (dbErr) {
        console.error("Error creating glimmer:", dbErr);
        req.flash('error_msg', 'Failed to launch glimmer. Please try again.');
        res.redirect('/grid/launch');
    }
};

// --- Render Single Glimmer Page ---
module.exports.showGlimmer = async (req, res) => {
    const Glimmer = mongoose.model('Glimmer');
    const User = mongoose.model('User'); 
    const Review = mongoose.model('Review');
    const Request = mongoose.model('Request');

    try {
        const glimmer = await Glimmer.findById(req.params.id)
                                    .populate('creator', 'username name avatarUrl')
                                    .populate('participants', 'username name avatarUrl')
                                    .populate({ path: 'reviews', populate: { path: 'reviewer', select: 'username name avatarUrl' } });

        if (!glimmer) { req.flash('error_msg', 'Glimmer not found.'); return res.redirect('/glimmers'); }

        let displayLocation = { latitude: glimmer.geometry.coordinates[1], longitude: glimmer.geometry.coordinates[0] };
        let showActualLocation = false;
        let hasPendingRequest = false;

        if (req.user && glimmer.creator && req.user._id.equals(glimmer.creator._id)) {
            showActualLocation = true;
        } else if (req.user) {
            const existingRequest = await Request.findOne({ glimmer: glimmer._id, requester: req.user._id });
            if (existingRequest) {
                if (existingRequest.status === 'accepted') { showActualLocation = true; }
                else if (existingRequest.status === 'pending') { hasPendingRequest = true; }
            }
        }
        if (!showActualLocation) { displayLocation = getBlurredCoordinates(glimmer.geometry.coordinates[0], glimmer.geometry.coordinates[1]); }
        res.render('glimmers/show', {
            title: glimmer.title, glimmer: glimmer, user: req.user,
            displayLatitude: displayLocation.latitude, displayLongitude: displayLocation.longitude,
            showActualLocation: showActualLocation, hasPendingRequest: hasPendingRequest
        });
    } catch (err) {
        console.error("Error fetching single glimmer:", err);
        if (err.name === 'CastError') { req.flash('error_msg', 'Invalid Glimmer ID.'); return res.redirect('/glimmers'); }
        req.flash('error_msg', 'Could not load glimmer details.');
        res.redirect('/glimmers');
    }
};

// --- Render Edit Glimmer Form ---
module.exports.renderEditForm = async (req, res) => {
    const Glimmer = mongoose.model('Glimmer');
    const User = mongoose.model('User'); 

    try {
        const glimmer = await Glimmer.findById(req.params.id);
        if (!glimmer) { req.flash('error_msg', 'Glimmer not found.'); return res.redirect('/glimmers'); }
        if (!glimmer.creator.equals(req.user._id)) { req.flash('error_msg', 'You are not authorized to edit this glimmer.'); return res.redirect(`/glimmers/${glimmer._id}`); }
        res.render('glimmers/edit', { title: `Edit ${glimmer.title}`, glimmer: glimmer, user: req.user });
    } catch (err) {
        console.error("Error rendering edit form:", err);
        if (err.name === 'CastError') { req.flash('error_msg', 'Invalid Glimmer ID.'); return res.redirect('/glimmers'); }
        req.flash('error_msg', 'Could not load glimmer for editing.');
        res.redirect('/glimmers');
    }
};

// --- Update Glimmer (PUT handler) ---
// This function assumes 'uploadGlimmerImages' middleware has run BEFORE it in the route chain
module.exports.updateGlimmer = async (req, res) => {
    const Glimmer = mongoose.model('Glimmer');
    const User = mongoose.model('User'); 

    if (req.fileValidationError) {
        req.flash('error_msg', req.fileValidationError);
        return res.redirect(`/glimmers/${req.params.id}/edit`);
    }

    const { id } = req.params;
    const { title, description, locationName, latitude, longitude, eventDate, eventTime } = req.body.glimmer;
    let glimmer = await Glimmer.findById(id);
    if (!glimmer) { req.flash('error_msg', 'Glimmer not found.'); return res.redirect('/glimmers'); }
    if (!glimmer.creator.equals(req.user._id)) { req.flash('error_msg', 'You are not authorized to update this glimmer.'); return res.redirect(`/glimmers/${glimmer._id}`); }

    let errors = [];
    if (!title || !description || !locationName || !latitude || !longitude || !eventDate || !eventTime) { errors.push({ msg: 'All glimmer details are required.' }); }
    if (title && title.length < 3) { errors.push({ msg: 'Title must be at least 3 characters long.' }); }
    if (description && description.length < 10) { errors.push({ msg: 'Description must be at least 10 characters long.' }); }
    const newCombinedDateTime = new Date(`${eventDate}T${eventTime}`);
    const now = new Date();
    if (newCombinedDateTime < now && glimmer.startDate.getTime() !== newCombinedDateTime.getTime()) { errors.push({ msg: 'New start date and time cannot be in the past.' }); }

    if (errors.length > 0) {
        req.flash('error_msg', errors.map(e => e.msg).join(' '));
        return res.render('glimmers/edit', { title: `Edit ${glimmer.title}`, glimmer: { ...glimmer.toObject(), ...req.body.glimmer, startDate: newCombinedDateTime }, user: req.user, errors: errors });
    }

    try {
        glimmer.title = title; glimmer.description = description; glimmer.locationName = locationName;
        glimmer.geometry = { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] };
        glimmer.startDate = newCombinedDateTime;
        if (req.files && req.files.length > 0) { 
            glimmer.image = req.files.slice(0, 5).map(f => ({ url: f.path, filename: f.filename }));
        } else if (!glimmer.image || glimmer.image.length === 0) {
            glimmer.image = [{ url: '/images/default-glimmer.png', filename: 'default-glimmer.png' }];
        }
        await glimmer.save();
        req.flash('success_msg', 'Glimmer updated successfully!');
        res.redirect(`/glimmers/${glimmer._id}`);
    } catch (dbErr) {
        console.error("Error updating glimmer:", dbErr);
        req.flash('error_msg', 'Failed to update glimmer. Please try again.');
        res.redirect(`/glimmers/${id}/edit`);
    }
};

// --- Delete Glimmer (DELETE handler) ---
module.exports.deleteGlimmer = async (req, res) => {
    const Glimmer = mongoose.model('Glimmer');
    const User = mongoose.model('User'); 
    const Request = mongoose.model('Request');

    try {
        const { id } = req.params;
        const glimmer = await Glimmer.findById(id);

        if (!glimmer) { req.flash('error_msg', 'Glimmer not found.'); return res.redirect('/glimmers'); }
        if (!glimmer.creator.equals(req.user._id)) { req.flash('error_msg', 'You are not authorized to delete this glimmer.'); return res.redirect(`/glimmers/${glimmer._id}`); }

        await User.findByIdAndUpdate(req.user._id, { $pull: { hostedGlimmers: id } });
        await User.updateMany({ joinedGlimmers: id }, { $pull: { joinedGlimmers: id } });
        await Request.deleteMany({ glimmer: id });
        await Glimmer.findByIdAndDelete(id);

        req.flash('success_msg', 'Glimmer and all associated data successfully deleted!');
        res.redirect('/trail/sparks');
    } catch (err) {
        console.error("Error deleting glimmer:", err);
        if (err.name === 'CastError') { req.flash('error_msg', 'Invalid Glimmer ID.'); return res.redirect('/glimmers'); }
        req.flash('error_msg', 'Could not delete glimmer.');
        res.redirect('/glimmers');
    }
};