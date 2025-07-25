// glimmergrid-mvp/app.js

require('dotenv').config(); // Load environment variables from .env file (MUST be at the very top)
const express = require('express');
const app = express();
const path = require('path'); // Core Node.js module for path manipulation

// Database, Session, Passport, and Flash Imports
const connectDB = require('./config/db');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');

// --- MODEL IMPORTS (NEW: Explicitly require all models here) ---
// This ensures their schemas are registered with Mongoose before any routes/controllers use them.
const User = require('./models/User');
const Glimmer = require('./models/Glimmer');
const Review = require('./models/Review');


// Route Imports (UPDATED to new nomenclature)
const authRoutes = require('./routes/authRoutes');
const hubRoutes = require('./routes/hubRoutes'); // Renamed from dashboardRoutes
const glimmerRoutes = require('./routes/glimmerRoutes'); // Existing
const gridRoutes = require('./routes/gridRoutes'); // New
const trailRoutes = require('./routes/trailRoutes'); // New

// --- DATABASE CONNECTION ---
connectDB(); // Call the database connection function

// --- EJS MATE TEMPLATING ENGINE SETUP ---
app.engine('ejs', ejsMate); // Use ejs-mate for .ejs files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set views directory using path.join for reliability

// --- MIDDLEWARE ---

// Express body parser (for handling form data from POST requests)
app.use(express.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded
app.use(express.json()); // Parses application/json

// Express session middleware (MUST be before Passport middleware)
app.use(
    session({
        secret: process.env.SESSION_SECRET, // Use the secret from your .env file
        resave: false, // Don't save session if unmodified
        saveUninitialized: false, // Don't create session until something stored
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 // Session lasts for 1 day (in milliseconds)
        }
    })
);

// Passport middleware (MUST be after session middleware)
app.use(passport.initialize());
app.use(passport.session());

// Passport Config (MUST be called after passport.initialize and passport.session are used)
require('./config/passport')(passport); // Pass the passport object to your config file

// Connect flash middleware (MUST be after session middleware)
app.use(flash());

// Global variables for flash messages and user (MUST be after flash and passport middleware)
// These make messages and user object available in ALL EJS templates
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // Passport's default failure message key
    res.locals.user = req.user || null; // Makes current logged-in user available as 'user' in EJS
    next();
});

// Set static folder (for CSS, JS, images, uploads)
// IMPORTANT: Make sure your 'public' folder exists at the root of your project
// Also, ensure 'public/uploads/avatars' directory exists for Multer.
app.use(express.static(path.join(__dirname, 'public')));

// --- ROUTES (UPDATED to new nomenclature) ---
// Mount your routers here.
app.use('/', authRoutes); // Handles /login, /register, /logout, /aura, /profile/edit, /profile/change-password
app.use('/hub', hubRoutes); // Handles /hub (your new homepage)
app.use('/', hubRoutes); // Also mount hubRoutes to the root path so / also goes to hub/index.ejs
app.use('/glimmers', glimmerRoutes); // Handles /glimmers and /glimmers/:id
app.use('/grid', gridRoutes); // Handles /grid/search, /grid/launch
app.use('/trail', trailRoutes); // Handles /trail/sparks, /trail/footprints

app.get("/test",(req,res)=>{
    res.render("aura/test")
})
// --- ERROR HANDLING (404 Not Found) ---
// This middleware runs if no routes above have handled the request.
app.use((req, res, next) => {
    res.status(404).render('error/404', { title: 'Page Not Found' }); // Assuming views/error/404.ejs
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});
