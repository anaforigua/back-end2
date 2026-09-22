--
-- PostgreSQL database dump
--

\restrict MNEs59HzWwT8BexLdfnS8v4XYiVd2QSUqkPj8N2zyh2FVkcUN90SukgoHTIKhBv

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id_categoria integer NOT NULL,
    nombre character varying,
    descripcion text NOT NULL,
    icono_categoria character varying(120) NOT NULL
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- Name: categorias_id_categoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_id_categoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_id_categoria_seq OWNER TO postgres;

--
-- Name: categorias_id_categoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_id_categoria_seq OWNED BY public.categorias.id_categoria;


--
-- Name: detalle_pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_pedido (
    detalle_pedido integer NOT NULL,
    cantidad integer NOT NULL,
    subtotal double precision NOT NULL,
    id_pedidos integer NOT NULL,
    id_productos integer NOT NULL
);


ALTER TABLE public.detalle_pedido OWNER TO postgres;

--
-- Name: detalle_pedido_detalle_pedido_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_pedido_detalle_pedido_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_pedido_detalle_pedido_seq OWNER TO postgres;

--
-- Name: detalle_pedido_detalle_pedido_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_pedido_detalle_pedido_seq OWNED BY public.detalle_pedido.detalle_pedido;


--
-- Name: pais_de_origen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pais_de_origen (
    id_pais_de_origen integer NOT NULL,
    nombre_pais character varying NOT NULL
);


ALTER TABLE public.pais_de_origen OWNER TO postgres;

--
-- Name: pais_de_origen_id_pais_de_origen_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pais_de_origen_id_pais_de_origen_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pais_de_origen_id_pais_de_origen_seq OWNER TO postgres;

--
-- Name: pais_de_origen_id_pais_de_origen_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pais_de_origen_id_pais_de_origen_seq OWNED BY public.pais_de_origen.id_pais_de_origen;


--
-- Name: pedidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos (
    id_pedidos integer NOT NULL,
    fecha timestamp without time zone NOT NULL,
    estado_pedido character varying NOT NULL,
    tipo_de_pago character varying NOT NULL,
    id_usuarios integer NOT NULL
);


ALTER TABLE public.pedidos OWNER TO postgres;

--
-- Name: pedidos_id_pedidos_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedidos_id_pedidos_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedidos_id_pedidos_seq OWNER TO postgres;

--
-- Name: pedidos_id_pedidos_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedidos_id_pedidos_seq OWNED BY public.pedidos.id_pedidos;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    id_productos integer NOT NULL,
    nombre character varying NOT NULL,
    descripcion text NOT NULL,
    precio double precision NOT NULL,
    imagenes_producto character varying NOT NULL,
    condicion_producto character varying NOT NULL,
    estado_producto character varying NOT NULL,
    cantidad integer NOT NULL,
    fecha_publicacion timestamp without time zone NOT NULL,
    id_categoria integer NOT NULL,
    id_pais_de_origen integer NOT NULL
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- Name: productos_id_productos_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_id_productos_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_id_productos_seq OWNER TO postgres;

--
-- Name: productos_id_productos_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_id_productos_seq OWNED BY public.productos.id_productos;


--
-- Name: red_social; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.red_social (
    id_red_social integer NOT NULL,
    nombre character varying NOT NULL,
    url_base character varying NOT NULL
);


ALTER TABLE public.red_social OWNER TO postgres;

--
-- Name: red_social_id_red_social_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.red_social_id_red_social_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.red_social_id_red_social_seq OWNER TO postgres;

--
-- Name: red_social_id_red_social_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.red_social_id_red_social_seq OWNED BY public.red_social.id_red_social;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id_rol integer NOT NULL,
    nombre_rol character varying NOT NULL,
    descripcion character varying
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_rol_seq OWNER TO postgres;

--
-- Name: roles_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_rol_seq OWNED BY public.roles.id_rol;


--
-- Name: roles_usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles_usuarios (
    id_rol_usuario integer NOT NULL,
    id_usuario integer NOT NULL,
    id_rol integer NOT NULL
);


