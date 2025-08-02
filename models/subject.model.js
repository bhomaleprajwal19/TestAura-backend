
const mongoose = require('mongoose');
const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;