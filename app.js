const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const userRoutes = require('./routes/user.routes');
const connectToDb = require('./db/db');
connectToDb();
const quizRoutes = require('./routes/quize.routes');
const adminRoutes = require('./routes/admin.routes');
const leaderboardRoutes=require('./routes/leaderboard.routes');

const cors = require('cors');
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174','https://testaura-client.vercel.app'],  // Vite/React frontend URL
    credentials: true                 // allow cookies to be sent/received
}));

app.use(express.json());

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Routes
app.use('/users', userRoutes);

// Test routes
app.get("/", (req, res) => {
    res.send("Hello ray");
});

app.use('/quizes', quizRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/admin', adminRoutes)



module.exports = app;
