export class ValidationError extends Error {
  constructor({ message = "Error de validación", issues } = {}) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.issues = issues || [];
  }
}
