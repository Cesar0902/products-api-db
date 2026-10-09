-- Local demo data, applied only when MySQL initializes an empty data directory.
INSERT INTO categorias (nombre) VALUES
('Tecnología'), ('Hogar'), ('Juguetes'), ('Ropa');

INSERT INTO productos (nombre, precio, descripcion, disponible, categoria_id)
VALUES
('Laptop', 899.99, 'Laptop portátil para el trabajo y el estudio.', TRUE,
    (SELECT id FROM categorias WHERE nombre = 'Tecnología')),
('Lámpara', 35.50, 'Lámpara de escritorio para iluminar el hogar.', TRUE,
    (SELECT id FROM categorias WHERE nombre = 'Hogar')),
('Pelota', 12.00, 'Pelota de colores para juegos al aire libre.', FALSE,
    (SELECT id FROM categorias WHERE nombre = 'Juguetes')),
('Camisa', 29.90, 'Camisa de algodón para uso diario y cómodo.', TRUE,
    (SELECT id FROM categorias WHERE nombre = 'Ropa'));
