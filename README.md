**codigo base de datos**

-- Limpiar tablas si ya existían para crearlas con la estructura correcta
DROP TABLE IF EXISTS detalle_pedido CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS redes_sociales CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS paises_origen CASCADE;

-- 1. Países de origen
CREATE TABLE paises_origen (
    id_pais SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- 2. Redes sociales
CREATE TABLE redes_sociales (
    id_red_social SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    url_base VARCHAR(150)
);

-- 3. Usuarios (Con sus atributos completos)
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(150),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_pais INTEGER,
    CONSTRAINT fk_usuario_pais
        FOREIGN KEY (id_pais)
        REFERENCES paises_origen(id_pais)
        ON DELETE SET NULL
);

-- 4. Categorías
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    descripcion TEXT NOT NULL,
    icono_categoria VARCHAR(120) NOT NULL
);

-- 5. Productos (Con sus atributos completos y relación con usuario/vendedor)
CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    estado_fisico VARCHAR(30) NOT NULL,
    imagen_url VARCHAR(255),
    disponible BOOLEAN DEFAULT TRUE,
    id_categoria INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    CONSTRAINT fk_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
        ON DELETE CASCADE,
    CONSTRAINT fk_producto_vendedor
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);

-- 6. Pedidos (Con sus atributos completos)
CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    total_pagar NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_pedido_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);

-- 7. Detalle del pedido (Con sus atributos completos)
CREATE TABLE detalle_pedido (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL,
    CONSTRAINT fk_detalle_pedido
        FOREIGN KEY (id_pedido)
        REFERENCES pedidos(id_pedido)
        ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
        ON DELETE RESTRICT
);

\dt

insercionn tablas

-- 1. Países de origen (10 registros)
INSERT INTO paises_origen (nombre) VALUES 
('Colombia'),
('México'),
('Argentina'),
('España'),
('Chile'),
('Perú'),
('Estados Unidos'),
('Brasil'),
('Uruguay'),
('Ecuador');

-- 2. Redes sociales (10 registros)
INSERT INTO redes_sociales (nombre, url_base) VALUES 
('Instagram', 'https://instagram.com/'),
('Facebook', 'https://facebook.com/'),
('X (Twitter)', 'https://x.com/'),
('TikTok', 'https://tiktok.com/'),
('LinkedIn', 'https://linkedin.com/'),
('YouTube', 'https://youtube.com/'),
('Pinterest', 'https://pinterest.com/'),
('WhatsApp', 'https://wa.me/'),
('Telegram', 'https://t.me/'),
('Reddit', 'https://reddit.com/r/');

-- 3. Usuarios (10 registros)
INSERT INTO usuarios (nombre, email, contrasena, telefono, direccion, id_pais) VALUES 
('Anamaria Forigua', 'anamaria@example.com', 'hash123', '3001112233', 'Calle 100 # 15-20', 1),
('Carlos Perez', 'carlos@example.com', 'hash456', '3102223344', 'Carrera 7 # 45-60', 1),
('Sofia Gomez', 'sofia@example.com', 'hash789', '3203334455', 'Av. Insurgentes 400', 2),
('Mateo Silva', 'mateo@example.com', 'hash321', '3114445566', 'Calle Corrientes 1200', 3),
('Lucia Fernandez', 'lucia@example.com', 'hash654', '3155556677', 'Gran Vía 28', 4),
('Diego Torres', 'diego@example.com', 'hash987', '3166667788', 'Av. Providencia 1000', 5),
('Valentina Ruiz', 'valentina@example.com', 'hash111', '3177778899', 'Av. Larco 450', 6),
('John Doe', 'john@example.com', 'hash222', '3188889900', '123 Main St', 7),
('Mariana Santos', 'mariana@example.com', 'hash333', '3199990011', 'Av. Paulista 500', 8),
('Alejandro Gomez', 'alejandro@example.com', 'hash444', '3000001122', 'Av. 8 de Octubre 2000', 9);

-- 4. Categorías (10 registros)
INSERT INTO categorias (nombre, descripcion, icono_categoria) VALUES 
('Tecnología', 'Dispositivos electrónicos y electrodomésticos', 'tech.png'),
('Ropa y Moda', 'Prendas de vestir y accesorios', 'fashion.png'),
('Hogar y Muebles', 'Artículos para el hogar y decoración', 'home.png'),
('Deportes', 'Equipamiento y ropa deportiva', 'sports.png'),
('Libros y Revistas', 'Literatura, textos académicos y cómics', 'books.png'),
('Vehículos y Repuestos', 'Accesorios y partes para automóviles', 'cars.png'),
('Música y Hobbies', 'Instrumentos musicales y coleccionables', 'music.png'),
('Belleza y Cuidado', 'Productos de cuidado personal', 'beauty.png'),
('Juguetes y Bebés', 'Artículos infantiles y juguetes', 'toys.png'),
('Herramientas', 'Herramientas de trabajo y ferretería', 'tools.png');

