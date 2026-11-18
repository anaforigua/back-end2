# Matriz de trazabilidad – Revenfy

La siguiente matriz relaciona reglas observables del backend con pruebas automatizadas. Los IDs son identificadores de auditoría de este proyecto, no los RF/RN de la API ficticia TechStore del ejemplo del material de clase.

| ID | Requisito / regla verificable | Casos relacionados | Cobertura |
|---|---|---|---|
| CAT-01 | Crear categoría válida | CAT-CP-01 | Cubierto |
| CAT-02 | Listar categorías | CAT-CP-02 | Cubierto |
| CAT-03 | Consultar categoría existente | CAT-CP-03 | Cubierto |
| CAT-04 | Categoría inexistente retorna 404 | CAT-CP-04 | Cubierto |
| CAT-05 | Nombre menor al mínimo es rechazado | CAT-CP-05 | Cubierto |
| CAT-06 | Nombre en longitud mínima es aceptado | CAT-CP-06 | Cubierto |
| CAT-07 | No permitir categoría duplicada | CAT-CP-07 | Cubierto (respuesta actual 400) |
| PED-01 | Crear pedido con estado inicial PENDIENTE | PED-CP-01 | Cubierto |
| PED-02 | Asociar pedido al comprador existente | PED-CP-02 | Cubierto |
| PED-03 | Persistir pedido y permitir consulta/listado | PED-CP-03 | Cubierto |
| PED-04 | Calcular subtotal = precio catálogo × cantidad | PED-CP-04, PED-CP-05 | Cubierto |
| PED-05 | Total = suma de subtotales y se devuelve en respuesta | PED-CP-06 | Cubierto tras corrección |
| PED-06 | Descontar inventario según cantidades | PED-CP-07, PED-CP-08 | Cubierto |
| PED-07 | Stock cero cambia estado a Agotado | PED-CP-09 | Cubierto |
| PED-08 | Rechazar comprador inexistente | PED-CP-10 | Cubierto |
| PED-09 | Rechazar producto inexistente | PED-CP-11 | Cubierto |
| PED-10 | Cantidad debe ser mayor que cero | PED-CP-12, PED-CP-13 | Cubierto |
| PED-11 | Rechazar pedido superior al stock | PED-CP-14 | Cubierto |
| PED-12 | Rechazar pedido sin detalles | PED-CP-15 | Cubierto |
| PED-13 | Fallo de una línea no debe descontar inventario de otras | PED-CP-16 | Cubierto |
| PED-14 | Solo productos disponibles se pueden comprar | PED-CP-17 | Cubierto tras corrección |
| PED-15 | Cancelar devuelve inventario una sola vez | PED-CP-18, PED-CP-19 | Cubierto |
| PED-16 | No cancelar pedidos completados/entregados | PED-CP-20, PED-CP-21 | Cubierto |
| PED-17 | Estado se normaliza sin distinguir mayúsculas | PED-CP-22 | Cubierto |
| PED-18 | Pedido cancelado no puede reactivarse | PED-CP-23 | Cubierto tras corrección |
| PED-19 | Actualizar/eliminar/consultar pedido inexistente | PED-CP-24, PED-CP-25 | Cubierto |
| PED-20 | Líneas repetidas acumulan cantidades para validar stock | PED-CP-26 | Cubierto tras corrección |
| DET-01 | Guardar detalle con pedido, producto y cantidad | DET-CP-01, DET-CP-02 | Cubierto |
| DET-02 | Consultar/listar/actualizar/eliminar detalle | DET-CP-03 a DET-CP-07 | Cubierto |
| DET-03 | Crear detalle por endpoint independiente | DET-CP-08 | Pendiente: prueba marcada XFAIL |
| DET-04 | Rechazar producto inexistente en detalle independiente | DET-CP-09 | Pendiente: prueba marcada XFAIL |

## Observaciones

- Los seis defectos del flujo de pedidos fueron corregidos y sus pruebas quedaron activas como regresión.
- Permanecen dos pruebas `XFAIL` del recurso independiente `/detalles-pedido/`; no corresponden a los defectos de `POST /pedidos/`.
- La cobertura funcional indicada no sustituye la medición de cobertura de líneas (`pytest-cov`).
