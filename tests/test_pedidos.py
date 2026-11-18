"""Pedidos de Revenfy (MVP Gestion de Pedidos): crear, subtotal, stock, validaciones, estados,
consultar/eliminar y reglas de negocio. El detalle del pedido esta en test_detalle_pedido.py."""
import pytest

from tests.conftest import estado_de, stock_de


# ===========================================================================
# 1. Crear el pedido
# ===========================================================================
def test_crear_pedido_devuelve_201_con_estado_pendiente(producto_creado, hacer_pedido):
    r = hacer_pedido([(producto_creado["id_productos"], 1)])

    assert r.status_code == 201
    assert r.json()["data"]["estado_pedido"] == "PENDIENTE"


def test_el_pedido_queda_asociado_al_comprador(usuario_creado, producto_creado, hacer_pedido):
    pedido = hacer_pedido([(producto_creado["id_productos"], 1)]).json()["data"]
    assert pedido["id_usuarios"] == usuario_creado["id_usuarios"]


def test_el_pedido_queda_guardado_y_se_puede_consultar(client, producto_creado, hacer_pedido):
    pedido_id = hacer_pedido([(producto_creado["id_productos"], 1)]).json()["data"]["id_pedidos"]

    assert client.get(f"/pedidos/{pedido_id}").status_code == 200
    assert len(client.get("/pedidos/").json()["data"]) == 1


# ===========================================================================
# 2. Subtotal y total
# ===========================================================================
def test_el_subtotal_es_precio_por_cantidad(producto_creado, hacer_pedido):
    pedido = hacer_pedido([(producto_creado["id_productos"], 4)]).json()["data"]
    assert pedido["detalles"][0]["subtotal"] == 4 * 50000.0


def test_cada_producto_calcula_su_propio_subtotal(client, payload_producto, hacer_pedido):
    ids = []
    for nombre, precio in (("Libro", 20000.0), ("Cuaderno", 5000.0)):
        payload_producto.update(nombre_producto=nombre, precio=precio)
        ids.append(client.post("/productos/", json=payload_producto).json()["data"]["id_productos"])

    pedido = hacer_pedido([(ids[0], 1), (ids[1], 3)]).json()["data"]

    assert sorted(d["subtotal"] for d in pedido["detalles"]) == [15000.0, 20000.0]


def test_la_suma_de_subtotales_da_el_total_del_pedido(client, payload_producto, hacer_pedido):
    ids = {}
    for nombre, precio in (("Libro", 20000.0), ("Cuaderno", 5000.0)):
        payload_producto.update(nombre_producto=nombre, precio=precio)
        ids[nombre] = client.post("/productos/", json=payload_producto).json()["data"]["id_productos"]

    pedido = hacer_pedido([(ids["Libro"], 2), (ids["Cuaderno"], 3)]).json()["data"]

    assert sum(d["subtotal"] for d in pedido["detalles"]) == 2 * 20000.0 + 3 * 5000.0


# ===========================================================================
# 3. Stock y estado del producto
# ===========================================================================
def test_el_pedido_descuenta_el_stock(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]  # stock inicial: 5
    hacer_pedido([(pid, 2)])
    assert stock_de(client, pid) == 3


def test_una_compra_parcial_deja_el_producto_disponible(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]
    hacer_pedido([(pid, 2)])
    assert estado_de(client, pid) == "Disponible"


def test_cada_producto_descuenta_su_propio_stock(client, payload_producto, hacer_pedido):
    ids = []
    for nombre in ("Libro", "Cuaderno"):
        payload_producto["nombre_producto"] = nombre
        ids.append(client.post("/productos/", json=payload_producto).json()["data"]["id_productos"])

    hacer_pedido([(ids[0], 1), (ids[1], 4)])

    assert stock_de(client, ids[0]) == 4
    assert stock_de(client, ids[1]) == 1


