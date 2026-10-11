import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   // Cloud databases (Aiven, TiDB...) use their own port. Locally: 3306.
//   port: Number(process.env.DB_PORT) || 3306,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   charset: "utf8mb4",
//   // Cloud databases require an encrypted connection. Set DB_SSL=true there.
//   // Locally it stays off, exactly as before.
//   ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
// });

let db;

// 1. If running on Render, prioritize parsing Clever Cloud variables
if (process.env.DATABASE_URL || process.env.MYSQL_ADDON_URI) {
    db = mysql.createPool({
    uri: process.env.DATABASE_URL || process.env.MYSQL_ADDON_URI,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} else {
  // 2. Fallback to local parameter configs when debugging on your computer (MAMP)
  db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'my_forum_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}


const ensureParams = (params) => {
  if (params === undefined || params === null) {
    throw new Error("SQL parameters are required");
  }
  const isArray = Array.isArray(params);
  const isObject = !isArray && typeof params === "object";
  if (!isArray && !isObject) {
    throw new Error("SQL parameters must be an array or object");
  }
};

const safeExecute = async (sql, params) => {
  if (typeof sql !== "string" || sql.trim().length === 0) {
    throw new Error("SQL query must be a non-empty string");
  }
  ensureParams(params);
  const [result] = await db.execute(sql, params);
  return result;
};

export { db, safeExecute };
