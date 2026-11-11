import copy
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from app.models.categorias import CategoriaModel
from app.models.pais_de_origen import PaisDeOrigenModel
from app.models.producto import ProductoModel
from app.models.rol import Rol
from app.models import (
    detalle_pedido, pedido, red_social, roles_usuarios, usuario,
)
from app.routes import (
    categorias_route,
    detalle_pedido_route,
    pais_de_origen_route,
    pedido_route,
    producto_route,
    red_social_route,
    rol_route,
    roles_usuarios_route,
    usuario_route,
)


def crear_app() -> FastAPI:
    app = FastAPI()
    for modulo in (
        usuario_route, rol_route, roles_usuarios_route, categorias_route,
        pais_de_origen_route, producto_route, pedido_route,
        detalle_pedido_route, red_social_route,
    ):
        app.include_router(modulo.router)
    return app


@pytest.fixture()
def db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


@pytest.fixture()
def client(db):
    app = crear_app()

    def _get_db_prueba():
        yield db

    app.dependency_overrides[get_db] = _get_db_prueba
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def roles(db):
    """Crea los 3 roles del sistema. Quedan con id 1, 2 y 3."""
    creados = [Rol(nombre_rol=n) for n in ("Administrador", "Vendedor", "Comprador")]
    db.add_all(creados)
    db.commit()
    return creados


@pytest.fixture()
def categoria(db):
    c = CategoriaModel(
        nombre_categoria="Tecnologia",
        descripcion="Equipos y accesorios",
        icono_categoria="laptop",
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@pytest.fixture()
def pais(db):
    p = PaisDeOrigenModel(nombre_pais="Colombia")
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


_USUARIO = {
    "nombre": "Ana",
    "apellidos": "Lopez",
    "avatar": "ana.png",
    "biografia": "Aprendiz de ADSO",
    "ubicacion": "Bogota",
    "email": "ana@correo.com",
    "contrasena": "secreto123",
    "calificacion": 0.0,
    "estado_usuario": "activo",
    "id_roles": [2],
}


@pytest.fixture()
def payload_usuario():
    return copy.deepcopy(_USUARIO)


@pytest.fixture()
def usuario_creado(client, roles, payload_usuario):
    r = client.post("/usuarios/", json=payload_usuario)
    assert r.status_code == 201, r.text
    return r.json()["data"]


@pytest.fixture()
def payload_producto(categoria, pais):
    return {
        "nombre_producto": "Calculadora cientifica",
        "descripcion": "Casio fx-991, poco uso",
        "precio": 50000.0,
        "imagenes_producto": "calc.jpg",
        "condicion_producto": "Usado",
        "estado_producto": "Disponible",
        "cantidad": 5,
        "id_categoria": categoria.id_categoria,
        "id_pais_de_origen": pais.id_pais_de_origen,
    }


@pytest.fixture()
def producto_creado(client, payload_producto):
    r = client.post("/productos/", json=payload_producto)
    assert r.status_code == 201, r.text
    return r.json()["data"]


@pytest.fixture()
def hacer_pedido(client, usuario_creado):
    """Devuelve una funcion para crear pedidos: hacer_pedido([(id_producto, cantidad), ...])."""

    def _hacer(items, **extra):
        body = {
            "tipo_de_pago": "Efectivo",
            "estado_pedido": "PENDIENTE",
            "id_usuarios": usuario_creado["id_usuarios"],
            "detalles": [{"cantidad": c, "id_productos": p} for p, c in items],
        }
        body.update(extra)
        return client.post("/pedidos/", json=body)

    return _hacer


def stock_de(client, id_producto):
    return client.get(f"/productos/{id_producto}").json()["data"]["cantidad"]


def estado_de(client, id_producto):
    return client.get(f"/productos/{id_producto}").json()["data"]["estado_producto"]
