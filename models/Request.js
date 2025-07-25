// glimmergrid-mvp/models/Request.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RequestSchema = new Schema({
    glimmer: {
        type: Schema.Types.ObjectId,
        ref: 'Glimmer', // Reference to the Glimmer being requested to join
        required: true
    },
    requester: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User who sent the request
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'], // Possible statuses for a request
        default: 'pending' // Default status when a request is first created
    },
    requestedAt: {
        type: Date,
        default: Date.now // Timestamp when the request was made
    },
    // Optional: Add a message field for the requester to send a note to the host
    // message: {
    //     type: String,
    //     trim: true,
    //     maxlength: [200, 'Message cannot exceed 200 characters']
    // },
    // Optional: Add an acceptedAt/rejectedAt field for tracking
    // acceptedAt: Date,
    // rejectedAt: Date
});

// Add a compound unique index to prevent a user from sending multiple requests to the same glimmer
RequestSchema.index({ glimmer: 1, requester: 1 }, { unique: true });

module.exports = mongoose.model('Request', RequestSchema);
