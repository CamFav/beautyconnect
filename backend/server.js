require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
    console.log(`Mode: ${process.env.NODE_ENV || "development"}`);
  });
}

module.exports = app;
