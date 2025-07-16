import { ValidationError } from "../errors/index.js";

export function parseBooleanQueryParam(param) {
  if (param === undefined) return undefined;
  if (typeof param === "boolean") return param;
  if (param.toLowerCase() === "true") return true;
  if (param.toLowerCase() === "false") return false;
  throw new ValidationError(`Parámetro inválido: ${param}`);
}
