const jwt = require('jsonwebtoken');
const config = require('./config.js');
const respone = require('./utils/response')

const predefinedToken = jwt.sign({name: 'hacker'}, config.secret);

module.exports = (req, res, next) => {
  const reqToken = req.headers['x-fake-token'];
  if(!reqToken) {
      respone.sendErrorResponse(res, 403, 'unauthenticated');
  } else if(reqToken !== predefinedToken) {
      respone.sendErrorResponse(res, 403, 'unauthenticated');
  } else {
      next();
  }
};