ALTER TABLE public.roles_usuarios OWNER TO postgres;

--
-- Name: roles_usuarios_id_rol_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_usuarios_id_rol_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_usuarios_id_rol_usuario_seq OWNER TO postgres;

--
-- Name: roles_usuarios_id_rol_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_usuarios_id_rol_usuario_seq OWNED BY public.roles_usuarios.id_rol_usuario;


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_usuarios integer NOT NULL,
    nombre character varying NOT NULL,
    apellidos character varying NOT NULL,
    avatar character varying NOT NULL,
    biografia text NOT NULL,
    ubicacion character varying NOT NULL,
    email character varying NOT NULL,
    calificacion double precision,
    estado_usuario character varying NOT NULL,
    contrasena character varying DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- Name: usuario_id_usuarios_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_usuarios_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_usuarios_seq OWNER TO postgres;

--
-- Name: usuario_id_usuarios_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_usuarios_seq OWNED BY public.usuario.id_usuarios;


--
-- Name: vista_pedidos_pendientes; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_pedidos_pendientes AS
 SELECT pe.id_pedidos,
    pe.fecha,
    pe.estado_pedido,
    pe.tipo_de_pago,
    u.id_usuarios,
    u.nombre,
    u.apellidos,
    u.email
   FROM (public.pedidos pe
     JOIN public.usuario u ON ((pe.id_usuarios = u.id_usuarios)))
  WHERE ((pe.estado_pedido)::text = 'Pendiente'::text);


ALTER VIEW public.vista_pedidos_pendientes OWNER TO postgres;

--
-- Name: vista_productos; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_productos AS
 SELECT p.id_productos,
    p.nombre,
    p.descripcion,
    p.precio,
    p.imagenes_producto,
    p.condicion_producto,
    p.estado_producto,
    p.cantidad,
    p.fecha_publicacion,
    c.nombre AS categoria,
    po.nombre_pais AS pais_de_origen
   FROM ((public.productos p
     JOIN public.categorias c ON ((p.id_categoria = c.id_categoria)))
     JOIN public.pais_de_origen po ON ((p.id_pais_de_origen = po.id_pais_de_origen)));


ALTER VIEW public.vista_productos OWNER TO postgres;

--
-- Name: categorias id_categoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id_categoria SET DEFAULT nextval('public.categorias_id_categoria_seq'::regclass);


--
-- Name: detalle_pedido detalle_pedido; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido ALTER COLUMN detalle_pedido SET DEFAULT nextval('public.detalle_pedido_detalle_pedido_seq'::regclass);


--
-- Name: pais_de_origen id_pais_de_origen; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pais_de_origen ALTER COLUMN id_pais_de_origen SET DEFAULT nextval('public.pais_de_origen_id_pais_de_origen_seq'::regclass);


--
-- Name: pedidos id_pedidos; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN id_pedidos SET DEFAULT nextval('public.pedidos_id_pedidos_seq'::regclass);


--
-- Name: productos id_productos; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN id_productos SET DEFAULT nextval('public.productos_id_productos_seq'::regclass);


--
-- Name: red_social id_red_social; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.red_social ALTER COLUMN id_red_social SET DEFAULT nextval('public.red_social_id_red_social_seq'::regclass);


--
-- Name: roles id_rol; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id_rol SET DEFAULT nextval('public.roles_id_rol_seq'::regclass);


--
-- Name: roles_usuarios id_rol_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_usuarios ALTER COLUMN id_rol_usuario SET DEFAULT nextval('public.roles_usuarios_id_rol_usuario_seq'::regclass);


--
-- Name: usuario id_usuarios; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuarios SET DEFAULT nextval('public.usuario_id_usuarios_seq'::regclass);


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (id_categoria, nombre, descripcion, icono_categoria) FROM stdin;
1	Tecnología	Dispositivos y accesorios electrónicos	uhvkvkv
2	Hogar	Muebles, elementos decorativos y art¡culos para el hogar	hogar
3	Ropa y accesorios	Prendas de vestir, calzado y accesorios personales	ropa
4	Deportes	Art¡culos, equipos y accesorios deportivos	deportes
5	Libros y estudio	Libros, materiales y elementos utilizados para estudio	libros
6	Videojuegos	Consolas, videojuegos y accesorios para videojuegos	videojuegos
\.


