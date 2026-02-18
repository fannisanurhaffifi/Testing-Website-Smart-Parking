const mysql = require("mysql2/promise");
require("dotenv").config();

console.log(`📡 Connecting to DB at ${process.env.MYSQLHOST}:${process.env.MYSQLPORT}, Database: ${process.env.MYSQL_DATABASE}`);

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
});

const connectToDatabase = async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Database connected successfully");
    conn.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
};

const query = async (sql, params = []) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(sql, params);
    return rows;
  } finally {
    conn.release();
  }
};

module.exports = {
  pool,
  connectToDatabase,
  query,
};
