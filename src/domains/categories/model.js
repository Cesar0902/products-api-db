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

    console.log(`Se ha encontrado la categoria ${categories} con ID ${id}`);

    return categories;
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
}
