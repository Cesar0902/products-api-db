export class DatabaseError extends Error {
  constructor(operation, details = "") {
    super(`Error en la operación de base de datos: ${operation}. ${details}`);
    this.name = "DatabaseError";
    this.statusCode = 500; // Internal Server Error
  }
}
