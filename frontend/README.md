# Frontend - Gestión de Productos

Frontend web desarrollado para consumir la API REST de productos. Proporciona una interfaz moderna y responsive para gestionar productos de manera intuitiva.

## 📁 Estructura del Proyecto

```
products-api/
├── api.http                          # Archivo de pruebas REST Client
├── app.js                           # Configuración principal de Express
├── package.json                     # Dependencias del proyecto
├── README.md                        # Documentación principal del proyecto
├── .env                            # Variables de entorno
├── .env.example                    # Ejemplo de variables de entorno
├── .gitignore                      # Archivos ignorados por Git
├── frontend/                       # 📂 FRONTEND (esta carpeta)
│   ├── index.html                  # Página principal del frontend
│   ├── styles.css                  # Estilos CSS del frontend
│   ├── script.js                   # Lógica JavaScript del frontend
│   └── README.md                   # Documentación del frontend
├── infrastructure/                 # Configuración de infraestructura
│   ├── connection.js              # Configuración de base de datos
│   ├── http/
│   │   ├── corsMiddleware.js      # Middleware de CORS
│   │   └── server.js              # Servidor HTTP principal
│   └── local-db/
│       ├── products.js            # Base de datos local de productos
│       └── backupProducts.js      # Respaldo de productos
├── products/                      # Módulo de productos (Backend)
│   ├── controller.js              # Controladores de productos
│   ├── model.js                   # Modelo de datos de productos
│   ├── router.js                  # Rutas de productos
│   ├── schema.js                  # Esquemas de validación
│   └── service.js                 # Servicios de negocio
└── shared/                        # Código compartido
    └── errors/
        └── DuplicateResourceError.js  # Error personalizado
```

## 🌟 Características

- **Interfaz moderna y responsive** - Funciona perfectamente en desktop, tablet y móvil
- **Gestión completa de productos** - Crear, editar, eliminar y visualizar productos
- **Filtros avanzados** - Buscar por nombre, filtrar por disponibilidad
- **Estadísticas en tiempo real** - Resumen de productos totales, disponibles y no disponibles
- **Validación de formularios** - Validación tanto del lado del cliente como del servidor
- **Mensajes informativos** - Notificaciones de éxito, error y advertencia
- **Carga dinámica** - Indicadores de carga durante las operaciones

## 🚀 Cómo usar el Frontend

### Opción 1: Servidor HTTP Simple (Recomendado)

```bash
# Desde el directorio frontend
cd frontend

# Python 3
python -m http.server 8080

# O con Python 2
python -m SimpleHTTPServer 8080

# O con Node.js (si tienes http-server instalado)
npx http-server -p 8080
```

### Opción 2: Abrir directamente en el navegador

Puedes abrir el archivo `index.html` directamente en tu navegador, pero algunas funcionalidades podrían tener limitaciones debido a las políticas CORS.

### Opción 3: Usar Live Server de VS Code

Si usas VS Code, instala la extensión "Live Server" y haz clic derecho en `index.html` > "Open with Live Server".

## 📋 Instrucciones de Uso

### 1. Iniciar el Backend
Antes de usar el frontend, asegúrate de que tu API esté corriendo:

```bash
# Desde el directorio raíz del proyecto
npm run dev
```

La API debe estar disponible en `http://localhost:3000`

### 2. Acceder al Frontend
Una vez que hayas iniciado el servidor HTTP, abre tu navegador y ve a:
- `http://localhost:8080` (si usaste el servidor HTTP en puerto 8080)
- O la URL que te proporcione tu servidor

### 3. Funcionalidades Disponibles

#### Visualizar Productos
- La lista de productos se carga automáticamente al abrir la aplicación
- Cada producto muestra: nombre, precio, categoría, descripción, estado y fecha de ingreso
- Las estadísticas se actualizan automáticamente

#### Crear Nuevo Producto
1. Haz clic en "Nuevo Producto"
2. Completa el formulario:
   - **Nombre**: Requerido, debe ser único
   - **Precio**: Requerido, debe ser mayor a 0
   - **Categoría**: Opcional
   - **Descripción**: Requerida, mínimo 10 caracteres
   - **Disponible**: Checkbox para marcar disponibilidad
3. Haz clic en "Crear Producto"

#### Editar Producto
1. Haz clic en "Editar" en la tarjeta del producto
2. Modifica los campos necesarios
3. Haz clic en "Actualizar Producto"

#### Eliminar Producto
1. Haz clic en "Eliminar" en la tarjeta del producto
2. Confirma la eliminación en el modal

#### Filtrar y Buscar
- **Filtrar por disponibilidad**: Usa el dropdown para mostrar solo productos disponibles o no disponibles
- **Buscar**: Escribe en el campo de búsqueda para filtrar por nombre, descripción o categoría
- Los filtros se pueden combinar

#### Actualizar Lista
- Haz clic en "Actualizar" para recargar la lista de productos desde el servidor

## 🎨 Características de la Interfaz

### Responsive Design
- **Desktop**: Vista en grid con múltiples columnas
- **Tablet**: Vista adaptada con menos columnas
- **Móvil**: Vista de una sola columna optimizada para touch

### Componentes Principales
- **Header**: Título y botones principales
- **Filtros**: Controles para filtrar y buscar productos
- **Estadísticas**: Resumen numérico de productos
- **Grid de Productos**: Tarjetas con información de cada producto
- **Modales**: Formularios para crear/editar y confirmación de eliminación

### Estados de la Aplicación
- **Cargando**: Indicador mientras se realizan operaciones
- **Lista vacía**: Mensaje cuando no hay productos
- **Errores**: Mensajes de error con iconos distintivos
- **Éxito**: Confirmaciones de operaciones exitosas

## 🔧 Configuración

### Cambiar URL de la API
Si tu API corre en una URL diferente, modifica la constante en `script.js`:

```javascript
const API_BASE_URL = 'http://tu-servidor:puerto';
```

### Personalizar Estilos
Los estilos están organizados en `styles.css` con variables CSS para fácil personalización:

```css
:root {
    --primary-color: #3498db;  /* Color principal */
    --success-color: #27ae60;  /* Color de éxito */
    --danger-color: #e74c3c;   /* Color de peligro */
    /* ... más variables */
}
```

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con Flexbox y Grid
- **JavaScript (ES6+)**: Lógica de la aplicación
- **Font Awesome**: Iconos
- **Fetch API**: Comunicación con el backend

## 📱 Compatibilidad

- **Navegadores modernos**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, tablet, móvil
- **Resoluciones**: Desde 320px hasta pantallas grandes

## 🐛 Solución de Problemas

### El frontend no puede conectarse a la API
1. Verifica que la API esté corriendo en `http://localhost:3000`
2. Revisa la configuración CORS en el archivo `.env` del backend
3. Abre las herramientas de desarrollador (F12) para ver errores en la consola

### Los productos no se cargan
1. Verifica la URL de la API en `script.js`
2. Comprueba que el backend tenga datos en `infrastructure/local-db/products.js`
3. Revisa los logs del servidor backend

### Errores de CORS
El archivo `.env` del backend ya incluye los puertos comunes del frontend:
```
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://localhost:8080,http://127.0.0.1:8080
```

Si usas un puerto diferente, agrégalo a esta lista.

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias, puedes:
1. Revisar los logs en la consola del navegador (F12)
2. Verificar los logs del servidor backend
3. Comprobar que todas las dependencias estén instaladas

---

¡Disfruta gestionando tus productos con esta interfaz moderna y funcional! 🎉