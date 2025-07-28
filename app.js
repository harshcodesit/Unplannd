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
const hubController = require('./controllers/hubController');

// All other controllers (glimmer, grid, request, trail) are NOT imported here in Phase 0.
// They will be imported and their routers mounted in subsequent phases.
// const glimmerController = require('./controllers/glimmerController');
// const gridController = require('./controllers/gridController');
// const requestController = require('./controllers/requestController');
// const trailController = require('./controllers/trailController');


// --- Route Imports (Functions that accept controllers) ---
const authRoutes = require('./routes/authRoutes')(authController);
const hubRoutes = require('./routes/hubRoutes')(hubController);

// IMPORTANT: All other routes (glimmer, grid, request, trail) are NOT imported/mounted here in Phase 0.
// They will be imported and their routers mounted in subsequent phases.
// const glimmerRoutes = require('./routes/glimmerRoutes');
// const gridRoutes = require('./routes/gridRoutes');
// const trailRoutes = require('./routes/trailRoutes');
// const requestRoutes = require('./routes/requests');

// NEW: Import error handler middleware
const { multerErrorHandler, generalErrorHandler } = require('./middleware/errorHandler');


// --- DATABASE CONNECTION ---
connectDB();

// --- EJS MATE TEMPLATING ENGINE SETUP ---
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- CORE MIDDLEWARE (ORDER IS CRUCIAL) ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
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
require('./config/passport')(passport);
app.use(flash());
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


// --- ERROR HANDLING (Order is important: Multer errors first, then general, then 404) ---
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
