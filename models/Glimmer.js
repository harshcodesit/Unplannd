// glimmergrid-mvp/models/Glimmer.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// IMPORTANT: Do NOT directly require User or Review here if they also require Glimmer.
// Use mongoose.model() inside middleware to avoid circular dependencies.

const GlimmerSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Glimmer title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long']
    },
    description: {
        type: String,
        required: [true, 'Glimmer description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters long']
    },
    // Updated to support multiple images with Cloudinary-like structure
    image: [
        {
            url: String,
            filename: String
        }
    ],
    // New fields for location mechanism
    locationName: { // Human-readable name for the location (e.g., "Central Park Amphitheater")
        type: String,
        required: [true, 'Location name is required'],
        trim: true
    },
    geometry: { // GeoJSON Point for actual precise coordinates [longitude, latitude]
        type: {
            type: String,
            enum: ['Point'], // 'geometry.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number], // Stored as [longitude, latitude] for MongoDB GeoJSON
            required: true
        }
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        // Optional: Add validation to ensure endDate is after startDate
    },
    creator: { // Reference to the User who created this Glimmer
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [ // Array of Users participating in this Glimmer
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    status: {
        type: String,
        enum: ['Open', 'Full', 'Completed', 'Cancelled'], // Define possible statuses
        default: 'Open'
    },
    reviews: [ // Reviews posted about this Glimmer
        {
            type: Schema.Types.ObjectId,
            ref: 'Review' // Reference the Review model
        }
    ]
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Create a 2dsphere index for the geometry field.
// This index is crucial for performing efficient geospatial queries (e.g., $near, $geoWithin).
GlimmerSchema.index({ geometry: '2dsphere' });

// Middleware to delete associated reviews when a Glimmer is deleted
GlimmerSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        console.log(`[Glimmer Model Middleware] Deleting reviews for glimmer: ${doc._id}`);
        // Use mongoose.model() to get Review model to avoid circular dependency
        const Review = mongoose.model('Review');
        await Review.deleteMany({
            _id: {
                $in: doc.reviews // Delete reviews whose IDs are in the glimmer's reviews array
            }
        });

        // OPTIONAL: Future enhancement to update overallRating of users
        // whose reviews were just deleted. This is handled by Review's post-delete hook already.
    }
});

module.exports = mongoose.model('Glimmer', GlimmerSchema);
