import {
  DuplicateResourceError,
  ValidationError,
  DatabaseError,
  NotFoundError,
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
      // Verificar que el input no esté vacío
      if (!input || typeof input !== "object") {
        throw new ValidationError({
          message: "Datos de entrada inválidos",
          issues: [
            {
              field: "input",
              message:
                "Los datos de entrada son requeridos y deben ser un objeto",
            },
          ],
        });
      }

      const validatedData = await CategorySchema.parseAsync(input);
      const newCategory = await this.categoryModel.create(validatedData);
      return newCategory;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      if (error instanceof z.ZodError) {
        throw new ValidationError({
          issues:
            error.errors?.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })) || [],
        });
      }

      if (error.code === "ER_DUP_ENTRY") {
        throw new DuplicateResourceError({
          field: "nombre",
          value: input?.nombre,
          resource: "categoría",
          message: `Ya existe una categoría con el nombre '${input?.nombre}'`,
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
    try {
      const validatedData = await CategorySchema.parseAsync(categoryData);
      const updatedCategory = await this.categoryModel.update(
        id,
        validatedData
      );

      if (!updatedCategory) {
        throw new NotFoundError(`Categoría con ID ${id} no encontrada`);
      }

      return updatedCategory;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError({
          issues:
            error.errors?.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })) || [],
        });
      }

      if (error.code === "ER_DUP_ENTRY") {
        throw new DuplicateResourceError({
          field: "nombre",
          value: categoryData.nombre,
          resource: "categoría",
          message: `Ya existe una categoría con el nombre '${categoryData.nombre}'`,
        });
      }

      throw error;
    }
  }

  async deleteCategory(id) {
    try {
      const result = await this.categoryModel.delete(id);

      if (!result) {
        throw new NotFoundError(`Categoría con ID ${id} no encontrada`);
      }

      return { success: true, message: "Categoría eliminada exitosamente" };
    } catch (error) {
      if (
        error.message ===
        "No se puede eliminar la categoría porque tiene productos asignados"
      ) {
        throw new ValidationError({
          message:
            "No se puede eliminar la categoría porque tiene productos asignados",
          issues: [
            {
              field: "categoriaId",
              message:
                "Esta categoría tiene productos asignados y no puede ser eliminada",
            },
          ],
        });
      }

      throw error;
    }
  }
}
