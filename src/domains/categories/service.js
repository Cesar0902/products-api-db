import {
  DuplicateResourceError,
  ValidationError,
  DatabaseError,
} from "../../shared/errors/index.js";
import { z } from "zod";
import { CategorySchema } from "./schema.js";
export class CategoryService {
  constructor({ categoryModel }) {
    this.categoryModel = categoryModel;
  }

  async getAllCategories() {
    return this.categoryModel.getAll();
  }

  async getCategoryById(id) {
    return this.categoryModel.getById(id);
  }

  async createCategory(input) {
    try {
      const validatedData = await CategorySchema.parseAsync(input);
      const newCategory = await this.categoryModel.create(validatedData);
      return newCategory;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError({
          issues: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      if (error.code === "ER_DUP_ENTRY") {
        throw new DuplicateResourceError({
          field: "nombre",
          value: input.nombre,
          resource: "categoría",
          message: `Ya existe una categoría con el nombre '${input.nombre}'`,
        });
      }

      if (error.code === "ER_NO_DEFAULT_FOR_FIELD") {
        throw new ValidationError({
          message: `Campo requerido faltante: ${
            error.sqlMessage.split("'")[1]
          }`,
          issues: [
            {
              field: error.sqlMessage.split("'")[1],
              message: "Este campo es requerido",
            },
          ],
        });
      }

      console.error("Error en CategoryService.createCategory:", error);
      throw new DatabaseError("Error al crear la categoría");
    }
  }

  async updateCategory(id, categoryData) {
    const updatedCategory = await this.categoryModel.update(id, categoryData);
    return updatedCategory
      ? { success: true, data: updatedCategory }
      : { success: false };
  }

  async deleteCategory(id) {
    const result = await this.categoryModel.delete(id);
    return result
      ? { success: true, message: "Categoría eliminada" }
      : { success: false, message: "Categoría no encontrada" };
  }
}
