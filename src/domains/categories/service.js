export class CategoryService {
  constructor({ categoriesModel }) {
    this.categoriesModel = categoriesModel;
  }

  async getAllCategories() {
    return this.categoriesModel.getAll();
  }

  async getCategoryById(id) {
    return this.categoriesModel.getById(id);
  }

  async createCategory(categoryData) {
    const existingCategory = await this.categoriesModel.getByName(
      categoryData.name
    );
    if (existingCategory) {
      throw new Error("Category already exists");
    }
    return this.categoriesModel.create(categoryData);
  }

  async updateCategory(id, categoryData) {
    const updatedCategory = await this.categoriesModel.update(id, categoryData);
    return updatedCategory
      ? { success: true, data: updatedCategory }
      : { success: false };
  }

  async deleteCategory(id) {
    const result = await this.categoriesModel.delete(id);
    return result
      ? { success: true, message: "Categoría eliminada" }
      : { success: false, message: "Categoría no encontrada" };
  }
}
