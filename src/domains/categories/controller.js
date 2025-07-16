import { CategoryService } from "./service.js";
import { NotFoundError } from "../../shared/errors/index.js";

export class CategoryController {
  constructor({ categoryModel }) {
    this.categoryService = new CategoryService({ categoryModel });
  }

  getAll = async (req, res, next) => {
    try {
      const categories = await this.categoryService.getAllCategories();
      res.status(categories.length ? 200 : 404).json({
        success: categories.length > 0,
        data: categories,
        message: categories.length
          ? "Categorías encontradas"
          : "No hay categorías",
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getCategoryById(id);

      if (!category) {
        throw new NotFoundError(`Categoría con ID ${id} no encontrada`);
      }

      res.status(200).json({
        success: true,
        data: category,
        message: `Categoría con ID ${id} encontrada`,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const newCategory = await this.categoryService.createCategory(req.body);
      res.status(201).json({
        success: true,
        data: newCategory,
        message: "Categoría creada exitosamente",
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res) => {
    const { id } = req.params;
    const updatedCategory = await this.categoryService.updateCategory(
      id,
      req.body
    );

    res.status(updatedCategory.success ? 200 : 404).json(updatedCategory);
  };

  delete = async (req, res) => {
    const { id } = req.params;
    const result = await this.categoryService.deleteCategory(id);

    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
    });
  };
}
