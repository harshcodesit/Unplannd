// glimmergrid-mvp/models/Review.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    glimmerRef: {
        type: Schema.Types.ObjectId,
        ref: 'Glimmer', // The Glimmer being reviewed
        required: true
    },
    userRef: {
        type: Schema.Types.ObjectId,
        ref: 'User', // The User who submitted the review
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1, // Minimum rating of 1 star
        max: 5 // Maximum rating of 5 stars
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 500 // Optional: limit comment length
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);