const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Contact= require('../models/contact.model'); // Assuming you have a Contact model
const User = require('../models/user.models');
const Engagement = require('../models/engagement.model');
const Quiz = require('../models/quizes.model');
const Hotquizes = require('../models/hotquizes.model');

router.get('/dashboard/data', async (req, res) => {
  try {
    const users = await User.countDocuments({});
    const quizzes = await Quiz.countDocuments({});
    const hotquiz = await Hotquizes.countDocuments({});
    const contacts = await Contact.countDocuments({});
    const totalquizzes = quizzes + hotquiz;

    const engagements = await Engagement.aggregate([
      {
        $group: {
          _id: '$subject',
          users: { $addToSet: '$userId' },
          avgScore: { $avg: '$score' },
        },
      },
      {
        $project: {
          _id: 0,
          subject: '$_id',
          totalAttempts: { $size: '$users' },
          avgScore: { $round: ['$avgScore', 2] },
        },
      },
    ]);

    res.json({
      users: users || 43,
      totalquizzes: totalquizzes || 324,
      contacts: contacts || 6,
      engagements: engagements || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



router.post('/contact', async (req, res) => {
  // Validate request body]
  await check('name').notEmpty().withMessage('Name is required').run(req);
  await check('email').isEmail().withMessage('Valid email is required').run(req);
  await check('message').notEmpty().withMessage('Message is required').run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, email, message, subject } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const contact = new Contact({
      name,
      email,
      message,
      subject,
    }); 

    await contact.save();

    res.json({ message: 'Contact form submitted successfully'  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/getFeedback', async (req, res) => {
  try {
    const feedback = await Contact.find({});
    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
