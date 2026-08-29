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
