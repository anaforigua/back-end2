"""RF-03 Publicar producto y RF-04 Visualizar productos."""
import pytest


# ------------------------------ Crear -------------------------------------
def test_crear_producto(client, payload_producto):
    r = client.post("/productos/", json=payload_producto)

    assert r.status_code == 201
    data = r.json()["data"]
    assert data["id_productos"] > 0
    assert data["precio"] == 50000.0
    assert data["cantidad"] == 5


def test_crear_producto_incluye_categoria_y_pais(client, payload_producto):
    data = client.post("/productos/", json=payload_producto).json()["data"]
    assert data["categoria"]["nombre_categoria"] == "Tecnologia"
    assert data["pais_de_origen"]["nombre_pais"] == "Colombia"


@pytest.mark.parametrize(
    "cambio",
    [
        {"precio": 0},
        {"precio": -10},
        {"descripcion": ""},
        {"nombre_producto": ""},
        {"cantidad": -1},
    ],
)
def test_crear_producto_datos_invalidos(client, payload_producto, cambio):
    payload_producto.update(cambio)
    assert client.post("/productos/", json=payload_producto).status_code == 422


def test_crear_producto_con_cantidad_cero_devuelve_400(client, payload_producto):
    payload_producto["cantidad"] = 0
    assert client.post("/productos/", json=payload_producto).status_code == 400


def test_crear_producto_categoria_inexistente(client, payload_producto):
    payload_producto["id_categoria"] = 9999
    r = client.post("/productos/", json=payload_producto)
    assert r.status_code == 404
    assert "categor" in r.json()["detail"].lower()


def test_crear_producto_pais_inexistente(client, payload_producto):
    payload_producto["id_pais_de_origen"] = 9999
    r = client.post("/productos/", json=payload_producto)
    assert r.status_code == 404
    assert "pa" in r.json()["detail"].lower()


def test_producto_invalido_no_se_guarda(client, payload_producto):
    payload_producto["precio"] = -1
    client.post("/productos/", json=payload_producto)
    assert client.get("/productos/").json()["data"] == []


def test_listar_productos_vacio(client):
    r = client.get("/productos/")
    assert r.status_code == 200 and r.json()["data"] == []


def test_listar_productos_devuelve_los_publicados(client, payload_producto):
    client.post("/productos/", json=payload_producto)
    payload_producto["nombre_producto"] = "Libro de calculo"
    client.post("/productos/", json=payload_producto)

    data = client.get("/productos/").json()["data"]
    assert len(data) == 2


def test_obtener_producto_inexistente(client):
    assert client.get("/productos/9999").status_code == 404


def test_obtener_producto_por_id(client, producto_creado):
    r = client.get(f"/productos/{producto_creado['id_productos']}")
    assert r.status_code == 200
    assert r.json()["data"]["descripcion"] == "Casio fx-991, poco uso"


def test_actualizar_precio(client, producto_creado):
    pid = producto_creado["id_productos"]
    r = client.put(f"/productos/{pid}", json={"precio": 45000})
    assert r.status_code == 200
    assert r.json()["data"]["precio"] == 45000


def test_actualizar_parcial_no_borra_otros_campos(client, producto_creado):
    pid = producto_creado["id_productos"]
    r = client.put(f"/productos/{pid}", json={"descripcion": "Nueva descripcion"})
    assert r.json()["data"]["precio"] == 50000.0


def test_actualizar_precio_negativo(client, producto_creado):
    pid = producto_creado["id_productos"]
    assert client.put(f"/productos/{pid}", json={"precio": -5}).status_code == 400


def test_actualizar_categoria_inexistente(client, producto_creado):
    pid = producto_creado["id_productos"]
    assert client.put(f"/productos/{pid}", json={"id_categoria": 9999}).status_code == 404


def test_actualizar_producto_inexistente(client):
    assert client.put("/productos/9999", json={"precio": 10}).status_code == 404


def test_eliminar_producto(client, producto_creado):
    pid = producto_creado["id_productos"]
    assert client.delete(f"/productos/{pid}").status_code == 200
    assert client.get(f"/productos/{pid}").status_code == 404


def test_eliminar_producto_inexistente(client):
    assert client.delete("/productos/9999").status_code == 404


def test_no_se_puede_eliminar_producto_con_pedidos(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]
    assert hacer_pedido([(pid, 1)]).status_code == 201

    r = client.delete(f"/productos/{pid}")
    assert r.status_code == 400
    assert client.get(f"/productos/{pid}").status_code == 200