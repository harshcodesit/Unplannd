// glimmergrid-mvp/config/db.js
const mongoose = require('mongoose');

// Explicitly require your Mongoose models here
// This ensures they are loaded and their schemas are registered with Mongoose
// when the database connection is established.
require('../models/User');
require('../models/Glimmer');
require('../models/Review');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true // This option is deprecated in Mongoose 6+
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
