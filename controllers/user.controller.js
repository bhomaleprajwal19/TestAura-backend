const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.models');
const Leaderboard = require('../models/leaderboard.model');
const BlacklistedToken = require('../models/blacklistedtoken.model');
const Engagement = require('../models/engagement.model');

// ==========================
// REGISTER
// ==========================
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, mobile, username } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ name, email, password: hashedPassword, mobile, username });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '12h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in prod, false in dev
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });


    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==========================
// LOGIN
// ==========================
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in prod, false in dev
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });


    res.status(200).json({ user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==========================
// GET CURRENT USER (AUTH CHECK)
// ==========================
exports.getCurrentUser = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ==========================
// LOGOUT — FIXED
// ==========================
exports.logout = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    await BlacklistedToken.create({ token });
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: 'Logout failed' });
  }
};


// ==========================
// UPDATE SCORE
// ==========================
exports.updateScore = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { userId, score, subject, quizId } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newScore = parseInt(score);
    const existingQuiz = user.quizHistory.find((entry) => entry.quizId.toString() === quizId);
    const current = user.scores.get(subject);

    if (!existingQuiz) {
      user.quizHistory.push({ quizId, subject, score: newScore });
      await Engagement.create({ userId: user._id, quizId, subject, score: newScore });

      user.scores.set(subject, {
        totalQuizzes: (current?.totalQuizzes || 0) + 1,
        totalScore: (current?.totalScore || 0) + newScore,
      });
    } else {
      const prev = existingQuiz.score;
      existingQuiz.score = newScore;

      user.scores.set(subject, {
        totalQuizzes: current?.totalQuizzes || 1,
        totalScore: (current?.totalScore || 0) + (newScore - prev),
      });
    }

    await user.save();
    res.status(200).json({ message: 'Score updated successfully', user });
  } catch (error) {
    console.error('Score update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ==========================
// GET AURA
// ==========================
exports.getAura = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID is required' });

  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let sumOfAverages = 0;
    for (const [subject, score] of user.scores.entries()) {
      const avg = score.totalQuizzes > 0 ? score.totalScore / score.totalQuizzes : 0;
      sumOfAverages += avg;
    }

    const aura = Math.ceil(100 + sumOfAverages * 10);
    user.aura = aura;
    await user.save();

    await Leaderboard.findOneAndUpdate(
      { username: user.username },
      { $set: { name: user.name, aura } },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Aura calculated and leaderboard updated', aura });
  } catch (err) {
    console.error('Aura error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ==========================
// GET ALL USERS
// ==========================
exports.getAllUsers = async (_req, res) => {
  try {
    const users = await UserModel.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ==========================
// DELETE USER
// ==========================
exports.deleteUser = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
