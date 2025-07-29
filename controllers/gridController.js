// glimmergrid-mvp/controllers/gridController.js
const mongoose = require('mongoose'); // Import mongoose for dynamic model access

// Render the Search Glimmer page (now displays all glimmers by default)
exports.renderSearchGlimmerPage = async (req, res) => {
    const Glimmer = mongoose.model('Glimmer'); // Get Glimmer model dynamically
    const User = mongoose.model('User');     // Get User model dynamically

    try {
        // Fetch all glimmers, populate creator info, and sort by creation date (newest first)
        const glimmers = await Glimmer.find({})
                                      .populate('creator', 'username name avatarUrl overallRating')
                                      .sort({ createdAt: -1 });

        // Process glimmers to apply geo-blurring for non-hosts (reusing logic from glimmerController.index)
        const glimmersForDisplay = glimmers.map(glimmer => {
            let displayLocation = { latitude: glimmer.geometry.coordinates[1], longitude: glimmer.geometry.coordinates[0] };
            // Apply geo-blur if user is NOT the creator of the glimmer
            if (req.user && glimmer.creator && !req.user._id.equals(glimmer.creator._id)) {
                // This helper function is defined in glimmerController, but we can inline its logic here
                // or move it to a shared 'utils' file if it becomes more complex and reused.
                // For now, let's inline a simplified version or assume it's available.
                // For accuracy, I'll include the helper here.
                function getBlurredCoordinates(longitude, latitude, radiusKm = 1) {
                    const R = 6371; // Earth's radius in kilometers
                    const latRad = (latitude * Math.PI) / 180;
                    const lonRad = (longitude * Math.PI) / 180;
                    const randomAngle = Math.random() * 2 * Math.PI;
                    const randomDistance = Math.random() * radiusKm;
                    const newLatRad = Math.asin(Math.sin(latRad) * Math.cos(randomDistance / R) + Math.cos(latRad) * Math.sin(randomDistance / R) * Math.cos(randomAngle));
                    const newLonRad = lonRad + Math.atan2(Math.sin(randomAngle) * Math.sin(randomDistance / R) * Math.cos(latRad), Math.cos(randomDistance / R) - Math.sin(latRad) * Math.sin(newLonRad));
                    return { latitude: (newLatRad * 180) / Math.PI, longitude: (newLonRad * 180) / Math.PI };
                }
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