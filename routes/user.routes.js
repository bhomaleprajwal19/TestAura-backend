const express = require('express');
const router = express.Router();
const {body}= require('express-validator');
const auth = require('../middlewares/auth');
const UserModel = require('../models/user.models');
const userController = require('../controllers/user.controller');


router.post('/register',[
    body('name').isLength({min:3}).withMessage('Name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long'),
    body('mobile').isLength({min:10}).withMessage('Mobile number must be at least 10 characters long'),
    body('username').isLength({min:3}).withMessage('Username must be at least 3 characters long'),
],userController.register);

router.post('/login',[
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password').exists().withMessage('Password is required'),
], userController.login); // Assuming login method is defined in userController

router.get('/logout', userController.logout);

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // --- Daily Streak Logic ---
    const today = new Date();
    const lastOpened = user.lastOpened ? new Date(user.lastOpened) : null;

    const sameDay = lastOpened &&
      today.getFullYear() === lastOpened.getFullYear() &&
      today.getMonth() === lastOpened.getMonth() &&
      today.getDate() === lastOpened.getDate();

    if (!sameDay) {
      const diffDays = lastOpened
        ? Math.floor((today - lastOpened) / (1000 * 60 * 60 * 24))
        : null;

      if (diffDays === 1) {
        user.streak = (user.streak || 0) + 1;
      } else {
        user.streak = 1;
      }

      user.lastOpened = today;
      await user.save();
    }

    res.status(200).json({ user });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/updatescore',[body('userId').exists().withMessage('User is required'),body('subject').exists().withMessage('Subject is required'),body('score').exists().withMessage('Score is required'),body('quizId').exists().withMessage('quizId is required')], userController.updateScore);

router.post('/aura',[body('userId').exists().withMessage('User is required')], userController.getAura);

router.get('/getallusers', userController.getAllUsers);

router.delete('/deleteuser/:id', userController.deleteUser);

module.exports = router;
