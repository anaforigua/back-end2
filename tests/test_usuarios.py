"""RF-01 Registro de usuario + CRUD de usuarios (API + servicio)."""
import pytest


@pytest.mark.parametrize("roles_ids,esperados", [([2], 1), ([3], 1), ([2, 3], 2)])
def test_crear_usuario_con_roles_validos(client, roles, payload_usuario, roles_ids, esperados):
    payload_usuario["id_roles"] = roles_ids
    r = client.post("/usuarios/", json=payload_usuario)

    assert r.status_code == 201
    cuerpo = r.json()
    assert cuerpo["status"] == "success"
    assert cuerpo["data"]["email"] == payload_usuario["email"]
    assert len(cuerpo["data"]["roles"]) == esperados


def test_crear_usuario_se_guarda_en_la_bd(client, db, roles, payload_usuario):
    from app.models.usuario import UsuarioModel

    client.post("/usuarios/", json=payload_usuario)
    guardado = db.query(UsuarioModel).filter_by(email=payload_usuario["email"]).one()
    assert guardado.nombre == "Ana"


def test_correo_duplicado_devuelve_400(client, roles, payload_usuario):
    assert client.post("/usuarios/", json=payload_usuario).status_code == 201
    r = client.post("/usuarios/", json=payload_usuario)

    assert r.status_code == 400
    assert "correo" in r.json()["detail"].lower()


def test_correo_duplicado_no_crea_segundo_usuario(client, roles, payload_usuario):
    client.post("/usuarios/", json=payload_usuario)
    client.post("/usuarios/", json=payload_usuario)
    assert len(client.get("/usuarios/").json()["data"]) == 1


@pytest.mark.parametrize(
    "cambio",
    [
        {"id_roles": [1]},          # no se puede auto-asignar administrador
        {"id_roles": [99]},
        {"id_roles": []},
        {"nombre": "Al"},
        {"contrasena": "123"},
    ],
)
def test_crear_usuario_datos_invalidos(client, roles, payload_usuario, cambio):
    payload_usuario.update(cambio)
    assert client.post("/usuarios/", json=payload_usuario).status_code == 422


def test_crear_usuario_campo_faltante(client, roles, payload_usuario):
    del payload_usuario["email"]
    assert client.post("/usuarios/", json=payload_usuario).status_code == 422


def test_listar_usuarios_vacio(client):
    r = client.get("/usuarios/")
    assert r.status_code == 200 and r.json()["data"] == []


def test_obtener_usuario_por_id(client, usuario_creado):
    r = client.get(f"/usuarios/{usuario_creado['id_usuarios']}")
    assert r.status_code == 200
    assert r.json()["data"]["email"] == "ana@correo.com"


def test_obtener_usuario_inexistente(client):
    assert client.get("/usuarios/9999").status_code == 404


def test_id_no_numerico(client):
    assert client.get("/usuarios/abc").status_code == 422


# Actualizar
def test_actualizar_datos_basicos(client, usuario_creado):
    uid = usuario_creado["id_usuarios"]
    r = client.put(f"/usuarios/{uid}", json={"ubicacion": "Medellin"})

    assert r.status_code == 200
    assert r.json()["data"]["ubicacion"] == "Medellin"
    assert r.json()["data"]["nombre"] == "Ana"  # lo demas no cambia


def test_actualizar_los_roles(client, usuario_creado):
    uid = usuario_creado["id_usuarios"]
    r = client.put(f"/usuarios/{uid}", json={"id_roles": [3]})

    nombres = [x["nombre_rol"] for x in r.json()["data"]["roles"]]
    assert nombres == ["Comprador"]


def test_actualizar_contrasena(client, usuario_creado, payload_usuario):
    uid = usuario_creado["id_usuarios"]
    r = client.put(f"/usuarios/{uid}", json={"contrasena": payload_usuario["contrasena"]})
    assert r.status_code == 400


def test_actualizar_usuario_inexistente_404(client):
    assert client.put("/usuarios/9999", json={"nombre": "Zoe"}).status_code == 404


# Eliminar
def test_eliminar_usuario(client, usuario_creado):
    uid = usuario_creado["id_usuarios"]
    assert client.delete(f"/usuarios/{uid}").status_code == 200
    assert client.get(f"/usuarios/{uid}").status_code == 404


def test_eliminar_usuario_borra_sus_roles(client, db, usuario_creado):
    from app.models.roles_usuarios import RolUsuarioModel

    uid = usuario_creado["id_usuarios"]
    assert db.query(RolUsuarioModel).filter_by(id_usuario=uid).count() == 1
    client.delete(f"/usuarios/{uid}")
    assert db.query(RolUsuarioModel).filter_by(id_usuario=uid).count() == 0


def test_eliminar_usuario_inexistente_404(client):
    assert client.delete("/usuarios/9999").status_code == 404


def test_eliminar_usuario_borra_sus_pedidos(client, producto_creado, hacer_pedido, usuario_creado):
    pid = hacer_pedido([(producto_creado["id_productos"], 1)]).json()["data"]["id_pedidos"]
    client.delete(f"/usuarios/{usuario_creado['id_usuarios']}")
    assert client.get(f"/pedidos/{pid}").status_code == 404