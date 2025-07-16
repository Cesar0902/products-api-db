import { z } from "zod";

export const CategorySchema = z.object({
  nombre: z
    .string("El nombre debe ser un texto")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede exceder los 50 caracteres"),
});
