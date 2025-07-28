// glimmergrid-mvp/models/Glimmer.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Models are required dynamically via mongoose.model() where needed.

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
    image: [
        {
            url: String,
            filename: String
        }
    ],
    locationName: {
        type: String,
        trim: true
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    status: {
        type: String,
        enum: ['Open', 'Full', 'Completed', 'Cancelled'],
        default: 'Open'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, {
    timestamps: true
});

GlimmerSchema.index({ geometry: '2dsphere' });

GlimmerSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        console.log(`[Glimmer Model Middleware] Deleting reviews for glimmer: ${doc._id}`);
        const Review = mongoose.model('Review'); 
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
});

module.exports = mongoose.model('Glimmer', GlimmerSchema);
