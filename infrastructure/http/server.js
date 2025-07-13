import "dotenv/config";
import { createApp } from "../../app.js";
import { ProductModel } from "../../products/model.js";
import { db } from "../database/connection.js";

const productModel = new ProductModel({ db });

const app = createApp({ productModel });

const PORT = process.env.PORT ?? 3000;
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en ${BASE_URL}`);
});
