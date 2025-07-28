// glimmergrid-mvp/models/Review.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Models are required dynamically via mongoose.model() where needed.

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
    glimmer: {
        type: Schema.Types.ObjectId,
        ref: 'Glimmer',
        required: true
    },
    reviewer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Static method to calculate and update a user's overall rating
ReviewSchema.statics.updateUserOverallRating = async function(glimmerId) {
    const Glimmer = mongoose.model('Glimmer');
    const User = mongoose.model('User');
    const Review = mongoose.model('Review');

    const glimmer = await Glimmer.findById(glimmerId).populate('creator');
    if (!glimmer || !glimmer.creator) {
        console.warn(`[Review Model Statics] Glimmer with ID ${glimmerId} not found or has no creator for rating update.`);
        return;
    }

    const userId = glimmer.creator._id;
    const glimmersByUser = await Glimmer.find({ creator: userId }).distinct('_id');

    const stats = await Review.aggregate([
        { $match: { glimmer: { $in: glimmersByUser } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
    ]);

    const averageRating = stats.length > 0 ? stats[0].avgRating : 0;
    const numberOfReviews = stats.length > 0 ? stats[0].numReviews : 0;

    await User.findByIdAndUpdate(userId, {
        overallRating: parseFloat(averageRating.toFixed(1)),
        numReviewsReceived: numberOfReviews
    }, { new: true });

    console.log(`[Review Model Statics] User ${userId} overall rating updated to: ${averageRating} (${numberOfReviews} reviews).`);
};

ReviewSchema.post('save', async function() {
    await this.constructor.updateUserOverallRating(this.glimmer);
});

ReviewSchema.post('findOneAndUpdate', async function(doc) {
    if (doc) { await this.model.updateUserOverallRating(doc.glimmer); }
});

ReviewSchema.post('findOneAndDelete', async function(doc) {
    if (doc) { await this.model.updateUserOverallRating(doc.glimmer); }
});

module.exports = mongoose.model('Review', ReviewSchema);
