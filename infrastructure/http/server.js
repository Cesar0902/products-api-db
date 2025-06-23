import 'dotenv/config'
import { createApp } from '../../app.js'
import { ProductModel } from '../../products/model.js'
import { db } from '../connection.js'

console.log('Datos de conexión a la base de datos:', db)

const productModel = new ProductModel({ db })

const app = createApp({ productModel })

const PORT = process.env.PORT ?? 3000
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`

app.listen(PORT, () => {
  console.log(`Servidor escuchando en ${BASE_URL}`)
})
