-- The MySQL image selects MYSQL_DATABASE before running this file.
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    CONSTRAINT categorias_nombre_unique UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    descripcion TEXT NOT NULL,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_ingreso TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    categoria_id INT NOT NULL,
    CONSTRAINT productos_nombre_unique UNIQUE (nombre),
    CONSTRAINT productos_precio_positive CHECK (precio > 0),
    CONSTRAINT productos_disponible_boolean CHECK (disponible IN (0, 1)),
    CONSTRAINT productos_categoria_fk FOREIGN KEY (categoria_id)
        REFERENCES categorias(id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
