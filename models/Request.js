// glimmergrid-mvp/models/Request.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
    glimmerId: {
        type: Schema.Types.ObjectId,
        ref: 'Glimmer', // Reference to the Glimmer being requested
        required: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User who sent the request
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'], // Possible statuses for a request
        default: 'pending',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Request', requestSchema);