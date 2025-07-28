// glimmergrid-mvp/config/db.js
const mongoose = require('mongoose');

// --- EXPLICITLY REQUIRE ALL YOUR MONGOOSE MODELS HERE ---
// This ensures that all model schemas are registered with Mongoose
// before any other part of the application attempts to use them (e.g., via .populate() or mongoose.model()).
require('../models/User');
require('../models/Glimmer'); // Even if Glimmer is not fully implemented yet, its schema needs to be registered if User/Review/Request reference it.
require('../models/Review');   // Review model is needed for User profile data.
require('../models/Request');  // Request model is needed for User profile data.

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true // This option is deprecated in Mongoose 6+ and can be removed
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
