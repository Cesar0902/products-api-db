import {
  ValidationError,
  NotFoundError,
  DuplicateResourceError,
  DatabaseError,
} from "../../shared/errors/index.js";

export function errorMiddleware(err, req, res, next) {
  console.error("Error middleware:", err);

  // Respuesta base
  const response = {
    success: false,
    message: err.message || "Error interno del servidor",
  };

  // Añadir detalles específicos según tipo de error
  if (err instanceof ValidationError) {
    return res.status(400).json({
      ...response,
      errors: err.issues,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json(response);
  }

  if (err instanceof DuplicateResourceError) {
    return res.status(409).json({
      ...response,
      details: [{ field: err.field, value: err.value, resource: err.resource }],
    });
  }

  if (err instanceof DatabaseError) {
    // En producción, ocultar detalles internos
    if (process.env.NODE_ENV === "production") {
      response.message = "Error de base de datos";
    }
    return res.status(500).json(response);
  }

  // Error no reconocido
  res.status(500).json(response);
}
