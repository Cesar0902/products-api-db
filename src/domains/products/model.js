import { DuplicateResourceError } from "../../shared/errors/DuplicateResourceError.js";

export class ProductModel {
  constructor({ db }) {
    this.db = db;
  }

  async getAll({ disponible } = {}) {
    const isAvailable = disponible === "true" || disponible === true;

    if (disponible === undefined) {
      const [products] = await this.db.query("SELECT * FROM productos");
      return products;
    }

    const [products] = await this.db.query(
      "SELECT * FROM productos WHERE disponible = ?",
      [isAvailable]
    );

    return products;
  }

  async getAvailable() {
    const [productsAvailable] = await this.db.query(
      "SELECT * FROM productos WHERE disponible = true"
    );
    return productsAvailable;
  }

  async getById({ id }) {
    const [products] = await this.db.query(
      "SELECT * FROM productos WHERE id = ?",
      [id]
    );
    return products;
  }

  async getByName({ nombre }) {
    const [products] = await this.db.query(
      "SELECT * FROM productos WHERE nombre = ?",
      [nombre]
    );
    return products;
  }

  async create({ input }) {
    try {
      await this.db.beginTransaction();
      const { nombre, precio, descripcion, disponible, categoria_id } = input;

      const [result] = await this.db.query(
        `INSERT INTO tienda.productos
        (nombre, precio, descripcion, disponible, fecha_ingreso, categoria_id)
        VALUES(?, ?, ?, ?, CURRENT_TIMESTAMP, ?);`,
        [nombre, precio, descripcion, disponible, categoria_id]
      );
      const newProductId = result.insertId;

      // Verificar si se obtuvo un ID válido
      if (!newProductId) {
        throw new Error(
          "No se pudo obtener el ID del nuevo producto después de la inserción."
        );
      }

      // Obtener los datos completos del producto recién creado por su ID.
      const [newProductRows] = await this.db.query(
        "SELECT * FROM productos WHERE id = ?",
        [newProductId]
      );

      const newProduct = newProductRows.length > 0 ? newProductRows[0] : null;

      // Verificar si el producto fue encontrado después de la inserción
      if (!newProduct) {
        throw new Error(
          `Producto con ID ${newProductId} no encontrado después de la inserción.`
        );
      }

      await this.db.commit();

      return newProduct;
    } catch (error) {
      await this.db.rollback();
      console.error("Error en la transacción de creación de producto:", error);
      throw new Error(
        "No se pudo crear el producto debido a un error en la base de datos."
      );
    }
  }

  async update({ id, input }) {
    const products = await this.db.query("SELECT * FROM productos");
    const productId = parseInt(id);
    const productIndex = products.findIndex(
      (product) => product.id === productId
    );

    if (productIndex === -1) {
      return null;
    }

    // Check for duplicate product name (excluding current product)
    if (input.nombre) {
      const existingProduct = products.find(
        (product) =>
          product.nombre.toLowerCase() === input.nombre.toLowerCase() &&
          product.id !== productId
      );

      if (existingProduct) {
        throw new DuplicateResourceError(
          `Ya existe un producto con el nombre '${input.nombre}'`
        );
      }
    }

    // Update product
    const updatedProduct = {
      ...products[productIndex],
      ...input,
    };

    products[productIndex] = updatedProduct;
    // await this.#writeProducts(products);

    return updatedProduct;
  }

  async delete({ id }) {
    const products = await this.db.query("SELECT * FROM productos");
    const productId = parseInt(id);
    const productIndex = products.findIndex(
      (product) => product.id === productId
    );

    if (productIndex === -1) {
      return false;
    }

    products.splice(productIndex, 1);
    // await this.#writeProducts(products);

    return true;
  }
}
