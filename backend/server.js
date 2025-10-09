require('dotenv').config();
const app = require('./app');

if (process.env.NODE_ENV !== "test") {
  app.listen(5000, () => {
    console.log("Backend running at http://localhost:5000");
  });
}

module.exports = app;
