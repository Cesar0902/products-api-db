export class DuplicateResourceError extends Error {
  constructor(message, field, value, resource) {
    super(message);
    this.field = field;
    this.name = "DuplicateResourceError";
    this.statusCode = 409;
    this.message = message;
    this.value = value;
    this.resource = resource;
  }
}
