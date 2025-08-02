const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
        username: {type:String, required: true, unique: true},
        name: String,
        aura: Number,
    });
    
    const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
    
    module.exports = Leaderboard;