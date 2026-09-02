from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

# Importa todos los modelos de SQLAlchemy para que Base los reconozca y cree las tablas
from app.models.pais_de_origen import PaisDeOrigenModel
from app.models.categorias import CategoriaModel
from app.models.usuario import UsuarioModel
from app.models.producto import ProductoModel
from app.models.pedido import PedidoModel
from app.models.detalle_pedido import DetallePedidoModel
from app.models.red_social import RedSocialModel
from app.models.rol import Rol
from app.models.roles_usuarios import RolUsuarioModel

from app.routes import (
    categorias_route,
    usuario_route,
    producto_route,
    pedido_route,
    detalle_pedido_route,
    pais_de_origen_route,
    red_social_route,
    rol_route,
    roles_usuarios_route
)

# 1. Inicializar FastAPI
app = FastAPI(title="API Backend PostgreSQL - 3 Capas", version="1.0")

# 2. Configuración de CORS para permitir la comunicación con el frontend (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Crear todas las tablas en la base de datos
Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Conectado a PostgreSQL y tablas creadas exitosamente"}

# 4. Incluir todos los routers
app.include_router(categorias_route.router)
app.include_router(usuario_route.router)
app.include_router(producto_route.router)
app.include_router(pedido_route.router)
app.include_router(detalle_pedido_route.router)
app.include_router(pais_de_origen_route.router)
app.include_router(red_social_route.router)
app.include_router(rol_route.router)
app.include_router(roles_usuarios_route.router)