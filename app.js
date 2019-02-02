const express = require('express');
const bodyParser = require('body-parser');

const response = require('./utils/response');
const quizzesRouter = require('./routes/quizzes');
const questionsRouter = require('./routes/questions');
const authenticate = require('./authenticate');

const app = express();
const databaseConnection = require('./databaseConnection'); // to connect to database

const port = 3000;


app.use(bodyParser.json());

app.use('/quizz', quizzesRouter);
app.use('/question', authenticate, questionsRouter);

app.use((req, res,) => {
  response.sendErrorResponse(res, 404, "wrong url");
});

app.listen(port, () => console.log(`app listening on port ${port}!`));

module.exports = app;
