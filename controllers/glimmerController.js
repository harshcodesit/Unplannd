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















































// // glimmergrid-mvp/controllers/glimmerController.js
// const Glimmer = require('../models/Glimmer');
// const User = require('../models/User'); // Required for populating creator/participants
// const Review = require('../models/Review'); // Required for populating reviews
// const Request = require('../models/Request'); // Import the Request model
// const upload = require('../config/multerConfig'); // Import multer configuration for image uploads

// // Helper function to generate blurred coordinates (server-side)
// // This ensures the actual location never leaves the server unless explicitly allowed.
// function getBlurredCoordinates(longitude, latitude, radiusKm = 1) {
//     const R = 6371; // Earth's radius in kilometers
//     const latRad = (latitude * Math.PI) / 180;
//     const lonRad = (longitude * Math.PI) / 180;

//     // Generate random angle and distance within radius
//     const randomAngle = Math.random() * 2 * Math.PI;
//     const randomDistance = Math.random() * radiusKm; // Random distance up to radiusKm

//     // Calculate new latitude
//     const newLatRad = Math.asin(
//         Math.sin(latRad) * Math.cos(randomDistance / R) +
//         Math.cos(latRad) * Math.sin(randomDistance / R) * Math.cos(randomAngle)
//     );

//     // Calculate new longitude
//     const newLonRad = lonRad + Math.atan2(
//         Math.sin(randomAngle) * Math.sin(randomDistance / R) * Math.cos(latRad),
//         Math.cos(randomDistance / R) - Math.sin(latRad) * Math.sin(newLatRad)
//     );

//     return {
//         latitude: (newLatRad * 180) / Math.PI,
//         longitude: (newLonRad * 180) / Math.PI
//     };
// }

// // --- Render Glimmers Index Page ---
// module.exports.index = async (req, res) => {
//     try {
//         const glimmers = await Glimmer.find({})
//                                     .populate('creator', 'username name avatarUrl') // Populate creator's basic info
//                                     .sort({ createdAt: -1 }); // Show newest first

//         // Process glimmers to apply geo-blurring for non-hosts
//         const glimmersForDisplay = glimmers.map(glimmer => {
//             let displayLocation = {
//                 latitude: glimmer.geometry.coordinates[1], // [lon, lat] from DB
//                 longitude: glimmer.geometry.coordinates[0]
//             };

//             // Apply geo-blur if user is NOT the creator of the glimmer
//             // req.user will be defined if a user is logged in
//             // glimmer.creator is populated, so glimmer.creator._id is available
//             if (req.user && glimmer.creator && !req.user._id.equals(glimmer.creator._id)) {
//                 displayLocation = getBlurredCoordinates(
//                     glimmer.geometry.coordinates[0], // Pass actual longitude
//                     glimmer.geometry.coordinates[1]  // Pass actual latitude
//                 );
//             }
            
//             return {
//                 ...glimmer.toObject(), // Convert Mongoose document to plain object
//                 displayLatitude: displayLocation.latitude,
//                 displayLongitude: displayLocation.longitude
//             };
//         });

//         res.render('glimmers/index', {
//             title: 'All Glimmers',
//             glimmers: glimmersForDisplay, // Pass the processed glimmers
//             user: req.user // Pass user object for conditional display in navbar/layouts
//         });
//     } catch (err) {
//         console.error("Error fetching glimmers:", err);
//         req.flash('error_msg', 'Could not load glimmers.');
//         res.redirect('/hub'); // Redirect to new homepage (HUB)
//     }
// };

// module.exports.renderNewForm = (req, res) => {
//     res.render('glimmers/launch'); // Renders the launch.ejs form
// };

// module.exports.createGlimmer = async (req, res, next) => {
//     // Use multer upload middleware for the image
//     upload(req, res, async (err) => {
//         if (err) {
//             console.error("Multer Upload Error for Glimmer:", err);
//             req.flash('error_msg', err.message || 'Error uploading glimmer image.');
//             return res.redirect('/grid/launch'); // Redirect back to launch page on error
//         }

//         // Extract data from the form.
//         // req.body.event will contain title, description, locationName, latitude, longitude, eventDate, eventTime
//         // req.files will contain image data if using Multer for file uploads
//         const { title, description, locationName, latitude, longitude, eventDate, eventTime } = req.body.event;

//         // Combine date and time into a single Date object for startDate
//         const combinedDateTime = new Date(`${eventDate}T${eventTime}`);

//         let errors = [];

//         // Basic validation (can be expanded)
//         if (!title || !description || !locationName || !latitude || !longitude || !eventDate || !eventTime) {
//             errors.push({ msg: 'All glimmer details (Title, Description, Location Name, Date, Time, and Coordinates) are required.' });
//         }
//         if (title && title.length < 3) {
//             errors.push({ msg: 'Title must be at least 3 characters long.' });
//         }
//         if (description && description.length < 10) {
//             errors.push({ msg: 'Description must be at least 10 characters long.' });
//         }

//         // Date validation
//         const start = new Date(combinedDateTime); // Use the combined date/time
//         const now = new Date();
        
//         if (start < now) {
//             errors.push({ msg: 'Start date and time cannot be in the past.' });
//         }
//         // Add endDate validation if you implement it in the form
//         // const end = endDate ? new Date(endDate) : null;
//         // if (end && end < start) {
//         //     errors.push({ msg: 'End date cannot be before start date.' });
//         // }

