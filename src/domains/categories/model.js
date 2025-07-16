export class CategoryModel {
  constructor({ db }) {
    this.db = db;
  }

  async getAll() {
    const [categories] = await this.db.query("SELECT * FROM categorias");
    return categories;
  }

  async getById(id) {
    const [categories] = await this.db.query(
      "SELECT * FROM categorias WHERE id = ?",
      [id]
    );

    if (categories.length === 0) {
      return null;
    }

    return categories[0];
  }

  async getByName(name) {
    const categoryName = name.toLowerCase();
    const [categories] = await this.db.query(
      "SELECT id FROM categorias WHERE LOWER(nombre) = ?",
      [categoryName]
    );

    if (categories.length === 0) {
      return null;
    }

    return categories[0];
  }

  async create(categoryData) {
    const { nombre } = categoryData;
    const [result] = await this.db.query(
      "INSERT INTO categorias (nombre) VALUES (?)",
      [nombre]
    );

    return {
      id: result.insertId,
      nombre,
    };
  }

  async update(id, categoryData) {
    const { nombre } = categoryData;
    const [result] = await this.db.query(
      "UPDATE categorias SET nombre = ? WHERE id = ?",
      [nombre, id]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return {
      id: parseInt(id),
      nombre,
    };
  }

  async delete(id) {
    // Verificar si la categoría tiene productos asignados
    const [products] = await this.db.query(
      "SELECT id FROM productos WHERE categoriaId = ?",
      [id]
    );

    if (products.length > 0) {
      throw new Error(
        "No se puede eliminar la categoría porque tiene productos asignados"
      );
    }

    const [result] = await this.db.query(
      "DELETE FROM categorias WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  }
}
