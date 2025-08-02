const mongoose = require('mongoose');

const engagementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'HotQuiz', required: true },
  subject: { type: String, required: true },
  score: { type: Number, default: 0 },  
  attemptedAt: { type: Date, default: Date.now },   
});     

const Engagement = mongoose.model('Engagement', engagementSchema);

module.exports = Engagement;    