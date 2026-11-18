# Casos de prueba – Revenfy

**Convención:** PASSED = aprobado; XFAIL = fallo esperado/documentado; NOT EXECUTED = no ejecutado. Los casos reflejan los tests existentes en `tests/`.

## Categorías

| ID | Escenario / datos | Resultado esperado | Estado |
|---|---|---|---|
| CAT-CP-01 | Crear categoría válida (Hogar) | HTTP 201 y nombre persistido | PASSED |
| CAT-CP-02 | Listar categorías | HTTP 200 y categoría registrada en la lista | PASSED |
| CAT-CP-03 | Consultar ID existente | HTTP 200 y datos de la categoría | PASSED |
| CAT-CP-04 | Consultar ID 99999 | HTTP 404 | PASSED |
| CAT-CP-05 | Nombre de 3 caracteres | HTTP 422 por longitud mínima de 4 | PASSED |
| CAT-CP-06 | Nombre de 4 caracteres (Casa) | HTTP 201 | PASSED |
| CAT-CP-07 | Crear nombre duplicado (Tecnologia) | HTTP 400 | PASSED |

## Pedidos

Precondición general: comprador y producto creados mediante fixtures; producto base con precio 50.000 y cantidad 5.

| ID | Escenario / datos | Resultado esperado | Estado |
|---|---|---|---|
| PED-CP-01 | Crear pedido válido, 1 unidad | HTTP 201; estado PENDIENTE | PASSED |
| PED-CP-02 | Asociar pedido al comprador autenticado por fixture | `id_usuarios` coincide con el comprador | PASSED |
| PED-CP-03 | Consultar y listar pedido recién creado | HTTP 200 y pedido persistido | PASSED |
| PED-CP-04 | 4 unidades a $50.000 | Subtotal $200.000 | PASSED |
| PED-CP-05 | Dos productos con precios/cantidades diferentes | Cada subtotal usa su propio precio | PASSED |
| PED-CP-06 | 2×$20.000 + 3×$5.000 | Total $55.000 incluido en respuesta | PASSED |
| PED-CP-07 | Comprar 2 de 5 unidades | Stock restante 3 | PASSED |
| PED-CP-08 | Comprar unidades de dos productos | Cada inventario se descuenta individualmente | PASSED |
| PED-CP-09 | Comprar las 5 unidades disponibles | Stock 0 y estado Agotado | PASSED |
| PED-CP-10 | Crear pedido con usuario 9999 | HTTP 404; stock sin cambios | PASSED |
| PED-CP-11 | Crear pedido con producto 9999 | HTTP 404 | PASSED |
| PED-CP-12 | Cantidad 0 | HTTP 400; stock intacto | PASSED |
| PED-CP-13 | Cantidad -1 | HTTP 400; stock intacto | PASSED |
| PED-CP-14 | Solicitar 6 unidades cuando hay 5 | HTTP 400; no crear pedido ni alterar stock | PASSED |
| PED-CP-15 | Pedido sin detalles | HTTP 422 por validación del esquema | PASSED |
| PED-CP-16 | Una línea válida y otra con producto inexistente | HTTP 404; ningún stock se descuenta | PASSED |
| PED-CP-17 | Comprar producto con estado Agotado aunque tenga cantidad positiva | HTTP 400 | PASSED |
| PED-CP-18 | Cancelar pedido | HTTP 200; restituye stock y marca Disponible | PASSED |
| PED-CP-19 | Cancelar dos veces | Inventario se restituye una sola vez | PASSED |
| PED-CP-20 | Cancelar pedido COMPLETADO | HTTP 400; stock no se devuelve | PASSED |
| PED-CP-21 | Cancelar pedido ENTREGADO | HTTP 400; stock no se devuelve | PASSED |
| PED-CP-22 | Enviar estados en minúsculas | Estado se normaliza; la transición inválida se rechaza | PASSED |
| PED-CP-23 | Cambiar pedido CANCELADO a COMPLETADO | HTTP 400; pedido permanece cancelado | PASSED |
| PED-CP-24 | Actualizar pedido inexistente 9999 | HTTP 404 | PASSED |
| PED-CP-25 | Consultar/eliminar pedido inexistente | HTTP 404 | PASSED |
| PED-CP-26 | Dos líneas del mismo producto, 3 + 3 con stock 5 | HTTP 400; stock nunca negativo | PASSED |
| PED-CP-27 | Enviar precio_unitario manipulado ($1) | Se ignora el precio del cliente; subtotal usa precio catálogo ($50.000) | PASSED |

## Detalles de pedido

| ID | Escenario | Resultado esperado | Estado |
|---|---|---|---|
| DET-CP-01 | Crear pedido con una línea | Detalle conserva ID de pedido, producto y cantidad | PASSED |
| DET-CP-02 | Pedido con varios productos | Un detalle por cada producto | PASSED |
| DET-CP-03 | Listar detalles | Aparece el detalle creado | PASSED |
| DET-CP-04 | Consultar detalle existente | HTTP 200 y cantidad correcta | PASSED |
| DET-CP-05 | Consultar detalle inexistente | HTTP 404 | PASSED |
| DET-CP-06 | Actualizar cantidad del detalle | HTTP 200 y cantidad actualizada | PASSED |
| DET-CP-07 | Eliminar detalle | HTTP 200; consulta posterior 404 | PASSED |
| DET-CP-08 | Crear detalle por endpoint independiente | HTTP 201 esperado | XFAIL |
| DET-CP-09 | Crear detalle independiente con producto inexistente | HTTP 400/404/422 esperado | XFAIL |

## Ejecución y reproducción

Los resultados se obtienen con `pytest -q`. Para ver el detalle: `pytest tests/test_categorias.py tests/test_pedidos.py tests/test_detalle_pedido.py -v`. Las pruebas XFAIL se conservan como evidencia de pendientes del endpoint independiente de detalles y no deben contarse como defectos del flujo de creación de pedidos.
