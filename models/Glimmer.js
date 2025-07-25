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
    image: { // This could be a URL for a placeholder or uploaded image
        type: String,
        default: '/images/default-glimmer.png' // A default image path
    },
    location: {
        type: String,
        trim: true
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
