const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false, // Exclude password from queries by default
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    aura: {
        type: Number,
        default: 100,
    },
    scores: {
        type: Map,
        of: new mongoose.Schema({
            totalQuizzes: { type: Number, default: 0 },
            totalScore: { type: Number, default: 0 },

        }),
        default: {}
    },
    quizHistory: [
        {
            quizId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Quiz',
            },
            score: Number,
            subject: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ]
    ,
    streak: {
        type: Number,
        default: 0,
    },
    lastOpened: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

});

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;
