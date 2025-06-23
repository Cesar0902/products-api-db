export const db = {
  products: process.env.DB_PRODUCTS_FILE ?? './local-db/products.js',
  backup: process.env.DB_BACKUP_FILE ?? './local-db/backupProducts.js'
}