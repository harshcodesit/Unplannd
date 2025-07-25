// glimmergrid-mvp/config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User'); // Import your User model

module.exports = function(passport) {
    // Tell Passport to use the LocalStrategy.
    // The `User.authenticate()` method is provided by passport-local-mongoose.
    // It handles the verification of username (email) and password.
    passport.use(new LocalStrategy({ usernameField: 'username' }, User.authenticate()));

    // Passport-local-mongoose adds serializeUser and deserializeUser static methods
    // to your User model, which handle how user information is stored in and retrieved from the session.
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
};