def test_comprar_todo_el_stock_marca_el_producto_como_agotado(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]
    assert hacer_pedido([(pid, 5)]).status_code == 201

    assert stock_de(client, pid) == 0
    assert estado_de(client, pid) == "Agotado"


def test_un_articulo_unico_no_se_puede_pedir_dos_veces(client, payload_producto, hacer_pedido):
    """Caso tipico de segunda mano: una sola unidad."""
    payload_producto["cantidad"] = 1
    pid = client.post("/productos/", json=payload_producto).json()["data"]["id_productos"]

    assert hacer_pedido([(pid, 1)]).status_code == 201
    assert hacer_pedido([(pid, 1)]).status_code == 400


# ===========================================================================
# 4. Validaciones al pedir
# ===========================================================================
def test_un_comprador_inexistente_no_puede_pedir(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]

    assert hacer_pedido([(pid, 1)], id_usuarios=9999).status_code == 404
    assert stock_de(client, pid) == 5


def test_un_producto_inexistente_devuelve_404(hacer_pedido):
    assert hacer_pedido([(9999, 1)]).status_code == 404


@pytest.mark.parametrize("cantidad", [0, -1])
def test_la_cantidad_debe_ser_mayor_a_cero(client, producto_creado, hacer_pedido, cantidad):
    pid = producto_creado["id_productos"]

    assert hacer_pedido([(pid, cantidad)]).status_code == 400
    assert stock_de(client, pid) == 5


def test_no_se_puede_pedir_mas_que_el_stock(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]
    r = hacer_pedido([(pid, 6)])

    assert r.status_code == 400
    assert "stock" in r.json()["detail"].lower()
    assert stock_de(client, pid) == 5
    assert client.get("/pedidos/").json()["data"] == []


def test_un_pedido_sin_detalles_devuelve_422(hacer_pedido):
    assert hacer_pedido([]).status_code == 422


def test_si_un_producto_falla_no_se_descuenta_ninguno(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]

    assert hacer_pedido([(pid, 1), (9999, 1)]).status_code == 404
    assert stock_de(client, pid) == 5


# ===========================================================================
# 5. Estados del pedido
# ===========================================================================
def test_cancelar_un_pedido_devuelve_el_stock(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]
    pedido_id = hacer_pedido([(pid, 5)]).json()["data"]["id_pedidos"]
    assert estado_de(client, pid) == "Agotado"

    r = client.put(f"/pedidos/{pedido_id}", json={"estado_pedido": "CANCELADO"})

    assert r.status_code == 200
    assert stock_de(client, pid) == 5
    assert estado_de(client, pid) == "Disponible"


def test_cancelar_dos_veces_no_devuelve_el_stock_dos_veces(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]
    pedido_id = hacer_pedido([(pid, 2)]).json()["data"]["id_pedidos"]

    client.put(f"/pedidos/{pedido_id}", json={"estado_pedido": "CANCELADO"})
    client.put(f"/pedidos/{pedido_id}", json={"estado_pedido": "CANCELADO"})

    assert stock_de(client, pid) == 5  # no 7


@pytest.mark.parametrize("estado_final", ["COMPLETADO", "ENTREGADO"])
def test_no_se_puede_cancelar_un_pedido_completado_o_entregado(client, producto_creado, hacer_pedido, estado_final):
    pid = producto_creado["id_productos"]
    pedido_id = hacer_pedido([(pid, 1)]).json()["data"]["id_pedidos"]
    client.put(f"/pedidos/{pedido_id}", json={"estado_pedido": estado_final})

    r = client.put(f"/pedidos/{pedido_id}", json={"estado_pedido": "CANCELADO"})

    assert r.status_code == 400
    assert stock_de(client, pid) == 4  # el stock sigue descontado


def test_el_estado_no_distingue_mayusculas_de_minusculas(client, producto_creado, hacer_pedido):
    pedido_id = hacer_pedido([(producto_creado["id_productos"], 1)]).json()["data"]["id_pedidos"]
    client.put(f"/pedidos/{pedido_id}", json={"estado_pedido": "completado"})

    r = client.put(f"/pedidos/{pedido_id}", json={"estado_pedido": "cancelado"})

    assert r.status_code == 400


