import mysql from "mysql2/promise";

export function createDatabase(env = process.env) {
  for (const key of ["DB_USER", "DB_PASSWORD", "DB_NAME"]) {
    if (!env[key]) throw new Error(`Missing required environment variable: ${key}`);
  }
  return mysql.createPool({
    host: env.DB_HOST || "127.0.0.1",
    port: Number(env.DB_PORT || 3308),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    decimalNumbers: true,
    charset: "utf8mb4",
  });
}
