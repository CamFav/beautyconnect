require("dotenv/config");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    const client = await pool.connect();
    console.log("PostgreSQL pool connected");
    client.release();
  } catch (error) {
    console.error("PostgreSQL pool connection failed:", error.message);
  }
})();

module.exports = pool;
