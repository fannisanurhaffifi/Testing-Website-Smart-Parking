const mysql = require("mysql2/promise");
require("dotenv").config();

console.log(`📡 Connecting to DB at ${process.env.DB_HOST}:${process.env.DB_PORT}, Database: ${process.env.DB_NAME}`);


const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
});



const connectToDatabase = async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Database connected successfully");

    // Auto Create Table if missing
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS rfid_registration_session (
        id_session INT AUTO_INCREMENT PRIMARY KEY,
        id_kendaraan INT NOT NULL,
        id_admin INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expired_at DATETIME,
        status ENUM('PENDING','DONE','EXPIRED') DEFAULT 'PENDING',
        CONSTRAINT fk_session_kendaraan
            FOREIGN KEY (id_kendaraan)
            REFERENCES kendaraan(id_kendaraan)
            ON DELETE CASCADE,
        CONSTRAINT fk_session_admin
            FOREIGN KEY (id_admin)
            REFERENCES admin(id_admin)
            ON DELETE CASCADE
      )
    `);
    console.log("✅ Table 'rfid_registration_session' is ready");

    conn.release();
  } catch (err) {
    console.error("❌ Database connection failed FULL ERROR:", err);

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
