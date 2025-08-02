const mongoose=require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctAnswer: String
}, { _id: false });

const hotquizSchema=new mongoose.Schema({
    quizTitle: { type: String, required: true },
  subject: {
    type:String,
    required: true
  },
  type: {
    type: String,
    enum: [ "Hot"],
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
const HotQuiz=mongoose.model('HotQuiz',hotquizSchema);
module.exports=HotQuiz;