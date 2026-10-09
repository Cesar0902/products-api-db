import express from "express";
import { fileURLToPath } from "node:url";
import { createProductRouter } from "./routes/products.js";
import { createCategoryRouter } from "./routes/categories.js";
import { errorHandler } from "./middleware/error-handler.js";

const frontendPath = fileURLToPath(new URL("../frontend/", import.meta.url));

export function createApp({ db }) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());
  app.use("/productos", createProductRouter(db));
  app.use("/categorias", createCategoryRouter(db));
  app.use(express.static(frontendPath));
  app.use((req, res) => res.status(404).json({ success: false, message: "Ruta no encontrada" }));
  app.use(errorHandler);
  return app;
}
