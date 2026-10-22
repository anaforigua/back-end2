import pytest
from tests.conftest import estado_de, stock_de


def test_crear_pedido_calcula_subtotal_y_descuenta_stock(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]  # precio 50000, stock 5
    r = hacer_pedido([(pid, 2)])

    assert r.status_code == 201
    pedido = r.json()["data"]
    assert pedido["estado_pedido"] == "PENDIENTE"
    assert len(pedido["detalles"]) == 1
    assert pedido["detalles"][0]["subtotal"] == 100000.0
    assert pedido["detalles"][0]["cantidad"] == 2
    assert stock_de(client, pid) == 3


def test_pedido_con_varios_productos_calcula_cada_subtotal(client, payload_producto, hacer_pedido):
    ids = []
    for nombre, precio in (("Libro", 20000.0), ("Cuaderno", 5000.0)):
        payload_producto.update(nombre_producto=nombre, precio=precio)
        ids.append(client.post("/productos/", json=payload_producto).json()["data"]["id_productos"])

    r = hacer_pedido([(ids[0], 1), (ids[1], 3)])

    subtotales = sorted(d["subtotal"] for d in r.json()["data"]["detalles"])
    assert subtotales == [15000.0, 20000.0]


def test_comprar_todo_el_stock_marca_producto_agotado(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]
    assert hacer_pedido([(pid, 5)]).status_code == 201

    assert stock_de(client, pid) == 0
    assert estado_de(client, pid) == "Agotado"


def test_pedido_queda_guardado_y_consultable(client, producto_creado, hacer_pedido):
    pedido_id = hacer_pedido([(producto_creado["id_productos"], 1)]).json()["data"]["id_pedidos"]
    r = client.get(f"/pedidos/{pedido_id}")
    assert r.status_code == 200
    assert len(client.get("/pedidos/").json()["data"]) == 1



def test_pedido_usuario_inexistente(client, producto_creado, hacer_pedido):
    r = hacer_pedido([(producto_creado["id_productos"], 1)], id_usuarios=9999)
    assert r.status_code == 404


def test_pedido_producto_inexistente(hacer_pedido):
    assert hacer_pedido([(9999, 1)]).status_code == 404


@pytest.mark.parametrize("cantidad", [0, -1])
def test_pedido_cantidad_no_positiva(client, producto_creado, hacer_pedido, cantidad):
    pid = producto_creado["id_productos"]
    assert hacer_pedido([(pid, cantidad)]).status_code == 400
    assert stock_de(client, pid) == 5


def test_pedido_stock_insuficiente_y_no_cambia_stock(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]
    r = hacer_pedido([(pid, 6)])

    assert r.status_code == 400
    assert "stock" in r.json()["detail"].lower()
    assert stock_de(client, pid) == 5
    assert client.get("/pedidos/").json()["data"] == []


def test_pedido_sin_detalles(hacer_pedido):
    assert hacer_pedido([]).status_code == 422


def test_pedido_con_un_item_invalido_no_descuenta_ninguno(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]
    r = hacer_pedido([(pid, 1), (9999, 1)])
    assert r.status_code == 404
    assert stock_de(client, pid) == 5


def test_cancelar_pedido_devuelve_stock(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]
    pedido_id = hacer_pedido([(pid, 5)]).json()["data"]["id_pedidos"]
    assert estado_de(client, pid) == "Agotado"

    r = client.put(f"/pedidos/{pedido_id}", json={"estado_pedido": "CANCELADO"})

    assert r.status_code == 200
    assert stock_de(client, pid) == 5
    assert estado_de(client, pid) == "Disponible"


def test_cancelar_dos_veces_no_devuelve_stock_dos_veces(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]
    pedido_id = hacer_pedido([(pid, 2)]).json()["data"]["id_pedidos"]

    client.put(f"/pedidos/{pedido_id}", json={"estado_pedido": "CANCELADO"})
    client.put(f"/pedidos/{pedido_id}", json={"estado_pedido": "CANCELADO"})

    assert stock_de(client, pid) == 5  # no 7


@pytest.mark.parametrize("estado_final", ["COMPLETADO", "ENTREGADO"])
def test_no_se_puede_cancelar_pedido_completado_o_entregado(client, producto_creado, hacer_pedido, estado_final):
    pid = producto_creado["id_productos"]
    pedido_id = hacer_pedido([(pid, 1)]).json()["data"]["id_pedidos"]
    client.put(f"/pedidos/{pedido_id}", json={"estado_pedido": estado_final})

    r = client.put(f"/pedidos/{pedido_id}", json={"estado_pedido": "CANCELADO"})

    assert r.status_code == 400
    assert stock_de(client, pid) == 4  # el stock sigue descontado


def test_actualizar_pedido_inexistente(client):
    assert client.put("/pedidos/9999", json={"estado_pedido": "CANCELADO"}).status_code == 404


def test_eliminar_pedido(client, producto_creado, hacer_pedido):
    pedido_id = hacer_pedido([(producto_creado["id_productos"], 1)]).json()["data"]["id_pedidos"]
    assert client.delete(f"/pedidos/{pedido_id}").status_code == 200
    assert client.get(f"/pedidos/{pedido_id}").status_code == 404


def test_eliminar_pedido_inexistente(client):
    assert client.delete("/pedidos/9999").status_code == 404


def test_obtener_pedido_inexistente(client):
    assert client.get("/pedidos/9999").status_code == 404