-- 5. Productos (10 registros)
INSERT INTO productos (nombre, descripcion, precio, estado_fisico, imagen_url, disponible, id_categoria, id_usuario) VALUES 
('Laptop Lenovo ThinkPad', 'Core i5 8va gen, 8GB RAM', 750000.00, 'Buen estado', 'laptop.jpg', TRUE, 1, 1),
('Chaqueta de cuero vintage', 'Talla M, color negro', 120000.00, 'Como nuevo', 'chaqueta.jpg', TRUE, 2, 2),
('Mesa de centro de madera', 'Estilo rústico, buen estado', 200000.00, 'Usado', 'mesa.jpg', TRUE, 3, 3),
('Bicicleta de ruta rin 28', 'Marco de aluminio', 950000.00, 'Buen estado', 'bici.jpg', TRUE, 4, 4),
('Colección libros de Harry Potter', 'Pasta dura, 7 libros', 180000.00, 'Como nuevo', 'libros.jpg', TRUE, 5, 5),
('Casco para moto abatible', 'Certificado DOT, talla L', 150000.00, 'Nuevo', 'casco.jpg', TRUE, 6, 6),
('Guitarra acústica Yamaha', 'Incluye estuche', 450000.00, 'Buen estado', 'guitarra.jpg', TRUE, 7, 7),
('Secadora de cabello profesional', '2200W con difusor', 75000.00, 'Buen estado', 'secadora.jpg', TRUE, 8, 8),
('Consola Nintendo Switch Lite', 'Color turquesa con estuche', 600000.00, 'Como nuevo', 'switch.jpg', TRUE, 1, 9),
('Taladro percutor inalambrico', 'Incluye batería y cargador', 250000.00, 'Buen estado', 'taladro.jpg', TRUE, 10, 10);

-- 6. Pedidos (10 registros)
INSERT INTO pedidos (id_usuario, estado, total_pagar) VALUES 
(2, 'pendiente', 120000.00),
(3, 'completado', 750000.00),
(4, 'en_camino', 200000.00),
(5, 'cancelado', 950000.00),
(6, 'completado', 180000.00),
(7, 'pendiente', 150000.00),
(8, 'en_camino', 450000.00),
(9, 'completado', 75000.00),
(10, 'pendiente', 600000.00),
(1, 'completado', 250000.00);

-- 7. Detalle del pedido (10 registros)
INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES 
(1, 2, 1, 120000.00),
(2, 1, 1, 750000.00),
(3, 3, 1, 200000.00),
(4, 4, 1, 950000.00),
(5, 5, 1, 180000.00),
(6, 6, 1, 150000.00),
(7, 7, 1, 450000.00),
(8, 8, 1, 75000.00),
(9, 9, 1, 600000.00),
(10, 10, 1, 250000.00);


**VISTA PEDIDO CON PRODUCTO**

CREATE OR REPLACE VIEW vista_gestion_pedidos AS
SELECT 
    p.id_pedido,
    p.fecha_pedido,
    p.estado AS estado_pedido,
    u.id_usuario AS id_comprador,
    u.nombre AS nombre_comprador,
    u.email AS email_comprador,
    pr.id_producto,
    pr.nombre AS nombre_producto,
    c.nombre AS categoria_producto,
    dp.cantidad,
    dp.precio_unitario,
    p.total_pagar
FROM pedidos p
JOIN usuarios u ON p.id_usuario = u.id_usuario
JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
JOIN productos pr ON dp.id_producto = pr.id_producto
JOIN categorias c ON pr.id_categoria = c.id_categoria;

CREATE OR REPLACE VIEW vista_pedidos_basica AS
SELECT 
    p.id_pedido,
    u.nombre AS cliente,
    p.fecha_pedido,
    p.estado,
    p.total_pagar
FROM pedidos p
JOIN usuarios u ON p.id_usuario = u.id_usuario;

CREATE OR REPLACE VIEW vista_productos_categorias AS
SELECT 
    pr.id_producto,
    pr.nombre AS producto,
    pr.precio,
    pr.estado_fisico,
    pr.disponible,
    c.id_categoria,
    c.nombre AS categoria,
    c.descripcion AS descripcion_categoria
FROM productos pr
JOIN categorias c ON pr.id_categoria = c.id_categoria;

CREATE OR REPLACE VIEW vista_productos_vendedores AS
SELECT 
    pr.id_producto,
    pr.nombre AS producto,
    pr.precio,
    pr.estado_fisico,
    u.nombre AS vendedor,
    u.email AS correo_vendedor,
    u.telefono AS telefono_vendedor
FROM productos pr
JOIN usuarios u ON pr.id_usuario = u.id_usuario;

**CONSULTAR VISTAS**
SELECT * FROM vista_pedidos_basica;
SELECT * FROM vista_gestion_pedidos;
SELECT * FROM  vista_productos_vendedores;
SELECT * FROM  vista_productos_categorias;

**CONSULTAR DATOS ESPECIFICOS DE TABLAS**
SELECT nombre
FROM usuarios 
WHERE email = 'carlos@example.com';