--
-- Data for Name: detalle_pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_pedido (detalle_pedido, cantidad, subtotal, id_pedidos, id_productos) FROM stdin;
1	2	48000	1	1
4	2	1250000	3	1
5	1	1250000	3	1
6	2	2500000	6	1
7	4	5000000	7	1
8	4	5000000	8	1
3	1	3200000	3	3
9	1	1800000	9	4
10	2	1600000	10	5
11	1	1450000	11	6
12	3	540000	12	7
13	2	900000	13	8
14	4	280000	13	9
\.


--
-- Data for Name: pais_de_origen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pais_de_origen (id_pais_de_origen, nombre_pais) FROM stdin;
1	Colombia
2	 Alemania
3	Estados Unidos
4	Jap¢n
5	China
6	Corea del Sur
7	Espa¤a
8	Francia
9	Italia
10	M‚xico
11	Brasil
\.


--
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos (id_pedidos, fecha, estado_pedido, tipo_de_pago, id_usuarios) FROM stdin;
2	2026-09-02 14:14:17.688266	Confirmado	Tarjeta de crédito	1
3	2026-09-02 14:14:58.944137	Confirmado	Tarjeta de crédito	1
4	2026-09-02 22:39:45.648586	PENDIENTE	Efectivo	1
5	2026-09-02 22:41:09.248145	PENDIENTE	Efectivo	1
6	2026-09-02 22:46:12.664646	PENDIENTE	Efectivo	1
7	2026-09-02 22:47:58.501149	PENDIENTE	Efectivo	1
1	2026-09-02 14:13:33.33779	ENTREGADO	Tarjeta de crédito	1
8	2026-09-02 23:03:34.567151	PENDIENTE	Tarjeta de crédito	1
9	2026-09-22 11:48:19.436959	PENDIENTE	Efectivo	4
10	2026-09-22 11:48:19.436959	Confirmado	Tarjeta de cr‚dito	5
11	2026-09-22 11:48:19.436959	PENDIENTE	Efectivo	7
12	2026-09-22 11:48:19.436959	Confirmado	Tarjeta de cr‚dito	8
13	2026-09-22 11:48:19.436959	ENTREGADO	Efectivo	10
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id_productos, nombre, descripcion, precio, imagenes_producto, condicion_producto, estado_producto, cantidad, fecha_publicacion, id_categoria, id_pais_de_origen) FROM stdin;
2	Vintage	ropa vieja de buena calidad	45662		Usado - Como nuevo	Disponible	1	2026-09-02 15:54:43.524657	1	2
3	PlayStation 5 Slim 1TB	Consola PS5 Slim edición de disco, incluye 1 mando DualSense original y cables de conexión.	2100000	https://ejemplo.com/imagenes/ps5_slim.jpg	Usado	Disponible	1	2026-09-02 22:21:46.62128	1	1
1	Smartphone Galaxy A54	Teléfono inteligente con 128GB de almacenamiento y cámara de alta resolución	1250000	https://example.com/images/galaxy-a54.jpg	Nuevo	Agotado	0	2026-08-31 20:42:42	1	1
4	Laptop Lenovo IdeaPad 3	Laptop para estudio y trabajo, en buen estado y con funcionamiento adecuado.	1800000	/productos/laptop-lenovo.jpg	Usado - Muy bueno	DISPONIBLE	2	2026-09-22 11:47:02.23696	1	5
5	Bicicleta MTB GW	Bicicleta de monta¤a usada, adecuada para desplazamientos y actividades deportivas.	800000	/productos/bicicleta-mtb.jpg	Usado - Bueno	DISPONIBLE	3	2026-09-22 11:47:02.23696	4	1
6	Nintendo Switch OLED	Consola Nintendo Switch OLED usada, en buen estado de funcionamiento.	1450000	/productos/nintendo-switch-oled.jpg	Usado - Muy bueno	DISPONIBLE	1	2026-09-22 11:47:02.23696	6	4
7	Chaqueta deportiva Adidas	Chaqueta deportiva usada en buen estado, adecuada para actividades deportivas y uso casual.	180000	/productos/chaqueta-adidas.jpg	Usado - Bueno	DISPONIBLE	4	2026-09-22 11:47:02.23696	3	2
8	Escritorio de madera	Escritorio usado de madera, funcional y adecuado para estudio o trabajo.	450000	/productos/escritorio-madera.jpg	Usado - Bueno	DISPONIBLE	2	2026-09-22 11:47:02.23696	2	1
9	Libro Python para principiantes	Libro introductorio de programaci¢n en Python, utilizado para aprendizaje y pr ctica.	70000	/productos/libro-python.jpg	Usado - Bueno	DISPONIBLE	5	2026-09-22 11:47:02.23696	5	7
\.


