import mysql from "mysql2/promise";

export const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Local database connection
// export const db = {
//   products: process.env.DB_PRODUCTS_FILE ?? './local-db/products.js',
//   backup: process.env.DB_BACKUP_FILE ?? './local-db/backupProducts.js'
// }
