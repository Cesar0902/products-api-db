import { Router } from "express";
import { categorySchema, parseId } from "../schemas.js";
import { httpError } from "../middleware/error-handler.js";

export function createCategoryRouter(db) {
  const router = Router();
  router.get("/", async (req, res) => {
    const [rows] = await db.execute("SELECT * FROM categorias ORDER BY id", []);
    res.json({ success: true, data: rows, message: rows.length ? "Categorías encontradas" : "No hay categorías" });
  });
  router.get("/:id", async (req, res) => {
    const id = parseId(req.params.id);
    const [rows] = await db.execute("SELECT * FROM categorias WHERE id = ?", [id]);
    if (!rows.length) throw httpError(404, "Categoría no encontrada");
    res.json({ success: true, data: rows[0], message: "Categoría encontrada" });
  });
  router.post("/", async (req, res) => {
    const { nombre } = categorySchema.parse(req.body);
    const [result] = await db.execute("INSERT INTO categorias (nombre) VALUES (?)", [nombre]);
    res.status(201).json({ success: true, data: { id: result.insertId, nombre }, message: "Categoría creada exitosamente" });
  });
  router.put("/:id", async (req, res) => {
    const id = parseId(req.params.id);
    const { nombre } = categorySchema.parse(req.body);
    const [result] = await db.execute("UPDATE categorias SET nombre = ? WHERE id = ?", [nombre, id]);
    if (!result.affectedRows) throw httpError(404, "Categoría no encontrada");
    res.json({ success: true, data: { id, nombre }, message: "Categoría actualizada exitosamente" });
  });
  router.delete("/:id", async (req, res) => {
    const id = parseId(req.params.id);
    const [products] = await db.execute("SELECT id FROM productos WHERE categoria_id = ? LIMIT 1", [id]);
    if (products.length) throw httpError(409, "No se puede eliminar la categoría porque tiene productos asignados");
    const [result] = await db.execute("DELETE FROM categorias WHERE id = ?", [id]);
    if (!result.affectedRows) throw httpError(404, "Categoría no encontrada");
    res.json({ success: true, message: "Categoría eliminada exitosamente" });
  });
  return router;
}
