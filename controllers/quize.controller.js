const { validationResult } = require('express-validator');
const Subject = require('../models/subject.model');
const Quiz = require('../models/quizes.model');
const HotQuiz = require('../models/hotquizes.model');
const TournamentQuiz = require('../models/tournaments.model');


module.exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports.AddQuiz = async (req, res) => {
  try {
    const { quizTitle, subject, difficulty, questions, createdBy, type } = req.body;
    console.log("Received Body:", req.body);



    // Validate subject
    const subjectDoc = await Subject.findOne({ name: subject });
    if (!subjectDoc) {
      return res.status(400).json({ message: `Subject "${subject}" not found` });
    }

    // Validate type
    if (type !== 'Quiz' && type !== 'Hot' && type !== 'Tournament') {
      return res.status(400).json({ message: 'Type must be Quiz, Hot or Tournament' });
    }

    let quiz;

    if (type === 'Hot') {
      quiz = new HotQuiz({
        quizTitle,
        subject: subjectDoc.name,
        questions,
        difficulty,
        type,
        createdBy,
      });
      await quiz.save();
      return res.status(201).json({ message: 'Hot Quiz created successfully', quiz });

    } else if (type === 'Tournament') {
      quiz = new TournamentQuiz({
        quizTitle,
        subject: subjectDoc.name,
        questions,
        difficulty,
        type,
        createdBy,
      });
      await quiz.save();
      return res.status(201).json({ message: 'Tournament Quiz created successfully', quiz });

    } else if (type === 'Quiz') {
      quiz = new Quiz({
        quizTitle,
        subject: subjectDoc.name,
        difficulty,
        type,
        questions,
        createdBy,
      });
      await quiz.save();
      return res.status(201).json({ message: 'Quiz created successfully', quiz });
    }

  } catch (err) {
    console.error('Error creating quiz:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


module.exports.getAllQuizes = async (req, res) => {
  try {
    const subjects = await Subject.find();
    const result = {};

    for (const subject of subjects) {
      const quizzes = await Quiz.find({ subject: subject.name });
      result[subject.name] = {
        color: subject.color || '#ccc', // if you added color in SubjectSchema
        quizzes: quizzes.map(q => q)
      };
    }

    res.json(result);
  } catch (err) {
    console.error('Error fetching quizzes by subject:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


module.exports.AddSubject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newSubject = new Subject({ name, description });
    await newSubject.save();
    res.status(201).json({ message: 'Subject created successfully' });
  } catch (err) {
    console.error('Error creating subject:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}




module.exports.AddTournamentQuiz = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { quizTitle, subject, questions, type, difficulty } = req.body;

  try {
    const tournamentQuiz = new TournamentQuiz({
      quizTitle,
      subject,
      questions,
      type,
      difficulty
    });

    await tournamentQuiz.save();
    res.status(201).json({ message: 'Tournament Quiz created successfully', tournamentQuiz });
  } catch (err) {
    console.error('Error creating tournament quiz:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


module.exports.gethotquiz = async (req, res) => {
  try {
    const hotQuizzes = await HotQuiz.find();
    res.json(hotQuizzes);
  } catch (err) {
    console.error('Error fetching hot quizzes:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports.getTournament = async (req, res) => {
  try {
    const tournamentQuizzes = await TournamentQuiz.find();
    res.json(tournamentQuizzes);
  } catch (err) {
    console.error('Error fetching tournament quizzes:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


module.exports.deleteQuiz = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { type, id } = req.params;
    let Model;

    if (type === 'Quiz') {
      Model = Quiz;
    } else if (type === 'Tournament') {
      Model = TournamentQuiz;
    } else if (type === 'Hot') {
      Model = HotQuiz;
    } else {
      return res.status(400).json({ message: 'Invalid quiz type' });
    }

    const quiz = await Model.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    await Model.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Quiz deleted successfully' });

  } catch (err) {
    console.error('Error deleting quiz:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
