# Products API

API RESTful para gestión de productos de una tienda desarrollada con Node.js y Express. Los datos se almacenan en un archivo JSON local.

## 🚀 Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita el archivo .env con tus configuraciones

# Ejecutar en modo desarrollo
npm run dev

# O ejecutar directamente
node infrastructure/http/server.js
```

### Alternativa con Node.js 22+

Si tienes **Node.js 22 o superior**, puedes usar la nueva funcionalidad `node --run` para ejecutar scripts definidos en el package.json directamente, sin necesidad de pasar por npm:

```bash
# Ejecutar scripts sin npm (Node.js 22+)
node --run start    # Equivale a npm run start
node --run dev      # Equivale a npm run dev
```

Esta funcionalidad es útil cuando quieres ejecutar scripts rápidamente con menos sobrecarga, ya que evita lanzar procesos adicionales como lo hace npm run.

> ⚠️ **Nota importante:**  
> Las dependencias deben estar previamente instaladas.  
> `node --run` **no reemplaza** a `npm install`, solo evita usar `npm run`.

La API estará disponible en la URL configurada en `BASE_URL` (por defecto `http://localhost:3000`)

## ⚙️ Variables de Entorno

El proyecto utiliza las siguientes variables de entorno:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `3000` |
| `BASE_URL` | URL base de la API | `http://localhost:3000` |
| `DB_PRODUCTS_FILE` | Ruta del archivo de productos | `./local-db/products.js` |
| `DB_BACKUP_FILE` | Ruta del archivo de respaldo | `./local-db/backupProducts.js` |
| `CORS_ORIGINS` | Orígenes permitidos para CORS (separados por coma) | `http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |

**Nota:** Copia el archivo `.env.example` a `.env` y ajusta las variables según tus necesidades.

## 📋 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/productos` | Obtener todos los productos |
| `GET` | `/productos/disponibles` | Obtener solo productos disponibles |
| `GET` | `/productos/:id` | Obtener producto por ID |
| `POST` | `/productos` | Crear nuevo producto |
| `PUT` | `/productos/:id` | Actualizar producto existente |
| `DELETE` | `/productos/:id` | Eliminar producto |

## 📝 Modelo de Datos

Cada producto tiene la siguiente estructura:

```json
{
  "id": 1,
  "nombre": "Nombre del producto",
  "precio": 299.99,
  "descripcion": "Descripción del producto (mínimo 10 caracteres)",
  "disponible": true,
  "fecha_ingreso": "2025-06-22T10:30:00.000Z"
}
```

## ✅ Validaciones

- **nombre**: Requerido, texto no vacío
- **precio**: Requerido, número positivo mayor a cero
- **descripcion**: Requerida, mínimo 10 caracteres
- **disponible**: Requerido, valor booleano

## 🛠️ Tecnologías

- Node.js
- Express.js
- Zod (validaciones)
- JSON local (persistencia)