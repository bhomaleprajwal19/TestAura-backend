const express=require('express');
const router=express.Router();
const {body}=require('express-validator');
const quizeController=require('../controllers/quize.controller');



 router.get('/allquizes',quizeController.getAllQuizes);
 router.get('/allsubjects',quizeController.getAllSubjects);

router.post('/addquiz',[
    body('subject').isLength({min:3}).withMessage('Subject must be at least 3 characters long'),
    body('quizTitle').isLength({min:3}).withMessage('Quiz title must be at least 3 characters long'),
    body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium or hard'), 
    body('type').isIn(['Quiz', 'Hot', 'Tournament']).withMessage('Type must be Quiz, Hot or Tournament'),
    body('questions').isArray().withMessage('Questions must be an array'),
    body('questions.*.question').isLength({min:3}).withMessage('Question must be at least 3 characters long'),
    body('questions.*.options').isArray().withMessage('Options must be an array'),
    body('questions.*.options.*').isLength({min:1}).withMessage('Option must be at least 3 characters long'),
],quizeController.AddQuiz);


router.get('/gethotquiz',quizeController.gethotquiz);

router.post('/addTournamentQuiz',[
    body('subject').isLength({min:3}).withMessage('Subject must be at least 3 characters long'),
    body('quizTitle').isLength({min:3}).withMessage('Quiz title must be at least 3 characters long'),
    body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Difficulty must be Easy, Medium or Hard'),
    body('type').isIn(['Quiz', 'Hot', 'Tournament']).withMessage('Type must be Quiz, Hot or Tournament'),
    body('questions').isArray().withMessage('Questions must be an array'),
    body('questions.*.questionText').isLength({min:3}).withMessage('Question must be at least 3 characters long'),
    body('questions.*.options').isArray().withMessage('Options must be an array'),
    body('questions.*.options.*').isLength({min:1}).withMessage('Option must be at least 3 characters long')
],quizeController.AddTournamentQuiz);

router.get('/gettournamentquiz',quizeController.getTournament);

router.post("/addsubject",[
    body('subject.name').isLength({min:2}).withMessage('Subject must be at least 2 characters long'),
],quizeController.AddSubject);


router.delete('/deletequiz/:type/:id',quizeController.deleteQuiz);
module.exports=router;