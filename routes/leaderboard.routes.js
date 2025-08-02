const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/leaderboard.model');
const UserModel = require('../models/user.models');

router.get('/board', async (req, res) => {
  try {
    // Fetch leaderboard sorted by aura
    const leaderboard = await Leaderboard.find().sort({ aura: -1 });

    // Fetch only usernames from UserModel
    const users = await UserModel.find({}, { username: 1 });

    // Create a Set for quick username lookup
    const validUsernames = new Set(users.map(user => user.username));

    const ranked = [];

    for (let i = 0; i < leaderboard.length; i++) {
      const entry = leaderboard[i];

      if (validUsernames.has(entry.username)) {
        ranked.push({
          username: entry.username,
          rank: i + 1,
          aura: entry.aura
        });
      } else {
        // Delete invalid leaderboard entry (async/await works properly here)
        await Leaderboard.deleteOne({ username: entry.username });
      }
    }

    res.status(200).json(ranked);
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
