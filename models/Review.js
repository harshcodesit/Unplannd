// glimmergrid-mvp/models/Review.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// IMPORTANT: Do NOT directly require Glimmer or User here if they also require Review.
// Use mongoose.model() inside static methods/middleware to avoid circular dependencies.

const ReviewSchema = new Schema({
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1 star.'],
        max: [5, 'Rating cannot exceed 5 stars.'],
        required: [true, 'Rating is required.']
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters.']
    },
    glimmer: { // Reference to the Glimmer being reviewed
        type: Schema.Types.ObjectId,
        ref: 'Glimmer',
        required: true
    },
    reviewer: { // Reference to the User who posted the review
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Static method to calculate and update a user's overall rating
ReviewSchema.statics.updateUserOverallRating = async function(glimmerId) {
    // Get models here to avoid circular dependencies
    const Glimmer = mongoose.model('Glimmer');
    const User = mongoose.model('User');
    const Review = mongoose.model('Review'); // Reference to itself for aggregation

    // 1. Find the Glimmer to get its creator
    const glimmer = await Glimmer.findById(glimmerId).populate('creator');
    if (!glimmer || !glimmer.creator) {
        console.warn(`[Review Model Statics] Glimmer with ID ${glimmerId} not found or has no creator for rating update.`);
        return;
    }

    const userId = glimmer.creator._id;

    // 2. Aggregate all reviews for ALL glimmers created by this user
    // First, get all glimmer IDs created by this user
    const glimmersByUser = await Glimmer.find({ creator: userId }).distinct('_id');

    const stats = await Review.aggregate([
        {
            // Match reviews associated with any of the glimmers created by this user
            $match: { glimmer: { $in: glimmersByUser } }
        },
        {
            // Group all matched reviews to calculate the average rating and count
            $group: {
                _id: null, // Group all into a single document
                avgRating: { $avg: '$rating' },
                numReviews: { $sum: 1 }
            }
        }
    ]);

    // Extract average and count, default to 0 if no reviews found
    const averageRating = stats.length > 0 ? stats[0].avgRating : 0;
    const numberOfReviews = stats.length > 0 ? stats[0].numReviews : 0;

    // 3. Update the User's overallRating and numReviewsReceived
    await User.findByIdAndUpdate(userId, {
        overallRating: parseFloat(averageRating.toFixed(1)), // Round to one decimal place
        numReviewsReceived: numberOfReviews
    }, { new: true }); // new: true returns the updated document

    console.log(`[Review Model Statics] User ${userId} overall rating updated to: ${averageRating} (${numberOfReviews} reviews).`);
};

// Middleware to trigger rating update after saving a review
ReviewSchema.post('save', async function() {
    console.log(`[Review Model Middleware] Post-save hook triggered for review on glimmer: ${this.glimmer}`);
    await this.constructor.updateUserOverallRating(this.glimmer);
});

// Middleware to trigger rating update after updating a review
ReviewSchema.post('findOneAndUpdate', async function(doc) {
    if (doc) {
        console.log(`[Review Model Middleware] Post-findOneAndUpdate hook triggered for review on glimmer: ${doc.glimmer}`);
        await this.model.updateUserOverallRating(doc.glimmer);
    }
});

// Middleware to trigger rating update after deleting a review
ReviewSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        console.log(`[Review Model Middleware] Post-findOneAndDelete hook triggered for review on glimmer: ${doc.glimmer}`);
        await this.model.updateUserOverallRating(doc.glimmer);
    }
});

module.exports = mongoose.model('Review', ReviewSchema);
