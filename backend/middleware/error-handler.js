import { ZodError } from "zod";

export function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Error de validación",
      errors: error.issues.map(issue => ({ field: issue.path.join("."), message: issue.message })),
    });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "JSON inválido" });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Solicitud demasiado grande" });
  }
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ success: false, message: "Ya existe un recurso con ese nombre" });
  }
  if (error.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(409).json({ success: false, message: "La categoría tiene productos asignados" });
  }
  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({ success: false, message: "La categoría no existe" });
  }
  const status = error.status || 500;
  res.status(status).json({ success: false, message: status < 500 ? error.message : "Error interno del servidor" });
}
