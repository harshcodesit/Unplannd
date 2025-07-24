// glimmergrid-mvp/models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    // Adding a separate username field
    username: {
        type: String,
        required: true,
        unique: true, // Ensure username is unique
        trim: true,
        lowercase: true, // Store usernames in lowercase
        match: [/^[a-zA-Z0-9_]{3,20}$/, 'Username can only contain letters, numbers, and underscores, and be 3-20 characters long.']
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures email is unique
        trim: true,
        lowercase: true, // Store emails in lowercase
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'] // Basic email regex validation
    },
    avatarUrl: { // Field for the URL of the user's profile picture
        type: String,
        default: '/images/default-avatar.png' // Default avatar if none uploaded
    },
    hostedGlimmers: [{
        type: Schema.Types.ObjectId,
        ref: 'Glimmer'
    }],
    joinedGlimmers: [{
        type: Schema.Types.ObjectId,
        ref: 'Glimmer'
    }]
}, {
    timestamps: true
});

// Apply the passport-local-mongoose plugin to the schema.
// We keep 'email' as the usernameField for authentication by email.
// If you wanted to authenticate by username, you would change this to 'username'.
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('User', userSchema);