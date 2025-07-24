// glimmergrid-mvp/models/Glimmer.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const glimmerSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    datetime: {
        type: Date, // Use Date type for date and time
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Music Jam', 'Pop-up Meetup', 'Idea Circle', 'Workshop', 'Sporting Event', 'Art Session', 'Other'], // Define allowed categories
        trim: true
    },
    tags: [String], // Array of strings for tags
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User who created this glimmer
        required: true
    },
    location: {
        type: {
            type: String, // GeoJSON Type - 'Point'
            enum: ['Point'],
            default: 'Point',
            required: true
        },
        coordinates: { // GeoJSON coordinates [longitude, latitude]
            type: [Number],
            required: true,
            index: '2dsphere' // Essential for geospatial queries
        }
    },
    imageUrl: { // URL for the glimmer's cover image
        type: String,
        default: '/images/default-glimmer.png' // Default image if none uploaded
    },
    joinedUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User' // Users who have been accepted to join this glimmer
    }]
}, {
    timestamps: true
});

// Create a 2dsphere index for the location.coordinates field.
// This is crucial for efficient geospatial queries like $geoNear.
glimmerSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Glimmer', glimmerSchema);