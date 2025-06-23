import { z } from 'zod'

const productSchema = z.object({
  nombre: z.string({
    required_error: 'El nombre es requerido',
    invalid_type_error: 'El nombre debe ser un string'
  }).min(1, 'El nombre no puede estar vacío'),
  
  precio: z.number({
    required_error: 'El precio es requerido',
    invalid_type_error: 'El precio debe ser un número'
  }).positive('El precio debe ser mayor a cero'),
  
  descripcion: z.string({
    required_error: 'La descripción es requerida',
    invalid_type_error: 'La descripción debe ser un string'
  }).min(10, 'La descripción debe tener mínimo 10 caracteres'),
  
  disponible: z.boolean({
    invalid_type_error: 'El campo disponible debe ser un boolean'
  }).optional()
})

export function validateProduct(input) {
  return productSchema.safeParse(input)
}

export function validatePartialProduct(input) {
  return productSchema.partial().safeParse(input)
}