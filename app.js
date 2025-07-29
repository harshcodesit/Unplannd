// glimmergrid-mvp/app.js

require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');

// Database, Session, Passport, and Flash Imports
const connectDB = require('./config/db');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');

// --- MODEL IMPORTS (Explicitly require all models here) ---
require('./models/User');
require('./models/Glimmer');
require('./models/Review');
require('./models/Request');


// --- CONTROLLER IMPORTS (CRITICAL: Import all controllers explicitly here) ---
const authController = require('./controllers/authController');
const glimmerController = require('./controllers/glimmerController'); // NEW: Glimmer Controller
const gridController = require('./controllers/gridController');     // NEW: Grid Controller
const hubController = require('./controllers/hubController');
const requestController = require('./controllers/requestController'); // NEW: Request Controller
const trailController = require('./controllers/trailController');   // NEW: Trail Controller


// --- Route Imports (These are functions that accept controllers) ---
const authRoutes = require('./routes/authRoutes')(authController);
const hubRoutes = require('./routes/hubRoutes')(hubController);

// NEW: Import and pass controllers to the Glimmer-related routers
const glimmerRoutes = require('./routes/glimmerRoutes')(glimmerController);
const gridRoutes = require('./routes/gridRoutes')(gridController); // CRITICAL: Pass gridController
const trailRoutes = require('./routes/trailRoutes')(trailController);
const requestRoutes = require('./routes/requests')(requestController);


// --- DATABASE CONNECTION ---
connectDB();

// --- EJS MATE TEMPLATING ENGINE SETUP ---
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- CORE MIDDLEWARE (ORDER IS CRUCIAL) ---
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies (for form submissions)
app.use(express.json()); // Parses JSON bodies (if your frontend sends JSON)
app.use(methodOverride('_method')); // Allows PUT/DELETE requests from forms using ?_method=PUT/DELETE
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 24 }
    })
);
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport); // Passport config
app.use(flash()); // Connect flash
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});
app.use(express.static(path.join(__dirname, 'public')));


// --- ROUTES (Mounted after all core middleware) ---
app.use('/', authRoutes);
app.use('/hub', hubRoutes);
app.use('/', hubRoutes); // Also mount hubRoutes to the root path

// NEW: Mount Glimmer-related routes
app.use('/glimmers', glimmerRoutes); // Handles /glimmers, /glimmers/:id, /glimmers/:id/edit, /glimmers/:id/delete
app.use('/grid', gridRoutes); // Handles /grid/search, /grid/launch
app.use('/trail', trailRoutes); // Handles /trail/sparks, /trail/footprints
app.use('/glimmers/:glimmerId/requests', requestRoutes); // Mount Request routes (nested under glimmers)


// --- ERROR HANDLING (Order is important: Multer errors first, then general, then 404) ---
const { multerErrorHandler, generalErrorHandler } = require('./middleware/errorHandler');
app.use(multerErrorHandler); // Catch Multer-specific errors
app.use(generalErrorHandler); // Catch any other uncaught errors

// 404 Not Found Handler (MUST be last)
app.use((req, res, next) => {
    res.status(404).render('error/404', { title: 'Page Not Found' });
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});