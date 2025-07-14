import express, { json } from "express";
import {
  corsMiddleware,
  errorMiddleware,
} from "./src/infrastructure/http/index.js";
import { createProductRouter } from "./src/domains/products/router.js";

export const createApp = ({ productModel, categoriesModel }) => {
  const app = express();
  app.use(json());
  app.use(corsMiddleware());
  app.disable("x-powered-by");

  app.use("/productos", createProductRouter({ productModel, categoriesModel }));

  app.use(errorMiddleware);

  return app;
};
