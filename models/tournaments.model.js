const mongoose=require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctAnswer: String
}, { _id: false });

const tournamentquizSchema=new mongoose.Schema({
    quizTitle: { type: String, required: true },
  subject: {
    type:String,
    required: true
  },
  type: {
    type: String,
    enum: [ "Tournament"],
    required: true
  },

  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium' 

  },

  questions: [questionSchema],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const TournamentQuiz = mongoose.model('TournamentQuiz', tournamentquizSchema);
module.exports = TournamentQuiz;