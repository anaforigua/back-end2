"""Pruebas funcionales del CRUD de categorías."""
import pytest


@pytest.fixture()
def payload_categoria():
    return {
        "nombre_categoria": "Hogar",
        "descripcion": "Artículos para el hogar",
        "icono_categoria": "home",
    }


def test_crear_categoria_valida(client, payload_categoria):
    r = client.post("/categorias/", json=payload_categoria)
    assert r.status_code == 201
    assert r.json()["data"]["nombre_categoria"] == "Hogar"


def test_listar_categorias(client, categoria):
    r = client.get("/categorias/")
    assert r.status_code == 200
    assert any(c["id_categoria"] == categoria.id_categoria for c in r.json()["data"])


def test_consultar_categoria_existente(client, categoria):
    r = client.get(f"/categorias/{categoria.id_categoria}")
    assert r.status_code == 200
    assert r.json()["data"]["nombre_categoria"] == "Tecnologia"


def test_consultar_categoria_inexistente_devuelve_404(client):
    assert client.get("/categorias/99999").status_code == 404


def test_nombre_categoria_menor_al_minimo_devuelve_422(client, payload_categoria):
    payload_categoria["nombre_categoria"] = "ABC"
    assert client.post("/categorias/", json=payload_categoria).status_code == 422


def test_nombre_categoria_de_cuatro_caracteres_es_aceptado(client, payload_categoria):
    payload_categoria["nombre_categoria"] = "Casa"
    assert client.post("/categorias/", json=payload_categoria).status_code == 201


def test_categoria_duplicada_devuelve_400(client, categoria, payload_categoria):
    payload_categoria["nombre_categoria"] = "Tecnologia"
    r = client.post("/categorias/", json=payload_categoria)
    assert r.status_code == 400
