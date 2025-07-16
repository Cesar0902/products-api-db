import express, { json } from "express";
import {
  corsMiddleware,
  errorMiddleware,
} from "./src/infrastructure/http/index.js";
import { createProductRouter } from "./src/domains/products/router.js";
import { createCategoryRouter } from "./src/domains/categories/router.js";

export const createApp = ({ productModel, categoryModel }) => {
  const app = express();
  app.use(json());
  app.use(corsMiddleware());
  app.disable("x-powered-by");

  app.use("/productos", createProductRouter({ productModel, categoryModel }));
  app.use("/categorias", createCategoryRouter({ categoryModel }));

  app.use(errorMiddleware);

  return app;
};