//         if (errors.length > 0) {
//             req.flash('error_msg', errors.map(e => e.msg).join(' '));
//             // You might want to pass old input back to the form here too
//             return res.redirect('/grid/launch');
//         }

//         try {
//             // Create a new Glimmer instance
//             const newGlimmer = new Glimmer({
//                 title,
//                 description,
//                 locationName,
//                 // Construct the GeoJSON Point object for the geometry field
//                 geometry: {
//                     type: 'Point',
//                     // MongoDB GeoJSON expects coordinates as [longitude, latitude]
//                     coordinates: [parseFloat(longitude), parseFloat(latitude)]
//                 },
//                 startDate: combinedDateTime,
//                 // endDate: end, // Use the parsed Date object if applicable
//                 creator: req.user._id, // Assign the logged-in user as creator
//                 status: 'Open' // Default status
//             });

//             // Handle image uploads if files are present
//             if (req.files && req.files.length > 0) {
//                 // Ensure max 5 images are handled server-side as well
//                 newGlimmer.image = req.files.slice(0, 5).map(f => ({ url: f.path, filename: f.filename }));
//             } else {
//                 // Set a default image if no files are uploaded
//                 newGlimmer.image = [{ url: '/images/default-glimmer.png', filename: 'default-glimmer.png' }];
//             }

//             // Save the new glimmer
//             await newGlimmer.save();

//             // Add the new glimmer to the creator's hostedGlimmers array
//             req.user.hostedGlimmers.push(newGlimmer._id);
//             await req.user.save();

//             req.flash('success_msg', 'Glimmer successfully launched!');
//             res.redirect(`/glimmers/${newGlimmer._id}`); // Redirect to the new glimmer's show page
//         } catch (dbErr) {
//             console.error("Error creating glimmer:", dbErr);
//             req.flash('error_msg', 'Failed to launch glimmer. Please try again.');
//             res.redirect('/grid/launch');
//         }
//     });
// };

// // --- Render Single Glimmer Page ---
// module.exports.showGlimmer = async (req, res) => {
//     try {
//         const glimmer = await Glimmer.findById(req.params.id)
//                                     .populate('creator', 'username name avatarUrl') // Populate creator details
//                                     .populate('participants', 'username name avatarUrl') // Populate participants details
//                                     .populate({ // Populate reviews for this glimmer, and the reviewer's basic info
//                                         path: 'reviews',
//                                         populate: {
//                                             path: 'reviewer',
//                                             select: 'username name avatarUrl'
//                                         }
//                                     });

//         if (!glimmer) {
//             req.flash('error_msg', 'Glimmer not found.');
//             return res.redirect('/glimmers');
//         }

//         let displayLocation = {
//             latitude: glimmer.geometry.coordinates[1], // [lon, lat] from DB
//             longitude: glimmer.geometry.coordinates[0]
//         };
//         let showActualLocation = false; // Flag to control what's shown on frontend
//         let hasPendingRequest = false; // NEW FLAG: To indicate if a pending request exists

//         // Determine if the actual location should be shown:
//         // 1. If the current logged-in user is the creator of the glimmer
//         if (req.user && glimmer.creator && req.user._id.equals(glimmer.creator._id)) {
//             showActualLocation = true;
//         }
//         // 2. If the current logged-in user is an "accepted join requester"
//         else if (req.user) { // Only check for accepted/pending requests if a user is logged in and not the creator
//             const existingRequest = await Request.findOne({ 
//                 glimmer: glimmer._id, 
//                 requester: req.user._id 
//             });

//             if (existingRequest) {
//                 if (existingRequest.status === 'accepted') {
//                     showActualLocation = true;
//                 } else if (existingRequest.status === 'pending') {
//                     hasPendingRequest = true; // Set flag for pending request
//                 }
//                 // If status is 'rejected', neither showActualLocation nor hasPendingRequest will be true,
//                 // so the 'REQUEST TO JOIN' button will reappear.
//             }
//         }

//         // If actual location should NOT be shown, apply geo-blurring
//         if (!showActualLocation) {
//             displayLocation = getBlurredCoordinates(
//                 glimmer.geometry.coordinates[0], // Pass actual longitude
//                 glimmer.geometry.coordinates[1]  // Pass actual latitude
//             );
//         }

//         res.render('glimmers/show', {
//             title: glimmer.title,
//             glimmer: glimmer,
//             user: req.user, // Pass user object
//             displayLatitude: displayLocation.latitude, // Pass coordinates to EJS
//             displayLongitude: displayLocation.longitude,
//             showActualLocation: showActualLocation, // Pass flag to EJS for conditional rendering
//             hasPendingRequest: hasPendingRequest // NEW: Pass this flag to EJS
//         });
//     } catch (err) {
//         console.error("Error fetching single glimmer:", err);
//         // Check for CastError (invalid ID format)
//         if (err.name === 'CastError') {
//             req.flash('error_msg', 'Invalid Glimmer ID.');
//             return res.redirect('/glimmers');
//         }
//         req.flash('error_msg', 'Could not load glimmer details.');
//         res.redirect('/glimmers');
//     }
// };

// // Add other controller functions (update, delete, etc.) as needed
// // module.exports.updateGlimmer = async (req, res) => { ... };
// // module.exports.deleteGlimmer = async (req, res) => { ... };