--
-- Data for Name: red_social; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.red_social (id_red_social, nombre, url_base) FROM stdin;
3	Twitter / X	https://example.com/icons/x.png
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id_rol, nombre_rol, descripcion) FROM stdin;
1	administrador	Rol con acceso total al sistema
2	comprador	Rol asignado a usuarios con permisos de compra y gestión de pedidos dentro de la plataforma
3	vendedor	Rol asignado a usuarios con permisos para publicar productos, gestionar su inventario y atender transacciones dentro de la plataforma
\.


--
-- Data for Name: roles_usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles_usuarios (id_rol_usuario, id_usuario, id_rol) FROM stdin;
3	3	3
4	1	1
5	4	2
6	4	3
7	5	2
8	6	3
9	7	2
10	7	3
11	8	2
12	9	3
13	10	2
14	10	3
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id_usuarios, nombre, apellidos, avatar, biografia, ubicacion, email, calificacion, estado_usuario, contrasena) FROM stdin;
1	Ana	Forigua	url_imagen	Estudiante	Bogotá	ana@correo.com	5	activo	
3	Mariana	G¢mez	https://example.com/avatars/mariana.png	Ciclista aficionada y creadora de contenido outdoor.	Medell¡n, Colombia	mariana.gomez@email.com	4.9	Activo	
4	Carlos	Rodr¡guez	/avatars/carlos.jpg	Usuario de prueba de Revenfy interesado en productos de segunda mano.	Bogot 	carlos.rodriguez@revenfy.test	5	ACTIVO	Revenfy123
5	Valentina	Mart¡nez	/avatars/valentina.jpg	Usuario de prueba interesado en comprar y vender productos.	Bogot 	valentina.martinez@revenfy.test	4.8	ACTIVO	Revenfy123
6	Sebasti n	L¢pez	/avatars/sebastian.jpg	Usuario de prueba de la comunidad Revenfy.	Bogot 	sebastian.lopez@revenfy.test	4.7	ACTIVO	Revenfy123
7	Camila	Torres	/avatars/camila.jpg	Usuario de prueba interesado en productos en buen estado.	Bogot 	camila.torres@revenfy.test	4.9	ACTIVO	Revenfy123
8	Daniel	Hern ndez	/avatars/daniel.jpg	Usuario de prueba para validar la gesti¢n de pedidos.	Bogot 	daniel.hernandez@revenfy.test	4.6	ACTIVO	Revenfy123
9	Laura	S nchez	/avatars/laura.jpg	Usuario de prueba de compra y venta de productos.	Bogot 	laura.sanchez@revenfy.test	4.8	ACTIVO	Revenfy123
10	Mateo	Ram¡rez	/avatars/mateo.jpg	Usuario de prueba para validar las funcionalidades de Revenfy.	Bogot 	mateo.ramirez@revenfy.test	4.7	ACTIVO	Revenfy123
\.


--
-- Name: categorias_id_categoria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_id_categoria_seq', 6, true);


--
-- Name: detalle_pedido_detalle_pedido_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_pedido_detalle_pedido_seq', 14, true);


--
-- Name: pais_de_origen_id_pais_de_origen_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pais_de_origen_id_pais_de_origen_seq', 11, true);


