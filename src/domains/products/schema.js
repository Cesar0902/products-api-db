import { z } from "zod";

const productSchema = z.object({
  nombre: z
    .string("El nombre debe ser un string")
    .min(1, "El nombre no puede estar vacío"),

  precio: z
    .number("El precio debe ser un número")
    .positive("El precio debe ser mayor a cero"),

  descripcion: z
    .string("La descripción debe ser un string")
    .min(10, "La descripción debe tener mínimo 10 caracteres"),

  categoria: z
    .string("La categoría debe ser un string")
    .min(1, "La categoría no puede estar vacía"),

  disponible: z.boolean("El campo disponible debe ser un boolean").optional(),
});

export function validateProduct(input) {
  return productSchema.safeParse(input);
}

export function validatePartialProduct(input) {
  return productSchema.partial().safeParse(input);
}
