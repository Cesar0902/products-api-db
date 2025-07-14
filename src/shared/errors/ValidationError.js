export class ValidationError extends Error {
  constructor(message, issues) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.issues = issues;
  }
}