def test_actualizar_un_pedido_inexistente_devuelve_404(client):
    assert client.put("/pedidos/9999", json={"estado_pedido": "CANCELADO"}).status_code == 404


# ===========================================================================
# 6. Consultar y eliminar pedidos
# ===========================================================================
def test_listar_pedidos_sin_datos_devuelve_lista_vacia(client):
    r = client.get("/pedidos/")
    assert r.status_code == 200 and r.json()["data"] == []


def test_consultar_un_pedido_inexistente_devuelve_404(client):
    assert client.get("/pedidos/9999").status_code == 404


def test_eliminar_un_pedido(client, producto_creado, hacer_pedido):
    pedido_id = hacer_pedido([(producto_creado["id_productos"], 1)]).json()["data"]["id_pedidos"]

    assert client.delete(f"/pedidos/{pedido_id}").status_code == 200
    assert client.get(f"/pedidos/{pedido_id}").status_code == 404


def test_eliminar_un_pedido_inexistente_devuelve_404(client):
    assert client.delete("/pedidos/9999").status_code == 404


# ===========================================================================
# 8. Regresion de defectos corregidos
#    Estas pruebas quedan activas para evitar que los defectos reaparezcan.
# ===========================================================================
def test_el_pedido_devuelve_el_total(client, payload_producto, hacer_pedido):
    ids = []
    for nombre, precio in (("Libro", 20000.0), ("Cuaderno", 5000.0)):
        payload_producto.update(nombre_producto=nombre, precio=precio)
        ids.append(client.post("/productos/", json=payload_producto).json()["data"]["id_productos"])

    pedido = hacer_pedido([(ids[0], 2), (ids[1], 3)]).json()["data"]

    assert pedido["total"] == 55000.0


def test_un_producto_no_disponible_no_se_puede_pedir(client, payload_producto, hacer_pedido):
    payload_producto["estado_producto"] = "Agotado"
    pid = client.post("/productos/", json=payload_producto).json()["data"]["id_productos"]

    assert hacer_pedido([(pid, 1)]).status_code == 400


def test_un_producto_vendido_queda_en_estado_vendido(client, payload_producto, hacer_pedido):
    payload_producto["cantidad"] = 1
    pid = client.post("/productos/", json=payload_producto).json()["data"]["id_productos"]

    hacer_pedido([(pid, 1)])

    assert estado_de(client, pid) == "Agotado"


def test_el_precio_enviado_por_el_cliente_se_ignora(producto_creado, usuario_creado, client):
    pid = producto_creado["id_productos"]  # precio real: 50000
    r = client.post("/pedidos/", json={
        "tipo_de_pago": "Efectivo", "estado_pedido": "PENDIENTE",
        "id_usuarios": usuario_creado["id_usuarios"],
        "detalles": [{"cantidad": 1, "id_productos": pid, "precio_unitario": 1}],
    })

    assert r.json()["data"]["detalles"][0]["subtotal"] == 50000.0


def test_lineas_repetidas_no_pueden_superar_el_stock(client, producto_creado, hacer_pedido):
    pid = producto_creado["id_productos"]  # stock 5

    r = hacer_pedido([(pid, 3), (pid, 3)])  # pide 6 en total

    assert r.status_code == 400
    assert stock_de(client, pid) >= 0


def test_un_pedido_cancelado_no_puede_completarse(client, producto_creado, hacer_pedido):
    pedido_id = hacer_pedido([(producto_creado["id_productos"], 1)]).json()["data"]["id_pedidos"]
    client.put(f"/pedidos/{pedido_id}", json={"estado_pedido": "CANCELADO"})

    r = client.put(f"/pedidos/{pedido_id}", json={"estado_pedido": "COMPLETADO"})

    assert r.status_code == 400
