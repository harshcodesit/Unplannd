// glimmergrid-mvp/models/User.js
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

// IMPORTANT: Do NOT directly require Glimmer or Review here if they also require User.
// Use mongoose.model() inside middleware to avoid circular dependencies.

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: { // Username field (used for login)
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9_]{3,20}$/, 'Username can only contain letters, numbers, and underscores, and be 3-20 characters long.']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    avatarUrl: {
        type: String,
        default: '/images/default-avatar.png' // Default avatar path
    },
    hostedGlimmers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Glimmer' // Reference the Glimmer model
        }
    ],
    joinedGlimmers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Glimmer' // Reference the Glimmer model
        }
    ],
    postedReviews: [ // Reviews this user has written for others' glimmers
        {
            type: Schema.Types.ObjectId,
            ref: 'Review' // Reference the Review model
        }
    ],
    overallRating: { // Average rating this user has RECEIVED for their hosted Glimmers
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviewsReceived: { // Count of reviews received to aid in average calculation
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Configure passport-local-mongoose to use 'username' for authentication
UserSchema.plugin(passportLocalMongoose, { usernameField: 'username' });

// Middleware to delete associated reviews when a User is deleted
UserSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        console.log(`[User Model Middleware] Deleting reviews posted by user: ${doc._id}`);
        // Use mongoose.model() to get Review model to avoid circular dependency
        const Review = mongoose.model('Review');
        await Review.deleteMany({
            reviewer: doc._id
        });

        // OPTIONAL: Future enhancement to clean up hostedGlimmers and joinedGlimmers
        // Deleting a user could also trigger deletion of their hosted glimmers
        // or removal of their participation from joined glimmers.
        // This makes the deletion more complex. For now, we'll only delete their posted reviews.
    }
});

module.exports = mongoose.model('User', UserSchema);
