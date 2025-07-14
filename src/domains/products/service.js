import {
  DatabaseError,
  DuplicateResourceError,
  NotFoundError,
  ValidationError,
} from "../../shared/errors/index.js";
import { validateProduct, validatePartialProduct } from "./schema.js";

export class ProductService {
  constructor({ productModel, categoriesModel }) {
    this.productModel = productModel;
    this.categoriesModel = categoriesModel;
  }

  async getAllProducts({ disponible } = {}) {
    const products = await this.productModel.getAll({ disponible });

    return {
      success: products.length > 0,
      data: products,
      message: this._getMessageForProductList(products, disponible),
    };
  }

  async getProductById(id) {
    const product = await this.productModel.getById({ id });

    if (product.length === 0) {
      return {
        success: false,
        data: null,
        message: `No se encontró el producto con ID ${id}`,
      };
    }

    return {
      success: true,
      data: product,
      message: `Se ha encontrado el producto '${product.nombre}'`,
    };
  }

  async getAvailableProducts() {
    const products = await this.productModel.getAvailable();

    return {
      success: products.length > 0,
      data: products,
      message: this._getMessageForProductList(products, true),
    };
  }

  async createProduct(productData) {
    const validationResult = validateProduct(productData);

    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
        received: issue.received,
      }));

      throw new ValidationError("Error de validación", issues);
    }

    // Validar que el nombre del producto no exista ya en la base de datos
    const existingProduct = await this.productModel.getByName({
      nombre: validationResult.data.nombre,
    });

    if (existingProduct.length > 0) {
      throw new DuplicateResourceError(
        `Ya existe un producto con el nombre '${validationResult.data.nombre}'`,
        "nombre",
        validationResult.data.nombre,
        "producto"
      );
    }

    const { categoria } = validationResult.data;
    const categoryExists = await this.categoriesModel.existsByName(categoria);
    if (!categoryExists) {
      throw new NotFoundError(`Categoría '${categoria}' no encontrada.`);
    }

    try {
      return await this.productModel.create({
        input: {
          ...validationResult.data,
          categoria_id: categoryExists.id,
        },
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new DuplicateResourceError(
          `Ya existe un producto con el nombre '${validationResult.data.nombre}'`,
          "nombre",
          validationResult.data.nombre,
          "producto"
        );
      }
      throw new DatabaseError("crear producto", error.message);
    }
  }

  async updateProduct(id, productData) {
    // Validación de datos
    const validationResult = validatePartialProduct(productData);

    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
        received: issue.received,
      }));

      return {
        success: false,
        data: null,
        message: "Error de validación",
        errors: issues,
        statusCode: 400,
      };
    }

    try {
      const updatedProduct = await this.productModel.update({
        id,
        input: validationResult.data,
      });

      if (!updatedProduct) {
        return {
          success: false,
          data: null,
          message: "Producto no encontrado",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: updatedProduct,
        message: "Producto actualizado exitosamente",
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error interno al actualizar producto:", error);
      return {
        success: false,
        data: null,
        message: "Error interno al actualizar el producto.",
        error: error.code || "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  }

  async deleteProduct(id) {
    const result = await this.productModel.delete({ id });

    if (result === false) {
      return {
        success: false,
        message: "Producto no encontrado",
        statusCode: 404,
      };
    }

    return {
      success: true,
      message: "Producto eliminado exitosamente",
      statusCode: 200,
    };
  }

  // Método privado para generar mensajes apropiados
  _getMessageForProductList(products, disponible) {
    const foundProducts = products.length > 0;

    // Validar si hay filtro disponible o no
    let isFilteringAvailable = undefined;
    if (disponible === "true" || disponible === true) {
      isFilteringAvailable = true;
    } else if (disponible === "false" || disponible === false) {
      isFilteringAvailable = false;
    }

    if (foundProducts) {
      // Si se encontraron productos
      if (isFilteringAvailable === true) {
        return "Productos disponibles encontrados.";
      } else if (isFilteringAvailable === false) {
        return "Productos no disponibles encontrados.";
      } else {
        // Esto se ejecuta si 'disponible' era undefined (no se filtró por disponibilidad)
        return "Productos encontrados.";
      }
    } else {
      // Si NO se encontraron productos
      if (isFilteringAvailable === true) {
        return "No se han encontrado productos disponibles.";
      } else if (isFilteringAvailable === false) {
        return "No se han encontrado productos no disponibles.";
      } else {
        // Esto se ejecuta si 'disponible' era undefined y no se encontró nada
        return "No se han encontrado productos.";
      }
    }
  }
}
