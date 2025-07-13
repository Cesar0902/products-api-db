import { Router } from "express";
import { ProductController } from "./controller.js";

export const createProductRouter = ({ productModel }) => {
  const productsRouter = Router();
  const productController = new ProductController({ productModel });

  productsRouter.get("/", productController.getAll);
  productsRouter.post("/", productController.create);
  productsRouter.get("/disponibles", productController.getAvailable);

  productsRouter.get("/:id", productController.getById);
  productsRouter.delete("/:id", productController.delete);
  productsRouter.put("/:id", productController.update);
  productsRouter.patch("/:id", productController.update);

  return productsRouter;
};
