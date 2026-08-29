from fastapi import FastAPI
from app.database import engine, Base

# Importa todos los modelos de SQLAlchemy para que Base los reconozca y cree las tablas
from app.models.pais_de_origen import PaisDeOrigenModel
from app.models.categorias import CategoriaModel
from app.models.usuario import UsuarioModel
from app.models.producto import ProductoModel
from app.models.pedido import PedidoModel
from app.models.detalle_pedido import DetallePedidoModel
from app.models.red_social import RedSocialModel

from app.routes import (
    categorias_route,
    usuario_route,
    producto_route,
    pedido_route,
    detalle_pedido_route,
    pais_de_origen_route,
    red_social_route
)

# Crea todas las tablas en la base de datos (SQLite o PostgreSQL)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Backend PostgreSQL - 3 Capas", version="1.0")

app.include_router(categorias_route.router)
app.include_router(usuario_route.router)
app.include_router(producto_route.router)
app.include_router(pedido_route.router)
app.include_router(detalle_pedido_route.router)
app.include_router(pais_de_origen_route.router)
app.include_router(red_social_route.router)