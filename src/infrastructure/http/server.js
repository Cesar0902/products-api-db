import "dotenv/config";
import { createApp } from "../../../app.js";
import { db } from "../database/connection.js";
import { ProductModel } from "../../domains/products/model.js";
import { CategoryModel } from "../../domains/categories/model.js";

const productModel = new ProductModel({ db });
const categoriesModel = new CategoryModel({ db });

const app = createApp({ productModel, categoriesModel });

const PORT = process.env.PORT ?? 3000;
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en ${BASE_URL}`);
});
