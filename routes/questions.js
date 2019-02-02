const express = require('express');

const QuizzModel = require('../models/quizz');
const response = require('../utils/response');

const router = express.Router();

// new Question to existing quizz
router.post('/', (req, res) => {
    const quizzId = req.body.quizzId;
    const question = req.body.question;
    if(!quizzId) {
        response.sendErrorResponse(res, 400, "quizz id must be provided");
        return;
    }
    const err = QuizzModel.isQuestionError(question);
    if(err) {
        response.sendErrorResponse(res, 400, err.message);
        return;
    }
    QuizzModel.update({_id: quizzId, 'questions.question': {$ne: question.question}},
        {$push: {questions: question}}).then((result) => {
        if(result.nModified === 0) {
            response.sendErrorResponse(res, 400, "this question is already in database");
        }  else {
            response.sendSuccessResponse(res, {message: "Success update"});
        }
    }).catch(() => {
        response.sendErrorResponse(res, 400, "wrong quizz id");
    });
});

// delete question from quizz
router.delete('/', (req, res) => {
    const quizzId = req.body.quizzId;
    const questionId = req.body.questionId;
    if(!quizzId || !questionId) {
        response.sendErrorResponse(res, 400, "quizzId and questionId must be provided");
    }
    QuizzModel.update({_id: quizzId},
        {$pull: {questions: {_id: questionId}}}).then(() => {
        response.sendSuccessResponse(res, {message: "Success delete"});
    }).catch(() => {
        response.sendErrorResponse(res, 400, "wrong question or quizz id");
    });
});

module.exports = router;