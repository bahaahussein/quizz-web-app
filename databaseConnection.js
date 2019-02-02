const mongoose = require('mongoose');
const server = "localhost:27017"; // REPLACE WITH YOUR DB SERVER
const database = "quizzesdb";      // REPLACE WITH YOUR DB NAME

function connect() {
  mongoose.connect(`mongodb://${server}/${database}`, {useNewUrlParser: true}).then(() => {
      console.log("Database connection successful");
  }).catch(() => {
      console.error("error connecting to db");
  })
};

module.exports = connect();