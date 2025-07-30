// glimmergrid-mvp/controllers/gridController.js
const mongoose = require('mongoose'); // Import mongoose for dynamic model access

// Helper function to generate blurred coordinates (server-side)
// This function is inlined here for self-containment, but could be in a shared utils file.
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

    // CRITICAL FIX: Changed 'newLonRad' to 'newLatRad' in the last argument of Math.atan2
    const newLonRad = lonRad + Math.atan2(
        Math.sin(randomAngle) * Math.sin(randomDistance / R) * Math.cos(latRad),
        Math.cos(randomDistance / R) - Math.sin(latRad) * Math.sin(newLatRad) // This was the problematic line
    );

    return {
        latitude: (newLatRad * 180) / Math.PI,
        longitude: (newLonRad * 180) / Math.PI
    };
}

// Render the Search Glimmer page (now displays all glimmers by default)
exports.renderSearchGlimmerPage = async (req, res) => {
    const Glimmer = mongoose.model('Glimmer'); // Get Glimmer model dynamically
    const User = mongoose.model('User');     // Get User model dynamically

    try {
        // Fetch all glimmers, populate creator info, and sort by creation date (newest first)
        // FIX: Added .populate('image') to ensure image data is fetched
        const glimmers = await Glimmer.find({})
                                      .populate('creator', 'username name avatarUrl overallRating')
                                      .populate('image') // CRITICAL FIX: Populate the image field
                                      .sort({ createdAt: -1 });

        // Process glimmers to apply geo-blurring for non-hosts
        const glimmersForDisplay = glimmers.map(glimmer => {
            let displayLocation = { latitude: glimmer.geometry.coordinates[1], longitude: glimmer.geometry.coordinates[0] };
            // Apply geo-blur if user is NOT the creator of the glimmer
            if (req.user && glimmer.creator && !req.user._id.equals(glimmer.creator._id)) {
                displayLocation = getBlurredCoordinates(glimmer.geometry.coordinates[0], glimmer.geometry.coordinates[1]);
            }
            return { ...glimmer.toObject(), displayLatitude: displayLocation.latitude, displayLongitude: displayLocation.longitude };
        });

        // Render the grid/search.ejs template, passing the glimmers data
        res.render('grid/search', {
            title: 'All Glimmers', // Updated title for this page
            glimmers: glimmersForDisplay, // Pass the processed glimmers
            user: req.user // Pass user for conditional display in navbar/layouts
        });
    } catch (err) {
        console.error("Error fetching glimmers for search page:", err);
        req.flash('error_msg', 'Could not load glimmers.');
        res.redirect('/hub'); // Redirect to homepage on error
    }
};

// Render the Host Glimmer (Launch) page
// This will be a protected route, only for logged-in users
exports.renderLaunchGlimmerPage = (req, res) => {
    res.render('grid/launch', { // Renders the glimmers/launch.ejs form
        title: 'Host a Glimmer',
        user: req.user // Pass user for conditional display
    });
};
