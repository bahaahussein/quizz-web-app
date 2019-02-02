const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const questionSchema = new Schema({
   question: {
       type: String,
       required: true
   },
    type: {
       type: String,
       required: true
    },
    answers: {
       type: [String],
        required: true
    },
    choices: [String]
});
const quizSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    questions: [questionSchema]
});

// validate the question
quizSchema.statics.isQuestionError = function(question) {
    if(!question.answers || question.answers.length === 0) {
        return new Error("question must have at least one answer");
    }
    if(question.type === "multiple choice") {
        if(!question.choices || question.choices.length === 0) {
            return new Error("multiple choice question must have choices");
        }
    } else if(question.type === "text") {
        if(question.answers.length > 1) {
            return new Error("text question must have at least one answer");
        }
    } else {
        return new Error("question type must be multiple choice or text");
    }
    // no error
    return false;
}

module.exports = mongoose.model('Quiz', quizSchema);