"""Detalle del pedido: lineas de un pedido (producto, cantidad, subtotal) y rutas /detalles-pedido/.
Incluye las fallas conocidas (xfail) del detalle."""
import pytest

from tests.conftest import estado_de, stock_de


def test_el_detalle_guarda_pedido_producto_y_cantidad(producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]
    pedido = hacer_pedido([(pid, 3)]).json()["data"]
    detalle = pedido["detalles"][0]

    assert detalle["id_pedidos"] == pedido["id_pedidos"]
    assert detalle["id_productos"] == pid
    assert detalle["cantidad"] == 3


def test_hay_un_detalle_por_cada_producto_del_pedido(client, payload_producto, hacer_pedido):
    ids = []
    for nombre in ("Libro", "Cuaderno", "Regla"):
        payload_producto["nombre_producto"] = nombre
        ids.append(client.post("/productos/", json=payload_producto).json()["data"]["id_productos"])

    pedido = hacer_pedido([(i, 1) for i in ids]).json()["data"]

    assert sorted(d["id_productos"] for d in pedido["detalles"]) == sorted(ids)


# ===========================================================================
# 7. Detalle del pedido  (rutas /detalles-pedido/)
# ===========================================================================
@pytest.fixture()
def detalle(producto_creado, hacer_pedido):
    """Un pedido con una sola linea; devuelve esa linea."""
    return hacer_pedido([(producto_creado["id_productos"], 2)]).json()["data"]["detalles"][0]


def test_listar_detalles_incluye_los_del_pedido(client, detalle):
    ids = [d["detalle_pedido"] for d in client.get("/detalles-pedido/").json()["data"]]
    assert detalle["detalle_pedido"] in ids


def test_consultar_un_detalle_por_id(client, detalle):
    r = client.get(f"/detalles-pedido/{detalle['detalle_pedido']}")

    assert r.status_code == 200
    assert r.json()["data"]["cantidad"] == 2


def test_consultar_un_detalle_inexistente_devuelve_404(client):
    assert client.get("/detalles-pedido/9999").status_code == 404


def test_actualizar_la_cantidad_de_un_detalle(client, detalle):
    r = client.put(f"/detalles-pedido/{detalle['detalle_pedido']}", json={"cantidad": 1})

    assert r.status_code == 200
    assert r.json()["data"]["cantidad"] == 1


def test_eliminar_un_detalle(client, detalle):
    ident = detalle["detalle_pedido"]

    assert client.delete(f"/detalles-pedido/{ident}").status_code == 200
    assert client.get(f"/detalles-pedido/{ident}").status_code == 404


@pytest.mark.xfail(
    reason="POST /detalles-pedido/ siempre falla: DetallePedidoCreate envia 'precio_unitario' "
           "y DetallePedidoModel no tiene esa columna (TypeError, error 500)",
    strict=False,
)
def test_crear_un_detalle_valido_funciona(client, producto_creado, hacer_pedido):
    pedido_id = hacer_pedido([(producto_creado["id_productos"], 1)]).json()["data"]["id_pedidos"]

    r = client.post("/detalles-pedido/", json={
        "cantidad": 1, "id_productos": producto_creado["id_productos"],
        "id_pedidos": pedido_id, "subtotal": 50000,
    })

    assert r.status_code == 201


@pytest.mark.xfail(
    reason="DetallePedidoService.crear no valida que el producto exista ni el stock "
           "(hoy ni siquiera llega ahi: ver la prueba anterior)",
    strict=False,
)
def test_un_detalle_con_producto_inexistente_es_rechazado(client, producto_creado, hacer_pedido):
    pedido_id = hacer_pedido([(producto_creado["id_productos"], 1)]).json()["data"]["id_pedidos"]

    r = client.post("/detalles-pedido/", json={
        "cantidad": 1, "id_productos": 9999, "id_pedidos": pedido_id, "subtotal": 10,
    })

    assert r.status_code in (400, 404, 422)

