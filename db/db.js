const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

function connectToDb() {
    const uri = process.env.MONGO_URI;
console.log("MONGO_URI:", process.env.MONGO_URI);

    if (!uri) {
        console.error("❌ MONGO_URI not found in .env file.");
        process.exit(1); // Stop the app
    }

    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("✅ MongoDB connected successfully");
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1); // Stop the app on failure
    });
}

module.exports = connectToDb;
