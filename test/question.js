const mongoose = require("mongoose");
const QuizzModel = require('../models/quizz');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const should = chai.should();

chai.use(chaiHttp);

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaGFja2VyIn0.j2-9VecocC3etiGX_IZ9TFNbNMpY6nTU8DM-q3u2VLQ';

describe('Questions', () => {
    beforeEach((done) => { //Before each test we empty the database
        QuizzModel.remove({}, () => {
            done();
        });
    });

    describe('/POST question', () => {
        it('it should not POST question with no question', (done) => {
            const quizz = {
                name: "quizz",
                questions: [{
                    question: "question 1",
                    type: "multiple choice",
                    choices: ["choice 1", "choice 2"],
                    answers: ["answer 1", "answer 2"]
                }]
            };
            new QuizzModel(quizz).save().then((addedQuizz) => {
                chai.request(server)
                    .post('/question')
                    .set('x-fake-token', token)
                    .send({quizzId: addedQuizz._id})
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('fail');
                        res.body.should.have.property('message').eql('quizz id and question must be provided');
                        done();
                    });
            });
        });
        it('it should not POST question with no quizzId', (done) => {
            const newQuestion = {
                question: "question 1",
                type: "text",
                answers: ["answer"]
            };
            chai.request(server)
                .post('/question')
                .set('x-fake-token', token)
                .send({question: newQuestion})
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('fail');
                    res.body.should.have.property('message').eql('quizz id and question must be provided');
                    done();
                });
        });

        it('it should not POST question with same name', (done) => {
            const quizz = {
                name: "quizz",
                questions: [{
                    question: "question 1",
                    type: "multiple choice",
                    choices: ["choice 1", "choice 2"],
                    answers: ["answer 1", "answer 2"]
                }]
            };
            const newQuestion = {
                question: "question 1",
                type: "text",
                answers: ["answer"]
            };
            new QuizzModel(quizz).save().then((addedQuizz) => {
                chai.request(server)
                    .post('/question')
                    .set('x-fake-token', token)
                    .send({quizzId: addedQuizz._id, question: newQuestion})
                    .end((err, res) => {
                        // response.sendErrorResponse(res, 400, "this question is already in database");
                        res.should.have.status(400);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('fail');
                        res.body.should.have.property('message').eql('this question is already in database');
                        done();
                    });
            });
        });

        it('it should not POST question with wrong quizz id', (done) => {
            const newQuestion = {
                question: "question 1",
                type: "text",
                answers: ["answer"]
            };
            chai.request(server)
                .post('/question')
                .set('x-fake-token', token)
                .send({quizzId: "wrong quizz id", question: newQuestion})
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('fail');
                    res.body.should.have.property('message').eql('wrong quizz id');
                    done();
                });
        });

        it('it should POST question', (done) => {
            const quizz = {
                name: "quizz",
                questions: [{
                    question: "question 1",
                    type: "multiple choice",
                    choices: ["choice 1", "choice 2"],
                    answers: ["answer 1", "answer 2"]
                }]
            };
            const newQuestion = {
                question: "question 2",
                type: "text",
                answers: ["answer"]
            };
            new QuizzModel(quizz).save().then((addedQuizz) => {
                chai.request(server)
                    .post('/question')
                    .set('x-fake-token', token)
                    .send({quizzId: addedQuizz._id, question: newQuestion})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('success');
                        res.body.should.have.property('message').eql('Success update');
                        done();
                    });
            });
        });

        it('it should not POST question with type not multiple choice or text', (done) => {
            const question = {
                question: "question 1",
                type: "multiple_choice",
                choices: ["choice 1", "choice 2"],
                answers: ["answer 1", "answer 2"]
            };
            chai.request(server)
                .post('/question')
                .set('x-fake-token', token)
                .send({quizzId: "any quizz id", question: question})
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('status').eql('fail');
                    res.body.should.have.property('message').eql('question type must be multiple choice or text');
                    done();
                });
        });

        it('it should not POST  question with type text and has more than one answer', (done) => {
            const question = {
                question: "question 1",
                type: "text",
                answers: ["answer 1", "answer 2"]
            };
            chai.request(server)
                .post('/question')
                .set('x-fake-token', token)
                .send({quizzId: "any quizz id", question: question})
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('status').eql('fail');
                    res.body.should.have.property('message').eql('text question must have exactly one answer');
                    done();
                });
        });

        it('it should not POST  question with type multiple choice and has no choices', (done) => {
            const question = {
                question: "question 1",
                type: "multiple choice",
                answers: ["answer 1", "answer 2"]
            };
            chai.request(server)
                .post('/question')
                .set('x-fake-token', token)
                .send({quizzId: "any quizz id", question: question})
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('status').eql('fail');
                    res.body.should.have.property('message').eql('multiple choice question must have choices');
                    done();
                });
        });

        it('it should not POST  question with no answer', (done) => {
            const question = {
                question: "question 1",
                type: "multiple choice"
            };
            chai.request(server)
                .post('/question')
                .set('x-fake-token', token)
                .send({quizzId: "any quizz id", question: question})
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('status').eql('fail');
                    res.body.should.have.property('message').eql('question must have at least one answer');
                    done();
                });
        });
    });

    describe('/DELETE question', () => {
        it('it should not DELETE question with wrong quizz id', (done) => {
            const quizz = {
                name: "quizz",
                questions: [{
                    question: "question 1",
                    type: "multiple choice",
                    choices: ["choice 1", "choice 2"],
                    answers: ["answer 1", "answer 2"]
                }]
            };
            new QuizzModel(quizz).save().then((addedQuizz) => {
                chai.request(server)
                    .delete('/question')
                    .set('x-fake-token', token)
                    .send({quizzId: addedQuizz._id + "123", questionId: addedQuizz.questions[0]._id})
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('fail');
                        res.body.should.have.property('message').eql('wrong question or quizz id');
                        done();
                    });
            });
        });

        it('it should not DELETE question with wrong question id', (done) => {
            const quizz = {
                name: "quizz",
                questions: [{
                    question: "question 1",
                    type: "multiple choice",
                    choices: ["choice 1", "choice 2"],
                    answers: ["answer 1", "answer 2"]
                }]
            };
            new QuizzModel(quizz).save().then((addedQuizz) => {
                chai.request(server)
                    .delete('/question')
                    .set('x-fake-token', token)
                    .send({quizzId: addedQuizz._id, questionId: addedQuizz.questions[0]._id + "123"})
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('fail');
                        res.body.should.have.property('message').eql('wrong question or quizz id');
                        done();
                    });
            });
        });

        it('it should DELETE question', (done) => {
            const quizz = {
                name: "quizz",
                questions: [{
                    question: "question 1",
                    type: "multiple choice",
                    choices: ["choice 1", "choice 2"],
                    answers: ["answer 1", "answer 2"]
                }]
            };
            new QuizzModel(quizz).save().then((addedQuizz) => {
                chai.request(server)
                    .delete('/question')
                    .set('x-fake-token', token)
                    .send({quizzId: addedQuizz._id, questionId: addedQuizz.questions[0]._id})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('success');
                        res.body.should.have.property('message').eql('Success delete');
                        done();
                    });
            });
        });

        it('it should not DELETE question with no questionId', (done) => {
            const quizz = {
                name: "quizz",
                questions: [{
                    question: "question 1",
                    type: "multiple choice",
                    choices: ["choice 1", "choice 2"],
                    answers: ["answer 1", "answer 2"]
                }]
            };
            new QuizzModel(quizz).save().then((addedQuizz) => {
                chai.request(server)
                    .delete('/question')
                    .set('x-fake-token', token)
                    .send({quizzId: "123"})
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('fail');
                        res.body.should.have.property('message').eql('quizzId and questionId must be provided');
                        done();
                    });
            }).catch((err) => {
                console.log("err: ", err);
            });
        });

        it('it should not DELETE question with no quizzId', (done) => {
            const quizz = {
                name: "quizz",
                questions: [{
                    question: "question 1",
                    type: "multiple choice",
                    choices: ["choice 1", "choice 2"],
                    answers: ["answer 1", "answer 2"]
                }]
            };
            new QuizzModel(quizz).save().then((addedQuizz) => {
                chai.request(server)
                    .delete('/question')
                    .set('x-fake-token', token)
                    .send({questionId: addedQuizz.questions[0]._id})
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.be.a('object');
                        res.body.should.have.property('status').eql('fail');
                        res.body.should.have.property('message').eql('quizzId and questionId must be provided');
                        done();
                    });
            });
        });
    });
});