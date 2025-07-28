// glimmergrid-mvp/models/Request.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RequestSchema = new Schema({
    glimmer: {
        type: Schema.Types.ObjectId,
        ref: 'Glimmer',
        required: true
    },
    requester: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    }
});

RequestSchema.index({ glimmer: 1, requester: 1 }, { unique: true });

module.exports = mongoose.model('Request', RequestSchema);
