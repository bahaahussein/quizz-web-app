const mongoose = require("mongoose");
const QuizzModel = require('../models/quizz');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const should = chai.should();

chai.use(chaiHttp);

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaGFja2VyIn0.j2-9VecocC3etiGX_IZ9TFNbNMpY6nTU8DM-q3u2VLQ';

describe('Quizzes', () => {
    beforeEach((done) => { //Before each test we empty the database
        QuizzModel.remove({}, () => {
            done();
        });
    });

    describe('/GET quizz', () => {
        it('it should GET nothing as there is no quizz in database', (done) => {
            chai.request(server)
                .get('/quizz')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('status').eql('success');
                    res.body.should.have.property('quizzes');
                    res.body.quizzes.should.be.a('array');
                    res.body.quizzes.length.should.be.eql(0);
                    done();
                });
        });

        it('it should GET all quizzes in database', (done) => {
            const quizz1 = {
                name: "quiz1",
                questions: [{
                    question: "question 1",
                    type: "multiple choice",
                    choices: ["choice 1", "choice 2"],
                    answers: ["answer 1", "answer 2"]
                }]
            };
            const quizz2 = {
                name: "quiz2",
                questions: [{
                    question: "question 2",
                    type: "text",
                    answers: ["answer"]
                }]
            };
            Promise.all([new QuizzModel(quizz1).save(), new QuizzModel(quizz2).save()]).then(() => {
                chai.request(server)
                    .get('/quizz')
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.an('object');
                        res.body.should.have.property('status').eql('success');
                        res.body.should.have.property('quizzes');
                        res.body.quizzes.should.be.a('array');
                        res.body.quizzes.length.should.be.eql(2);
                        /*
                        res.body.quizzes[0].should.have.property('name').eql('quiz1');
                        res.body.quizzes[0].should.have.property('_id');
                        res.body.quizzes[0].should.have.property('questions');
                        res.body.quizzes[0].questions.should.be.a('array');
                        res.body.quizzes[0].questions.length.should.be.eql(1);
                        res.body.quizzes[1].should.have.property('name').eql('quiz2');
                        res.body.quizzes[1].should.have.property('_id');
                        res.body.quizzes[1].should.have.property('questions');
                        res.body.quizzes[1].questions.should.be.a('array');
                        res.body.quizzes[1].questions.length.should.be.eql(1);
                        */
                        done();
                    });
            });
        });
    });

    describe('/POST quizz', () => {
        it('it should not POST quizz with repeated question', (done) => {
            const questions = [{
                question: "question 1",
                type: "multiple choice",
                choices: ["choice 1", "choice 2"],
                answers: ["answer 1", "answer 2"]
            }, {
                question: "question 1",
                type: "text",
                answers: ["answer"]
            }];
            const quizz = {
                name: "quiz1",
                questions: questions
            };
            chai.request(server)
                .post('/quizz')
                .set('x-fake-token', token)
                .send(quizz)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('status').eql('fail');
                    res.body.should.have.property('message').eql('questions must not have duplicates');
                    done();
                });
        });

        it('it should not POST quizz with question with type not multiple choice or text', (done) => {
            const questions = [{
                question: "question 1",
                type: "multiple_choice",
                choices: ["choice 1", "choice 2"],
                answers: ["answer 1", "answer 2"]
            }];
            const quizz = {
                name: "quiz1",
                questions: questions
            };
            chai.request(server)
                .post('/quizz')
                .set('x-fake-token', token)
                .send(quizz)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('status').eql('fail');
                    res.body.should.have.property('message').eql('question type must be multiple choice or text');
                    done();
                });
        });

        it('it should not POST quizz with question with type text and has more than one answer', (done) => {
            const questions = [{
                question: "question 1",
                type: "text",
                answers: ["answer 1", "answer 2"]
            }];
            const quizz = {
                name: "quiz1",
                questions: questions
            };
            chai.request(server)
                .post('/quizz')
                .set('x-fake-token', token)
                .send(quizz)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('status').eql('fail');
                    res.body.should.have.property('message').eql('text question must have exactly one answer');
                    done();
                });
        });

        it('it should not POST quizz with question with type multiple choice and has no choices', (done) => {
            const questions = [{
                question: "question 1",
                type: "multiple choice",
                answers: ["answer 1", "answer 2"]
            }];
            const quizz = {
                name: "quiz1",
                questions: questions
            };
            chai.request(server)
                .post('/quizz')
                .set('x-fake-token', token)
                .send(quizz)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('status').eql('fail');
                    res.body.should.have.property('message').eql('multiple choice question must have choices');
                    done();
                });
        });

        it('it should not POST  quizz with question with no answer', (done) => {
            const questions = [{
                question: "question 1",
                type: "multiple choice"
            }];
            const quizz = {
                name: "quiz1",
                questions: questions
            };
            chai.request(server)
                .post('/quizz')
                .set('x-fake-token', token)
                .send(quizz)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('status').eql('fail');
                    res.body.should.have.property('message').eql('question must have at least one answer');
                    done();
                });
        });

        it('it should not POST  quizz with no body', (done) => {
            chai.request(server)
                .post('/quizz')
                .set('x-fake-token', token)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('status').eql('fail');
                    res.body.should.have.property('message').eql('quizz must have name of type string');
                    done();
                });
        });

        it('it should not POST  quizz with no name', (done) => {
            const questions = [{
                question: "question 1",
                type: "multiple choice",
                choices: ["choice 1", "choice 2"],
                answers: ["answer 1", "answer 2"]
            }, {
                question: "question 2",
                type: "text",
                answers: ["answer"]
            }];
            const quizz = {
                questions: questions
            };
            chai.request(server)
                .post('/quizz')
                .set('x-fake-token', token)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('status').eql('fail');
                    res.body.should.have.property('message').eql('quizz must have name of type string');
                    done();
                });
        });

        it('it should be added', (done) => {
            const questions = [{
                question: "question 1",
                type: "multiple choice",
                choices: ["choice 1", "choice 2"],
                answers: ["answer 1", "answer 2"]
            }, {
                question: "question 2",
                type: "text",
                answers: ["answer"]
            }];
            const quizz = {
                name: "quiz1",
                questions: questions
            };
            chai.request(server)
                .post('/quizz')
                .set('x-fake-token', token)
                .send(quizz)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('status').eql('success');
                    res.body.should.have.property('quizz');
                    res.body.quizz.should.be.an('object');
                    res.body.quizz.should.have.property('name').eql('quiz1');
                    res.body.quizz.should.have.property('_id');
                    res.body.quizz.should.have.property('questions');
                    res.body.quizz.questions.should.be.a('array');
                    res.body.quizz.questions.length.should.be.eql(2);
                    done();
                });
        });

        it('it should be added with no questions', (done) => {
            const quizz = {
                name: "quiz1"
            };
            chai.request(server)
                .post('/quizz')
                .set('x-fake-token', token)
                .send(quizz)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('status').eql('success');
                    res.body.should.have.property('quizz');
                    res.body.quizz.should.be.an('object');
                    res.body.quizz.should.have.property('name').eql('quiz1');
                    res.body.quizz.should.have.property('_id');
                    res.body.quizz.should.have.property('questions');
                    res.body.quizz.questions.should.be.a('array');
                    res.body.quizz.questions.length.should.be.eql(0);
                    done();
                });
        });
    });

    describe('/GET/:id quizz', () => {
        it('it should GET quizz by the given id', (done) => {
            const questions = [{
                question: "question 1",
                type: "multiple choice",
                choices: ["choice 1", "choice 2"],
                answers: ["answer 1", "answer 2"]
            }, {
                question: "question 2",
                type: "text",
                answers: ["answer"]
            }];
            const quizz = {
                name: "quiz1",
                questions: questions
            };
            const newQuizz = new QuizzModel(quizz);
            newQuizz.save().then((addedQuizz) => {
                chai.request(server)
                    .get('/quizz/' + addedQuizz._id)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.an('object');
                        res.body.should.have.property('status').eql('success');
                        res.body.should.have.property('quizz');
                        res.body.quizz.should.be.an('object');
                        res.body.quizz.should.have.property('name').eql('quiz1');
                        res.body.quizz.should.have.property('_id');
                        res.body.quizz.should.have.property('questions');
                        res.body.quizz.questions.should.be.a('array');
                        res.body.quizz.questions.length.should.be.eql(2);
                        done();
                    });
                });
            });
        });

        it('it should not GET quizz by wrong id', (done) => {
            const questions = [{
                question: "question 1",
                type: "multiple choice",
                choices: ["choice 1", "choice 2"],
                answers: ["answer 1", "answer 2"]
            }, {
                question: "question 2",
                type: "text",
                answers: ["answer"]
            }];
            const quizz = {
                name: "quiz1",
                questions: questions
            };
            const newQuizz = new QuizzModel(quizz);
            newQuizz.save().then((addedQuizz) => {
                chai.request(server)
                    .get('/quizz/' + addedQuizz._id + "123")
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.be.an('object');
                        res.body.should.have.property('status').eql('fail');
                        res.body.should.have.property('message').eql('wrong id');
                        done();
                    });
            });
        });
});