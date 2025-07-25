

require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path'); // IMPORTANT: Require path module here

// Database, Session, Passport, and Flash Imports
const connectDB = require('./config/db');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');

// Route Imports
const authRoutes = require('./routes/authRoutes'); // We'll mount this at root now
// const glimmerRoutes = require('./routes/glimmerRoutes');

// --- DATABASE CONNECTION ---
connectDB();

// --- EJS MATE TEMPLATING ENGINE SETUP ---
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
// ADJUST THIS LINE IF YOUR LAYOUT IS 'views/layouts/boilerplate.ejs'
// If your layout is 'views/layouts/boilerplate.ejs', you might need to adjust ejs-mate or ensure the path is correct.
// For now, assuming your main layout is still views/layout.ejs as previously discussed, or your EJS files specify 'layout'
// If you want to use 'layouts/boilerplate', you'd need a base EJS file at views/layouts/boilerplate.ejs
app.set('views', path.join(__dirname, 'views'));

// --- MIDDLEWARE ---

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Express session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24
        }
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport Config
require('./config/passport')(passport);

// Connect flash middleware
app.use(flash());

// Global variables for flash messages and user
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Set static folder (for CSS, JS, images, uploads)
// IMPORTANT: Make sure your 'public' folder exists at the root of your project
// Also, ensure 'public/uploads/avatars' exists for Multer!
app.use(express.static(path.join(__dirname, 'public')));


// --- ROUTES ---
// Mount your routers here. authRoutes now uses direct paths like /login, /register
app.use('/', authRoutes); // Mount authRoutes directly to the root path
// app.use('/glimmers', glimmerRoutes); // Uncomment when you create glimmerRoutes

// Basic Home Route (accessible whether logged in or out)
app.get('/', (req, res) => {
    res.render('hub/index', { title: 'Welcome to Unplann\'d' });
});
app.get('/test', (req, res) => {
    res.render('aura/aura', { title: 'Welcome to Unplann\'d' });
});

// Protected Dashboard Route (requires login)
const { ensureAuthenticated } = require('./middleware/authMiddleware');
app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('hub/index', {
        user: req.user,
        title: 'Dashboard'
    });
});

// --- ERROR HANDLING (404 Not Found) ---
app.use((req, res, next) => {
    res.status(404).render('error/404', { title: 'Page Not Found' });
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});