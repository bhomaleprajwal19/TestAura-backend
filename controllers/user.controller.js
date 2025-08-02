const { validationResult } = require('express-validator');
const UserModel = require('../models/user.models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Leaderboard = require('../models/leaderboard.model');
const Engagement = require('../models/engagement.model');

// ==========================
// REGISTER CONTROLLER
// ==========================
module.exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, mobile, username } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      mobile,
      username
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '12h'
    });

    // Set cookie
    res.status(201).json({ token, user: newUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==========================
// LOGIN CONTROLLER
// ==========================
module.exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '12h'
    });

    res.cookie('token', token);
    res.status(200).json({ token, user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports.updateScore = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, score, subject, quizId } = req.body;

  try {
    const newScore = parseInt(score);
    const user = await UserModel.findById(userId);


    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingQuiz = user.quizHistory.find(
      (entry) => entry.quizId.toString() === quizId
    );

    const current = user.scores.get(subject);

    if (!existingQuiz) {
      // 🟢 First attempt — add to quiz history
      user.quizHistory.push({ quizId, subject, score: newScore });
      Engagement.create({
        userId: user._id, 
        quizId,
        subject,
        score: newScore
      });



      // 🟢 Update subject score summary
      if (!current) {
        user.scores.set(subject, { totalQuizzes: 1, totalScore: newScore });
      } else {
        user.scores.set(subject, {
          totalQuizzes: current.totalQuizzes + 1,
          totalScore: current.totalScore + newScore
        });
      }
    } else {
      // 🟡 Re-attempt — update only the score difference
      const previousScore = existingQuiz.score;
      existingQuiz.score = newScore;

      if (!current) {
        // Subject missing, create it from current attempt
        user.scores.set(subject, { totalQuizzes: 1, totalScore: newScore });
      } else {
        const updatedScore = current.totalScore + (newScore - previousScore);
        user.scores.set(subject, {
          totalQuizzes: current.totalQuizzes, // no new quiz added
          totalScore: updatedScore
        });
      }
    }

    await user.save();

    return res.status(200).json({ message: 'Score updated successfully', user });
  } catch (error) {
    console.error('Error updating score:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};



module.exports.getAura = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const scoresMap = user.scores;
    let sumOfAverages = 0;

    for (const [subject, score] of scoresMap.entries()) {
      const { totalQuizzes, totalScore } = score;
      const avg = totalQuizzes > 0 ? totalScore / totalQuizzes : 0;
      sumOfAverages += avg;
    }

   const aura = Math.ceil(100 + sumOfAverages * 10);


    // Update user's aura
    user.aura = aura;
    await user.save();

    // Ensure required values for leaderboard update
    const username = user.username; // assuming user has a username field
    const name = user.name;

    // Update leaderboard
    await Leaderboard.findOneAndUpdate(
      { username },
      { $set: { name, aura } },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Aura calculated and leaderboard updated', aura });

  } catch (err) {
    console.error('Error in getAura:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select('-password'); // Exclude password field
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await UserModel.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
