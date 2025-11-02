require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, HOST, () => {
    console.log(`Backend running at http://${HOST}:${PORT}`);
    console.log(`Mode: ${process.env.NODE_ENV || "development"}`);
  });
}

module.exports = app;
