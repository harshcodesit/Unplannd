// glimmergrid-mvp/config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User'); // Ensure this path is correct, User model defines passport-local-mongoose methods

module.exports = function(passport) {
    // We are telling passport-local to use the 'username' field from our form
    // as the field to look up the user.
    passport.use(new LocalStrategy({ usernameField: 'username' }, User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
};
