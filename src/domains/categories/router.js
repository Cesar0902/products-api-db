import { Router } from "express";
import { CategoryController } from "./controller.js";

export const createCategoryRouter = ({ categoriesModel }) => {
  const categoriesRouter = Router();
  const categoryController = new CategoryController({ categoriesModel });

  categoriesRouter.get("/", categoryController.getAll);
  categoriesRouter.get("/:id", categoryController.getById);
  categoriesRouter.post("/", categoryController.create);
  categoriesRouter.put("/:id", categoryController.update);
  categoriesRouter.delete("/:id", categoryController.delete);

  return categoriesRouter;
};
