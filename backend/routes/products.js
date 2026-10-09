import { Router } from "express";
import { productSchema, partialProductSchema, parseId, parseAvailability } from "../schemas.js";
import { httpError } from "../middleware/error-handler.js";

const selectProducts = `SELECT p.*, c.nombre AS categoria
  FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id`;

function serializeProduct(row) {
  return { ...row, precio: Number(row.precio), disponible: Boolean(Number(row.disponible)) };
}

export function createProductRouter(db) {
  const router = Router();

  async function findProduct(id) {
    const [rows] = await db.execute(`${selectProducts} WHERE p.id = ?`, [id]);
    if (!rows.length) throw httpError(404, "Producto no encontrado");
    return serializeProduct(rows[0]);
  }

  async function findCategory(nombre) {
    const [rows] = await db.execute("SELECT id FROM categorias WHERE LOWER(nombre) = LOWER(?)", [nombre]);
    if (!rows.length) throw httpError(400, `Categoría '${nombre}' no encontrada`);
    return rows[0].id;
  }

  async function checkName(nombre, id) {
    const [rows] = await db.execute(
      `SELECT id FROM productos WHERE nombre = ?${id === undefined ? "" : " AND id <> ?"}`,
      id === undefined ? [nombre] : [nombre, id],
    );
    if (rows.length) throw httpError(409, `Ya existe un producto con el nombre '${nombre}'`);
  }

  async function list(req, res, availableOnly = false) {
    const disponible = availableOnly ? true : parseAvailability(req.query.disponible);
    const [rows] = await db.execute(
      `${selectProducts}${disponible === undefined ? "" : " WHERE p.disponible = ?"} ORDER BY p.id`,
      disponible === undefined ? [] : [disponible],
    );
    res.json({ success: true, data: rows.map(serializeProduct), message: rows.length ? "Productos encontrados" : "No hay productos" });
  }

  router.get("/", (req, res) => list(req, res));
  router.get("/disponibles", (req, res) => list(req, res, true));
  router.get("/:id", async (req, res) => {
    const product = await findProduct(parseId(req.params.id));
    res.json({ success: true, data: [product], message: `Se ha encontrado el producto '${product.nombre}'` });
  });

  router.post("/", async (req, res) => {
    const input = productSchema.parse(req.body);
    await checkName(input.nombre);
    const categoryId = await findCategory(input.categoria);
    const [result] = await db.execute(
      "INSERT INTO productos (nombre, precio, descripcion, disponible, categoria_id) VALUES (?, ?, ?, ?, ?)",
      [input.nombre, input.precio, input.descripcion, input.disponible ?? true, categoryId],
    );
    const product = await findProduct(result.insertId);
    res.status(201).json({ success: true, data: product, message: "Producto creado exitosamente" });
  });

  async function update(req, res) {
    const id = parseId(req.params.id);
    const input = partialProductSchema.parse(req.body);
    await findProduct(id);
    if (input.nombre !== undefined) await checkName(input.nombre, id);
    const changes = { ...input };
    if (input.categoria !== undefined) {
      changes.categoria_id = await findCategory(input.categoria);
      delete changes.categoria;
    }
    // Column names come only from the strict schema, never from unvalidated input.
    const columns = Object.keys(changes);
    const [result] = await db.execute(
      `UPDATE productos SET ${columns.map(column => `${column} = ?`).join(", ")} WHERE id = ?`,
      [...Object.values(changes), id],
    );
    if (!result.affectedRows) throw httpError(404, "Producto no encontrado");
    const product = await findProduct(id);
    res.json({ success: true, data: product, message: "Producto actualizado exitosamente" });
  }
  router.put("/:id", update);
  router.patch("/:id", update);
  router.delete("/:id", async (req, res) => {
    const [result] = await db.execute("DELETE FROM productos WHERE id = ?", [parseId(req.params.id)]);
    if (!result.affectedRows) throw httpError(404, "Producto no encontrado");
    res.json({ success: true, message: "Producto eliminado exitosamente" });
  });
  return router;
}
