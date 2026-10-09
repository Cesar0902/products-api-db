import { z } from "zod";
import { httpError } from "./middleware/error-handler.js";

export const productSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
  precio: z.number().positive().max(99999999.99),
  descripcion: z.string().trim().min(10).max(16000),
  categoria: z.string().trim().min(1).max(100),
  disponible: z.boolean().optional(),
}).strict();

export const partialProductSchema = productSchema.partial().refine(
  input => Object.keys(input).length > 0,
  { message: "Debe incluir al menos un campo" },
);

export const categorySchema = z.object({
  nombre: z.string().trim().min(3).max(50),
}).strict();

export function parseId(value) {
  if (!/^[1-9]\d*$/.test(value) || Number(value) > 2147483647) {
    throw httpError(400, "ID inválido");
  }
  return Number(value);
}

export function parseAvailability(value) {
  if (value === undefined) return undefined;
  if (typeof value === "string" && /^(true|false)$/i.test(value)) {
    return value.toLowerCase() === "true";
  }
  throw httpError(400, "El parámetro disponible debe ser true o false");
}
