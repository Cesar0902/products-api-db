import express, { json } from "express";
import { corsMiddleware } from "./infrastructure/http/corsMiddleware.js";
import { createProductRouter } from "./products/router.js";

export const createApp = ({ productModel }) => {
  const app = express();
  app.use(json());
  app.use(corsMiddleware());
  app.disable("x-powered-by");

  app.use("/productos", createProductRouter({ productModel }));

  return app;
};
