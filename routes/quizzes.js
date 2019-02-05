const express = require('express');

const QuizzModel = require('../models/quizz');
const response = require('../utils/response');
const authenticate = require('../authenticate');

const router = express.Router();

// list all quizzes
router.get('/', (req, res) => {
    QuizzModel.find().then((quizzes) => {
       response.sendSuccessResponse(res, {quizzes: quizzes});
    }).catch(() => {
        response.sendErrorResponse(res, 500, "something went wrong");
    });
});

// add new quizz with questions
router.post('/', authenticate, (req, res) => {
    const body = req.body;
    if(!body.name || typeof(body.name) !== "string") {
        response.sendErrorResponse(res, 400, "quizz must have name of type string");
        return;
    }
    const questions = body.questions;
    if(questions) {
        for(let i=0; i < questions.length; i++ ) {
            const err = QuizzModel.isQuestionError(questions[i]);
            if(err) {
                response.sendErrorResponse(res, 400, err.message);
                return;
            }
        }
        // check if there is duplicate for the question of the question
        if(isQuestionDuplicate(questions)) {
            response.sendErrorResponse(res, 400, "questions must not have duplicates");
            return;
        }
    }

    const newQuizz = new QuizzModel(body);
    newQuizz.save().then((addedQuizz) => {
        response.sendSuccessResponse(res, {quizz: addedQuizz});
    }).catch(() => {
        response.sendErrorResponse(res, 400, "wrong data");
    });
});

// get quizz by id
router.get('/:quizzId', (req, res) => {
    const quizzId = req.params.quizzId;
    QuizzModel.findById(quizzId).then((quizz) => {
        response.sendSuccessResponse(res, {quizz: quizz});
    }).catch(() => {
       response.sendErrorResponse(res, 400, "wrong id");
    });
});

function isQuestionDuplicate(questions) {
    const map = {};
    for(let i=0; i < questions.length; i++) {
        const question = questions[i].question;
        if(map[question]) {
            return true;
        } else {
            map[question] = true;
        }
    }
    return false;
}

module.exports = router;