--
-- Name: pedidos_id_pedidos_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_id_pedidos_seq', 13, true);


--
-- Name: productos_id_productos_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_id_productos_seq', 9, true);


--
-- Name: red_social_id_red_social_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.red_social_id_red_social_seq', 1, false);


--
-- Name: roles_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_rol_seq', 3, true);


--
-- Name: roles_usuarios_id_rol_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_usuarios_id_rol_usuario_seq', 14, true);


--
-- Name: usuario_id_usuarios_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_usuarios_seq', 10, true);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id_categoria);


--
-- Name: detalle_pedido detalle_pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_pkey PRIMARY KEY (detalle_pedido);


--
-- Name: pais_de_origen pais_de_origen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pais_de_origen
    ADD CONSTRAINT pais_de_origen_pkey PRIMARY KEY (id_pais_de_origen);


--
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id_pedidos);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id_productos);


--
-- Name: red_social red_social_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.red_social
    ADD CONSTRAINT red_social_pkey PRIMARY KEY (id_red_social);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- Name: roles_usuarios roles_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_usuarios
    ADD CONSTRAINT roles_usuarios_pkey PRIMARY KEY (id_rol_usuario);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuarios);


--
-- Name: ix_categorias_id_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_categorias_id_categoria ON public.categorias USING btree (id_categoria);


--
-- Name: ix_categorias_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_categorias_nombre ON public.categorias USING btree (nombre);


--
-- Name: ix_detalle_pedido_detalle_pedido; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_detalle_pedido_detalle_pedido ON public.detalle_pedido USING btree (detalle_pedido);


--
-- Name: ix_pais_de_origen_id_pais_de_origen; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_pais_de_origen_id_pais_de_origen ON public.pais_de_origen USING btree (id_pais_de_origen);


--
-- Name: ix_pedidos_id_pedidos; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_pedidos_id_pedidos ON public.pedidos USING btree (id_pedidos);


--
-- Name: ix_productos_id_productos; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_productos_id_productos ON public.productos USING btree (id_productos);


--
-- Name: ix_red_social_id_red_social; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_red_social_id_red_social ON public.red_social USING btree (id_red_social);


--
-- Name: ix_roles_id_rol; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_roles_id_rol ON public.roles USING btree (id_rol);


--
-- Name: ix_roles_nombre_rol; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_roles_nombre_rol ON public.roles USING btree (nombre_rol);


--
-- Name: ix_roles_usuarios_id_rol_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_roles_usuarios_id_rol_usuario ON public.roles_usuarios USING btree (id_rol_usuario);


--
-- Name: ix_usuario_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_usuario_email ON public.usuario USING btree (email);


--
-- Name: ix_usuario_id_usuarios; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_usuario_id_usuarios ON public.usuario USING btree (id_usuarios);


--
-- Name: detalle_pedido detalle_pedido_id_pedidos_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_id_pedidos_fkey FOREIGN KEY (id_pedidos) REFERENCES public.pedidos(id_pedidos);


--
-- Name: detalle_pedido detalle_pedido_id_productos_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_id_productos_fkey FOREIGN KEY (id_productos) REFERENCES public.productos(id_productos);


--
-- Name: pedidos pedidos_id_usuarios_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_id_usuarios_fkey FOREIGN KEY (id_usuarios) REFERENCES public.usuario(id_usuarios);


--
-- Name: productos productos_id_categoria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria);


--
-- Name: productos productos_id_pais_de_origen_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_id_pais_de_origen_fkey FOREIGN KEY (id_pais_de_origen) REFERENCES public.pais_de_origen(id_pais_de_origen);


--
-- Name: roles_usuarios roles_usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_usuarios
    ADD CONSTRAINT roles_usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol);


--
-- Name: roles_usuarios roles_usuarios_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_usuarios
    ADD CONSTRAINT roles_usuarios_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuarios);


--
-- PostgreSQL database dump complete
--

\unrestrict MNEs59HzWwT8BexLdfnS8v4XYiVd2QSUqkPj8N2zyh2FVkcUN90SukgoHTIKhBv

